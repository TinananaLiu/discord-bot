import dotenv from "dotenv";

dotenv.config();

const config = {
  discordToken: process.env.TOKEN,
  rulesMessageId: "1297131739012927488",
  rulesChannelId: "1288321069668765707",
  startHereChannelId: "1297136179124240404",
  onboardRoleId: "1297186072635117639",
  signUpChannelId: "1301435298957361202",
  guildId: process.env.GUILD_ID
};

export default config;
