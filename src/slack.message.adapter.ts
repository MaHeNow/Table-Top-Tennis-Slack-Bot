import { createMessageAdapter } from '@slack/interactive-messages';
import { dataSource } from './data-source';
import { slackClient } from './slack.client';
import { Match } from './database/entities/match.entity';
require("dotenv").config();

const slackMessageAdapter = createMessageAdapter(process.env.SLACK_SIGNING_SECRET ?? "");

slackMessageAdapter.action({actionId: "submit_button"}, async (payload, respond) => {
    const values = payload.state.values;

    const firstPlayer: string = values.player_1_section['first_player_select-action'].selected_user;
    const fistPlayerScore: number = parseInt(values.player_1_score['first_player_score-action'].value);
    const secondPlayer: string = values.player_2_section['second_player_select-action'].selected_user;
    const secondPlayerScore: number = parseInt(values.player_2_score['second_player_score-action'].value);
    const matchDate: string = values.date_section.match_date.selected_date;
    
    if (fistPlayerScore !== NaN && secondPlayerScore !== NaN) {
        const matchData = {
            date: matchDate,
            player1ID: firstPlayer,
            player2ID: secondPlayer,
            player1Score: fistPlayerScore,
            player2Score: secondPlayerScore
        }

        const match = await dataSource.getRepository(Match).create(matchData);
        const result = await dataSource.getRepository(Match).save(match);
        console.log('Match added to database result: ', result);

        const firstPlayerWon = fistPlayerScore > secondPlayerScore;
        const winner = firstPlayerWon ? firstPlayer : secondPlayer;
        const looser = firstPlayerWon ? secondPlayer : firstPlayer;
        const winnerScore = firstPlayerWon ? fistPlayerScore : secondPlayerScore;
        const looserScore = firstPlayerWon ? secondPlayerScore : fistPlayerScore;

        const message = `<@${winner}> won against <@${looser}>. The score is ${winnerScore}:${looserScore}`;

        slackClient.chat.postMessage({
            channel: process.env.CHANNEL ?? "",
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

slackMessageAdapter.action({actionId: "cancel_button"}, (_payload, respond) => {
    respond({
        'response_type': 'ephemeral',
        'text': '',
        'replace_original': true,
        'delete_original': true
    });
});

slackMessageAdapter.action({actionId: "match_date"}, (_payload, _respond) => {});
slackMessageAdapter.action({actionId: "first_player_select-action"}, (_payload, _respond) => {});
slackMessageAdapter.action({actionId: "second_player_select-action"}, (_payload, _respond) => {});

export { slackMessageAdapter };
