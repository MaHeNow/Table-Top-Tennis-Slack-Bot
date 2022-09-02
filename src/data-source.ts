import { DataSource } from "typeorm";
import { Match } from "./database/entities/match.entity";
require("dotenv").config();

export const dataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: process.env.PORT as unknown as number,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: true,
    entities: [Match]
});