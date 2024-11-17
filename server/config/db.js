import pgPromise from "pg-promise";
import config from "./config.js";

const pgp = pgPromise();
const db = pgp({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  ssl: true
});

export default db;