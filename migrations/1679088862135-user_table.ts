import {MigrationInterface, QueryRunner} from "typeorm";

export class userTable1679088862135 implements MigrationInterface {
    name = 'userTable1679088862135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "onevsone" ("id" character varying NOT NULL, "player1" character varying NOT NULL, "player2" character varying NOT NULL, "winner" character varying NOT NULL, "loser" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT '"2023-03-17T21:34:22.671Z"', CONSTRAINT "PK_23ecbb8154fe4d2b93d633c95f4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "onevsone"`);
    }

}
