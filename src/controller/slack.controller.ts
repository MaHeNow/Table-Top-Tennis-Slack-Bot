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
        
        let userID: string = req.body.user_id;
        let currentDate = new Date();
        // transforms the date into a string with the format yyyy-mm-dd
        let dateString = currentDate.toISOString().split('T')[0];

        slackClient.chat.postEphemeral({
            channel: '#tischtennis',
            text: "Submit Match",
            user: userID,
            blocks: [
                {
                    "type": "section",
                    "block_id": "date_section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Wann hat das Spiel stattgefunden?"
                    },
                    "accessory": {
                        "type": "datepicker",
                        "action_id": "match_date",
                        "initial_date": dateString,
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Wähle ein Datum aus"
                        }
                    }
                },
                {
                    "type": "section",
                    "block_id": "player_1_section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Spieler 1"
                    },
                    "accessory": {
                        "type": "users_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Wähle einen Spieler aus!",
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
                        "text": "Spieler 1 Score",
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
                        "text": "Spieler 2"
                    },
                    "accessory": {
                        "type": "users_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Wähle einen Spieler aus!",
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
                        "text": "Spieler 2 Score",
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
                            "text": "Abschicken!"
                        },
                        "value": "submit",
                        "style": "primary",
                        "action_id": "submit_button"
                      },
                      {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Abbrechen!"
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


    public async requestRanking(req: Request, resp: Response) {
        await postRankingMessage();
        resp.send();
    }


    public routes() {
        this.router.post('/requestLogging', this.requestMatchLogging);
        this.router.post('/requestRanking', this.requestRanking);
    }

}
