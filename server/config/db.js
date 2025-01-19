import pgPromise from "pg-promise";
import config from "./config.js";

const pgp = pgPromise();
const db = pgp({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  ssl: false
});

try {
  const result = await db.one("SELECT NOW() as current_time");
  console.log("✅ Database connected successfully!");
  console.log("Server time:", result.current_time);
} catch (error) {
  console.error("❌ Failed to connect to the database:", error.message);
}

export default db;
