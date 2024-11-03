import { Client, GatewayIntentBits, Events, Partials } from "discord.js";
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import {
  getWelcomeMessage,
  getUserInfoModal,
  submitUserInfoModal
} from "./interactions/userOnboard.js";
import {
  signUpCourseForm,
  submitCourseForm
} from "./interactions/signupCourse.js";
import {
  getTimeForm,
  updateTimeCache,
  submitTimeForm
} from "./interactions/addTime.js";
import { getSearchForm, submitSearchForm } from "./interactions/searchTime.js";

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
  partials: [Partials.Message, Partials.Reaction, Partials.Channel]
});

/**
 * @type {Object.<string, { date: Date, startTime: number, endTime: number}>}
 * @description In-memory map to cache user selections for teacher add available time
 * @property {string} key - User's discord id
 * @property {Date} value.date
 * @property {number} value.startTime - 24 hour
 * @property {number} value.endTime  - 24 hour
 */
const timeSelectionsMap = new Map();

/**
 * @type {Object.<string, { channelIds: string[]}>}
 * @description In-memory map to cache user selections for student add role
 * @property {string} key - User's discord id
 * @property {string[]} value.chanelIds
 */
const userSelections = new Map();

// Maps to dynamically route interactions to respective handlers
const customIdHandlers = {
  openModal: argsWrapper(getUserInfoModal, chatBotClient),
  userInfoModal: submitUserInfoModal,
  selectCourse: argsWrapper(signUpCourseForm, userSelections),
  btn_course: argsWrapper(submitCourseForm, userSelections),
  ddl_startTime: argsWrapper(updateTimeCache, timeSelectionsMap),
  ddl_endTime: argsWrapper(updateTimeCache, timeSelectionsMap),
  btn_timeslot: argsWrapper(submitTimeForm, timeSelectionsMap),
  ddl_teacher: submitSearchForm
};

const commandNameHandlers = {
  "add-available-time": argsWrapper(getTimeForm, timeSelectionsMap),
  "search-available-time": getSearchForm
};

/**
 * @function createInteractionHandler
 * @description Wraps the interaction handler function with additional arguments
 * @param {Function} func - Handler function
 * @param {...any} args - Additional arguments to pass to the handler
 * @returns {Function} - A new function that executes the handler with the specified arguments
 */
function argsWrapper(func, ...args) {
  return async (interaction) => {
    await func(interaction, ...args);
  };
}

/**
 * @async
 * @function handleInteraction
 * @description Determines the appropriate handler for the interaction and executes it
 * @param {Interaction} interaction - Discord interaction object triggered by user
 */
async function handleInteraction(interaction) {
  let handler;

  if (interaction.isChatInputCommand()) {
    handler = commandNameHandlers[interaction.commandName];
  } else {
    handler = customIdHandlers[interaction.customId];
  }

  if (!handler) {
    return;
  }

  await handler(interaction);
}

chatBotClient.once(Events.ClientReady, () => {
  console.log("Bot is online!");
});

chatBotClient.on(Events.GuildMemberAdd, async (member) => {
  await getWelcomeMessage(member);
});

chatBotClient.on(Events.InteractionCreate, async (interaction) => {
  await handleInteraction(interaction);
});

// Login Discord
chatBotClient.login(process.env.TOKEN);
