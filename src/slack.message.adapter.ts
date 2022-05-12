import { createMessageAdapter } from '@slack/interactive-messages';
import { dataSource } from './data-source';
import { slackClient } from './slack.client';
import { Match } from './database/entities/match.entity';
require("dotenv").config();

const slackMessageAdapter = createMessageAdapter(process.env.SLACK_SIGNING_SECRET || "");

slackMessageAdapter.action({actionId: "submit_button"}, async (payload, respond) => {

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

slackMessageAdapter.action({actionId: "cancel_button"}, (payload, respond) => {

    respond({
        'response_type': 'ephemeral',
        'text': '',
        'replace_original': true,
        'delete_original': true
    });
});

slackMessageAdapter.action({actionId: "match_date"}, (payload, respond) => {});
slackMessageAdapter.action({actionId: "first_player_select-action"}, (payload, respond) => {});
slackMessageAdapter.action({actionId: "second_player_select-action"}, (payload, respond) => {});

export { slackMessageAdapter };