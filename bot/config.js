import dotenv from "dotenv";

dotenv.config();

const config = {
  discordToken: process.env.TOKEN,
  rulesMessageId: "1297131739012927488",
  rulesChannelId: "1288321069668765707",
  startHereChannelId: "1297136179124240404",
  studentsRoleId: "1297186072635117639",
};

export default config;