import { WebClient } from "@slack/web-api";
require("dotenv").config();

export const slackClient: WebClient = new WebClient(process.env.SLACK_BOT_TOKEN); 