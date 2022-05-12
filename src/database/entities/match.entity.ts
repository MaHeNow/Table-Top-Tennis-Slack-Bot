import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Match {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: string;

    @Column()
    player1ID: string;

    @Column()
    player2ID: string;

    @Column()
    player1Score: number;

    @Column()
    player2Score: number;
    
}