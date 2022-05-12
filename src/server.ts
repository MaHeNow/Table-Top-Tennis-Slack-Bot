import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import { MatchController } from './controller/match.controller';
import { SlackController } from './controller/slack.controller';
import { createMessageAdapter, SlackMessageAdapter } from '@slack/interactive-messages';
import { dataSource } from "./data-source"
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
        this.slackMessageAdapter.action({actionId: "submit_button"}, (payload, respond) => {

            let values = payload.state.values;

            let first_player: string = values.player_1_section['first_player_select-action'].selected_user;
            let first_player_score: string = values.player_1_score['first_player_score-action'].value;
            let second_player: string = values.player_2_section['second_player_select-action'].selected_user;
            let second_player_score: string = values.player_2_score['second_player_score-action'].value;
            let match_date: string = values.date_section.match_date.selected_date;
            
            console.log(first_player);
            console.log(first_player_score);
            console.log(second_player);
            console.log(second_player_score);
            console.log(match_date);

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

        this.app.use('/api/matches/', this.matchController.router);
        this.app.use('/api/slack/', this.slackController.router);
        this.app.get("/", (req: Request, res: Response) => {
            res.send("Hello World");
        });
    }

    public start() {
        this.app.listen(this.app.get('port'), () => {
            console.log(`The Server is listening on port ${this.app.get('port')}.`);
        });
    }
}

const server = new Server();
server.start();