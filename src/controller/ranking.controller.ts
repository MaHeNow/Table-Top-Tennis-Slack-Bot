import { Router, Response, Request } from "express";
import { slackClient } from "../slack.client";
import { getUsersWithScores } from "../utils";

export class RankingController {
    
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    
    public async get(req: Request, res: Response) {

        const userIDsWithScores = await getUsersWithScores();
        const users = (await slackClient.users.list()).members;

        const usersWithScores = userIDsWithScores.map((value) => {

            const [userID, score] = value;
            const userObject = users?.find(user => user.id == userID);
            const userName = userObject?.real_name;

            return {user: userName, score: score};
        }) ;


        res.send({
            "usersWithScores": usersWithScores
        });
    }

    public routes() {
        this.router.get('/', this.get);
    }

}