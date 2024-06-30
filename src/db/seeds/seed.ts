import {logger} from '../../logger';

import format from 'pg-format';
import {db} from '../';

import {VolUser} from '../data/types';

import * as authUtils from '../../auth/auth-utils';
const {hashPassword} = authUtils;

function setupSessionTable() {
  logger.debug("Setting up session table!");

  return db
      .query(`DROP TABLE IF EXISTS session;`)
      .then(() => {
        return db
          .query(
            `CREATE TABLE "session" (
              "sid" varchar NOT NULL COLLATE "default",
              "sess" json NOT NULL,
              "expire" timestamp(6) NOT NULL
            )
            WITH (OIDS=FALSE);`)
      })
      .then(() => {
        return db.query(
            `ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") 
                NOT DEFERRABLE INITIALLY IMMEDIATE;`);
      })
      .then(() => {
        return db.query(
            `CREATE INDEX "IDX_session_expire" ON "session" ("expire");`);
      });
}

export function seed(volUsers: VolUser[]) {
  logger.debug("Setting up vol_user table!");
  
  return db
      .query(`DROP TABLE IF EXISTS vol_user;`)
      .then(() => {
        return db
          .query(
            `CREATE TABLE vol_user (
              vol_id SERIAL PRIMARY KEY,
              vol_email VARCHAR(200) NOT NULL,
              vol_password VARCHAR(100) NOT NULL,
              vol_first_name VARCHAR(100) NOT NULL,
              vol_last_name VARCHAR(100) NOT NULL,
              vol_contact_tel VARCHAR(50),
              vol_avatar BYTEA,
              vol_bio TEXT,
              vol_hours INT,
              vol_badges INT
            );`
          );
      })
      .then(() => {
        const insertVolUsersQueryStr = format(
          `INSERT INTO vol_user (
            vol_first_name,
            vol_last_name,
            vol_email,
            vol_password,
            vol_contact_tel,
            vol_bio,
            vol_hours
          ) VALUES %L;`,
          volUsers.map((volUser) => {
            return [
              volUser.vol_first_name,
              volUser.vol_last_name,
              volUser.vol_email,
              hashPassword(volUser.vol_password),
              volUser.vol_contact_tel,
              volUser.vol_bio,
              volUser.vol_hours
            ];
          })
        );

        return db.query(insertVolUsersQueryStr);
      })
      .then(() => {
        return setupSessionTable();
      });
}