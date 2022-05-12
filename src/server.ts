import express from 'express';
import bodyParser from 'body-parser';
import { RankingController } from './controller/ranking.controller';
import { SlackController } from './controller/slack.controller';
import { SlackMessageAdapter } from '@slack/interactive-messages';
import { dataSource } from "./data-source"
import { slackMessageAdapter } from './slack.message.adapter';
import { initializeScheduledJobs } from './scheduled.jos';
require("dotenv").config();


class Server {

    private app: express.Application;
    private rankingController: RankingController;
    private slackController: SlackController;
    private slackMessageAdapter: SlackMessageAdapter;

    constructor() {
        this.app = express();

        this.configuration();

        initializeScheduledJobs();
    
        this.slackMessageAdapter = slackMessageAdapter;
        
        this.app.use('/api/interactive_message/', this.slackMessageAdapter.requestListener());

        // needed to use the request body in functions called by an endpoint
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        this.rankingController = new RankingController();
        this.slackController = new SlackController();
        this.routes();

        dataSource.initialize()
            .then(() => {
                console.log("Data Source has been initialized.");
            })
            .catch((err) => {
                console.log(err)
            });
    }

    public configuration() {
        this.app.set('port', 3000);
    }

    public async routes() {
        this.app.use('/api/ranking/', this.rankingController.router);
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