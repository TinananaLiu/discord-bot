import dotenv from "dotenv";

dotenv.config();

const config = {

  app:{
    port: process.env.PORT || 3000,                         // Default to 3000
    environment: process.env.NODE_ENV || 'development',     // Default to development
  },

  db:{
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    user: process.env.USER_NAME,
    password: process.env.PASSWORD,
  },

}

export default config;