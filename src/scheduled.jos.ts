import CronJob from 'node-cron';
import { postRankingMessage } from './utils';

export function initializeScheduledJobs() {

    const postRankingJob = CronJob.schedule("* 18 * * *", () => {
        postRankingMessage();
        console.log("Ranking Posted");
    });

    postRankingJob.start();
}