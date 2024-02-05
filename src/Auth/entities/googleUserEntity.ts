import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'googleusers'})
export class GoogleUsers {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    email:string;

    @Column()
    displayName:string;
}