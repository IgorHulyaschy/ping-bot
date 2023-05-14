import {MigrationInterface, QueryRunner} from "typeorm";

export class userTable1679091092903 implements MigrationInterface {
    name = 'userTable1679091092903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "twovstwo" ("id" character varying NOT NULL, "pair1" jsonb NOT NULL, "pair2" jsonb NOT NULL, "winner" jsonb NOT NULL, "loser" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT '"2023-03-17T22:11:33.431Z"', CONSTRAINT "PK_a713d01656d19523bb076c61cd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "onevsone" ALTER COLUMN "createdAt" SET DEFAULT '"2023-03-17T22:11:33.423Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onevsone" ALTER COLUMN "createdAt" SET DEFAULT '2023-03-17 21:34:22.671'`);
        await queryRunner.query(`DROP TABLE "twovstwo"`);
    }

}
