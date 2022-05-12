import { dataSource } from "./data-source";
import { Match } from "./database/entities/match.entity";
import { slackClient } from "./slack.client";


export async function getUsersWithScores() {

    const matches: Match[] = await dataSource.getRepository(Match).find();
    let userToScores: {[userID: string]: number} = {};

    for (const match of matches) {

        let player1Won = match.player1Score > match.player2Score;
        let winner = player1Won ? match.player1ID : match.player2ID;
        let looser = player1Won ? match.player2ID : match.player1ID;

        if (!(winner in userToScores)) userToScores[winner] = 3
        else userToScores[winner] += 3;

        if (!(looser in userToScores)) userToScores[looser] = 0;

    }

    const usersWithScores = Object.keys(userToScores).map(function (key) {
        return [key, userToScores[key]];
    });

    usersWithScores.sort((first, second) => (second[1] as number) - (first[1] as number));

    return usersWithScores;
}


export async function postRankingMessage() {

    const usersWithScores = await getUsersWithScores();
    let blocks = []; 
    let rankingIndex = 1;
    let previousUserScore = 0;

    for (const entry of usersWithScores) {

        const [user, score] = entry;
        if (score < previousUserScore) rankingIndex++;

        blocks.push(
            {
                "type": "divider"
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*${rankingIndex}*  <@${user}>`
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*Punkte:* ${score}`
                    }
                ]
            },
        );

        previousUserScore = score as number;
    };

    slackClient.chat.postMessage({
        channel: '#tischtennis',
        text: 'Ranking',
        blocks: [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Ranking :trophy:",
                    "emoji": true
                }
            },
            ...blocks
        ]
    });
}