import { Router, Response, Request } from "express";
import { MatchEntity } from "../database/entities/match.entity";

export class MatchController {
    
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    
    public async create(req: Request, res: Response) {
        res.send("create");
    }

    public async index(req: Request, res: Response) {
        res.send('index')
    }

    public routes() {
        this.router.post('/', this.create);
        this.router.get('/', this.index);
    }

}