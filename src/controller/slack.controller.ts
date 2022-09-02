import { Router, Response, Request } from "express";
import { slackClient } from "../slack.client";
import { postRankingMessage } from "../utils";

export class SlackController {
    
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    
    public requestMatchLogging(req: Request, res: Response) {
        const userID: string = req.body.user_id;
        const currentDate = new Date();
        // transforms the date into a string with the format yyyy-mm-dd
        const dateString = currentDate.toISOString().split('T')[0];

        slackClient.chat.postEphemeral({
            channel: process.env.CHANNEL ?? "",
            text: "Submit Match",
            user: userID,
            blocks: [
                {
                    "type": "section",
                    "block_id": "date_section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "When did the game take place?"
                    },
                    "accessory": {
                        "type": "datepicker",
                        "action_id": "match_date",
                        "initial_date": dateString,
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Pick a date"
                        }
                    }
                },
                {
                    "type": "section",
                    "block_id": "player_1_section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Player 1"
                    },
                    "accessory": {
                        "type": "users_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a player!",
                            "emoji": true
                        },
                        "action_id": "first_player_select-action"
                    }
                },
                {
                    "type": "input",
                    "block_id": "player_1_score",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "first_player_score-action"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Player 1 Score",
                        "emoji": true
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "block_id": "player_2_section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Player 2"
                    },
                    "accessory": {
                        "type": "users_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a player!",
                            "emoji": true
                        },
                        "action_id": "second_player_select-action"
                    }
                }, 
                {
                    "type": "input",
                    "block_id": "player_2_score",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "second_player_score-action"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Player 2 Score",
                        "emoji": true
                    }
                },
                {
                    "type": "actions",
                    "block_id": "actions1",
                    "elements": [
                      {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Submit!"
                        },
                        "value": "submit",
                        "style": "primary",
                        "action_id": "submit_button"
                      },
                      {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Cancel!"
                        },
                        "value": "cancel",
                        "style": "danger",
                        "action_id": "cancel_button"
                      }
                    ]
                }
            ]
        });

        res.send();
    }

    public async requestRanking(_req: Request, resp: Response) {
        await postRankingMessage();
        resp.send();
    }

    public routes() {
        this.router.post('/requestLogging', this.requestMatchLogging);
        this.router.post('/requestRanking', this.requestRanking);
    }
}
