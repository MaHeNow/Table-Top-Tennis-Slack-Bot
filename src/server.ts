import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import { MatchController } from './controller/match.controller';
import { SlackController } from './controller/slack.controller';
import { createMessageAdapter, SlackMessageAdapter } from '@slack/interactive-messages';
import { dataSource } from "./data-source"
import { Match } from './database/entities/match.entity';
import { slackClient } from './slack.client'
require("dotenv").config();


class Server {

    private app: express.Application;
    private matchController: MatchController;
    private slackController: SlackController;
    private slackMessageAdapter: SlackMessageAdapter;

    constructor() {
        this.app = express();

        this.slackMessageAdapter = createMessageAdapter(process.env.SLACK_SIGNING_SECRET || "");
        
        this.configuration();
        
        this.configureSlackMessageAdapter();
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        this.matchController = new MatchController();
        this.slackController = new SlackController();
        this.routes();

        dataSource.initialize()
            .then(() => {
                console.log("Data Source has been initialized.");
            })
            .catch((err) => {
                console.log(err)
            })
    }

    public configureSlackMessageAdapter() {
        this.slackMessageAdapter.action({actionId: "submit_button"}, async (payload, respond) => {

            let values = payload.state.values;

            let first_player: string = values.player_1_section['first_player_select-action'].selected_user;
            let first_player_score: number = parseInt(values.player_1_score['first_player_score-action'].value);
            let second_player: string = values.player_2_section['second_player_select-action'].selected_user;
            let second_player_score: number = parseInt(values.player_2_score['second_player_score-action'].value);
            let match_date: string = values.date_section.match_date.selected_date;
            
            console.log(first_player);
            console.log(first_player_score);
            console.log(second_player);
            console.log(second_player_score);
            console.log(match_date);

            if (first_player_score !== NaN && second_player_score !== NaN) {
                const matchData = {
                    date: match_date,
                    player1ID: first_player,
                    player2ID: second_player,
                    player1Score: first_player_score,
                    player2Score: second_player_score
                }

                const match = await dataSource.getRepository(Match).create(matchData);
                const result = await dataSource.getRepository(Match).save(match);
                console.log('Match added to database result: ', result);

                let message = "";

                if (first_player_score !== second_player_score) {
                    let first_player_won = first_player_score > second_player_score;
                    let winner = first_player_won ? first_player : second_player;
                    let looser = first_player_won ? second_player : first_player;
                    let winner_score = first_player_won ? first_player_score : second_player_score;
                    let looser_score = first_player_won ? second_player_score : first_player_score;

                    message = `<@${winner}> hat ${winner_score}:${looser_score} gegen <@${looser}> gewonnen :clown_face: :100: :fire: Damn...`;
                    console.log(message);
                } else {
                    message = `<@${first_player}> und <@${second_player}> haben unentschieden gespielt. ${first_player_score}:${second_player_score}`;
                }

                slackClient.chat.postMessage({
                    channel: '#tischtennis',
                    text: "Message after match submit.",
                    link_names: true,
                    blocks: [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": message,
                            }
                        }            
                    ]
                });
            }

            respond({
                'response_type': 'ephemeral',
                'text': '',
                'replace_original': true,
                'delete_original': true
            });
        })

        this.slackMessageAdapter.action({actionId: "cancel_button"}, (payload, respond) => {

            respond({
                'response_type': 'ephemeral',
                'text': '',
                'replace_original': true,
                'delete_original': true
            });
        });

        this.slackMessageAdapter.action({actionId: "match_date"}, (payload, respond) => {});
        this.slackMessageAdapter.action({actionId: "first_player_select-action"}, (payload, respond) => {});
        this.slackMessageAdapter.action({actionId: "second_player_select-action"}, (payload, respond) => {});

        this.app.use('/api/interactive_message/', this.slackMessageAdapter.requestListener());
    }

    public configuration() {
        this.app.set('port', 3000);
    }

    public async routes() {
        this.app.use('/api/slack/', this.slackController.router);
    }

    public start() {
        this.app.listen(this.app.get('port'), () => {
            console.log(`The Server is listening on port ${this.app.get('port')}.`);
        });
    }
}

const server = new Server();
server.start();