import { DataSource } from "typeorm";
import { Match } from "./database/entities/match.entity";

export const dataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "ttranking",
    password: "ttranking",
    database: "ttranking",
    synchronize: true,
    entities: [Match]
});