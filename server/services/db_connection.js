import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const pgp = pgPromise();
const db = pgp({
  host: process.env.HOST,
  port: process.env.DB_PORT,
  database: process.env.DATABASE,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  ssl: true
});

export default db;