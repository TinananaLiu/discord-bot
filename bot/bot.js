import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
} from "discord.js";
import {
  getWelcomeMessage,
  getUserInfoModal,
  submitUserInfoModal
} from "./interactions/userOnboard.js";
import {
  getTimeForm,
  updateTimeCache,
  submitTimeForm
} from "./interactions/addTime.js"
import {
  getSearchForm,
  submitSearchForm
} from "./interactions/searchTime.js"

import dotenv from "dotenv";

dotenv.config();

const chatBotClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    //fetch non-cached
    Partials.Message,
    Partials.Reaction,
    Partials.Channel
  ]
});

// In-memory map to cache user available time selection
/**
 * @type {Object.<string, { date: Date, startTime: number, endTime: number}>}
 * @property {string} key - User's discord id
 * @property {Object} value - An object  
 * @property {Date} value.date - The date 
 * @property {number} value.startTime
 * @property {number} value.endTime 
 */
const timeSelectionsMap = new Map();

const customIdHandlers = {
  "openModal": argsWrapper(getUserInfoModal, chatBotClient),
  "userInfoModal": submitUserInfoModal,
  "ddl_startTime": argsWrapper(updateTimeCache, timeSelectionsMap),
  "ddl_endTime": argsWrapper(updateTimeCache, timeSelectionsMap),
  "btn_timeslot": argsWrapper(submitTimeForm, timeSelectionsMap),
  "ddl_teacher": submitSearchForm
};

const commandNameHandlers = {
  "add-available-time": argsWrapper(getTimeForm, timeSelectionsMap),
  "search-available-time": getSearchForm
};

chatBotClient.once(Events.ClientReady, () => {
  console.log("Bot is online!");
});

chatBotClient.on(Events.GuildMemberAdd, async (member) => {
  await getWelcomeMessage(member);
});

chatBotClient.on(Events.InteractionCreate, async (interaction) => {
  await handleInteraction(interaction);
})

function argsWrapper(handler, ...args) {
  return async (interaction) => {
    await handler(interaction, ...args);
  }
}

async function handleInteraction(interaction){
  let handler;

  if (interaction.isChatInputCommand()){
    handler = commandNameHandlers[interaction.commandName];
  }
  else{
    handler = customIdHandlers[interaction.customId];
  }

  if (!handler){
    console.log(`No handler for interaction. CustomId: ${interaction.customId}, CommandName: ${interaction.commandName}`);
  }
  
  await handler(interaction);
}

// Login Discord
chatBotClient.login(process.env.TOKEN);
