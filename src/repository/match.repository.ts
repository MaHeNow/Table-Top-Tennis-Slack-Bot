import { EntityRepository, Repository } from "typeorm";
import { MatchEntity } from "../database/entities/match.entity";

@EntityRepository(MatchEntity)
export class MatchRepository extends Repository<MatchEntity> {
    
}