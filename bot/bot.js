import { Client, GatewayIntentBits, Events, Partials } from "discord.js";
import {
  getWelcomeMessage,
  getUserInfoModal,
  submitUserInfoModal,
} from "./interactions/userOnboard.js";
import {
  signUpCourseForm,
  submitCourseForm,
} from "./interactions/signUpCourse.js";
import {
  getTimeForm,
  updateTimeCache,
  submitTimeForm,
} from "./interactions/addTime.js";
import {
  getSearchForm,
  submitSearchForm,
  getReserveForm,
  submitReserveForm,
  getTimeByUser,
} from "./interactions/searchTime.js";

import {
  signupCourseButton,
  userInfoButton,
} from "./interactions/components/button.js";
import { loadState, saveState } from "./utils/stateManage.js";

import dotenv from "dotenv";
import config from "./config.js";

dotenv.config();

const chatBotClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel],
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
  btn_userinfo: argsWrapper(getUserInfoModal, chatBotClient),
  userInfoModal: argsWrapper(submitUserInfoModal, chatBotClient),
  btn_signup: argsWrapper(signUpCourseForm, userSelections),
  btn_course: argsWrapper(submitCourseForm, userSelections),
  ddl_startTime: argsWrapper(updateTimeCache, timeSelectionsMap),
  ddl_endTime: argsWrapper(updateTimeCache, timeSelectionsMap),
  btn_timeslot: argsWrapper(submitTimeForm, timeSelectionsMap),
  ddl_teacher: submitSearchForm,
  ddl_reserve: submitReserveForm,
};

const commandNameHandlers = {
  "add-available-time": argsWrapper(getTimeForm, timeSelectionsMap),
  "search-available-time": getSearchForm,
  "reserve-available-time": getReserveForm,
  "query-time-schedule": getTimeByUser,
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

chatBotClient.once(Events.ClientReady, async () => {
  console.log("Bot is online!");

  const guild = chatBotClient.guilds.cache.get(config.guildId);
  if (guild) {
    await guild.members.fetch();
    await guild.members.fetch();
    await guild.channels.fetch();
    console.log("refresh cache successfully.");
  }

  // Execute Once: Check Button Status and Pin
  const state = loadState();

  // 1. userInfoButton
  if (!state.hasInitialized.btn_userinfo) {
    try {
      const rulesChannel = chatBotClient.channels.cache.get(
        config.rulesChannelId
      );
      const startHereChannel = chatBotClient.channels.cache.get(
        config.startHereChannelId
      );

      if (!startHereChannel) {
        console.error(`找不到 #start-here 頻道，請檢查頻道 ID 是否正確。`);
      } else {
        const btn_userinfo = userInfoButton();
        const sentMessage = await startHereChannel.send({
          content: `🎉 歡迎新加入的成員！請確保你已在 #${rulesChannel.name} 頻道按過 ✅，然後點擊下方按鈕來完成表單`,
          components: [btn_userinfo],
        });
        await sentMessage.pin();
        console.log("userInfoButton pinned successfully at #start-here.");
        state.hasInitialized.btn_userinfo = true;
        saveState(state);
      }
    } catch (error) {
      console.error("userInfoButton failed:", error);
    }
  } else {
    console.log("userInfoButton already initialized.");
  }

  // 2. signupCourseButton
  if (!state.hasInitialized.btn_signup) {
    try {
      const signUpChannel = chatBotClient.channels.cache.get(
        config.signUpChannelId
      );

      if (!signUpChannel) {
        console.error(`找不到 #sign-up 頻道，請檢查頻道 ID 是否正確。`);
      } else {
        const btn_signup = signupCourseButton();
        const sentMessage = await signUpChannel.send({
          content: "🎓 歡迎來到課程選擇～請點擊以下按鈕來註冊你感興趣的課程！",
          components: [btn_signup],
        });
        await sentMessage.pin();
        console.log("signupCourseButton pinned successfully at #sign-up.");
        state.hasInitialized.btn_signup = true;
        saveState(state);
      }
    } catch (error) {
      console.error("signupCourseButton failed:", error);
    }
  } else {
    console.log("signupCourseButton already initialized.");
  }
});

chatBotClient.on(Events.GuildMemberAdd, async (member) => {
  await getWelcomeMessage(member);
});

chatBotClient.on(Events.InteractionCreate, async (interaction) => {
  await handleInteraction(interaction);
});

// Login Discord
chatBotClient.login(process.env.TOKEN);
