import {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  Partials,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";

import {
  postAvailableTime,
  getAvailableTime,
  postUserInfo
} from "./api/api.js";

import dotenv from "dotenv";
//import axios from "axios";

dotenv.config();

// const apiClient = axios.create({
//   baseURL: "http://localhost:3000/api",
//   headers: {
//     "Content-Type": "application/json"
//   }
// });

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

// In-memory map to cache user selection
const timeSelectionsMap = new Map();

chatBotClient.once(Events.ClientReady, () => {
  console.log("Bot is online!");
});

// Feature 1: New user enter
const rulesMessageId = "1297131739012927488";
const rulesChannelId = "1288321069668765707";
const startHereChannelId = "1297136179124240404";
const studentsRoleId = "1297186072635117639";

chatBotClient.on(Events.GuildMemberAdd, async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    (channel) => channel.name === "welcome-and-rules"
  );
  if (welcomeChannel) {
    await welcomeChannel.send({
      content: `👋 歡迎 ${member.displayName} 加入！請閱讀伺服器規則並點擊本訊息的 ✅ 表情來表示同意規則。`,
      ephemeral: true
    });
  }
});

chatBotClient.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton() && interaction.customId === "openModal") {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member) {
      return await interaction.reply({
        content: "找不到你的資料，請稍後再試。",
        ephemeral: true
      });
    }

    try {
      // 從指定頻道中抓取訊息
      const rulesChannel = chatBotClient.channels.cache.get(rulesChannelId); // 替換為規則頻道 ID
      const rulesMessage = await rulesChannel.messages.fetch(rulesMessageId);

      const hasReacted = rulesMessage.reactions.cache
        .get("✅")
        ?.users.cache.has(interaction.user.id);

      if (!hasReacted) {
        return await interaction.reply({
          content:
            "請先在 #welcome-and-rules 頻道按 ✅ 表情，同意規範後再填寫表單。",
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("userInfoModal")
        .setTitle("基本資料填寫");

      const nameInput = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("你的姓名是？")
        .setStyle(TextInputStyle.Short);

      const ageInput = new TextInputBuilder()
        .setCustomId("age")
        .setLabel("你的年齡是？")
        .setStyle(TextInputStyle.Short);

      const interestsInput = new TextInputBuilder()
        .setCustomId("interests")
        .setLabel("你對 AI 哪些方向感興趣？")
        .setStyle(TextInputStyle.Paragraph);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(ageInput),
        new ActionRowBuilder().addComponents(interestsInput)
      );

      await interaction.showModal(modal);
    } catch (error) {
      console.error("Failed to fetch the rules message:", error);
      await interaction.reply({
        content: "無法找到規則訊息，請聯繫管理員。",
        ephemeral: true
      });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === "userInfoModal") {
    const name = interaction.fields.getTextInputValue("name");
    const age = interaction.fields.getTextInputValue("age");
    const interests = interaction.fields.getTextInputValue("interests");

    console.log(`Name: ${name}`);
    console.log(`Age: ${age}`);
    console.log(`Interests: ${interests}`);

    const userId = interaction.user.id;

    // 按照指定格式組裝資料
    const data = {
      studentName: name,
      age: age,
      interests: interests
    };

    try {
      // 發送資料到後端
      await postUserInfo(data, userId);

      const member = interaction.guild.members.cache.get(userId);
      if (member) {
        await member.roles.add(studentsRoleId);
        await interaction.reply({
          content: `${member.displayName}，你已成功加入社群並獲得 "Students" 身份組！`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "找不到你的資料，請稍後再試。",
          ephemeral: true
        });
      }
    } catch (error) {
      console.error("Error during interaction handling:", error);
      await interaction.reply({
        content: "無法儲存你的資料，請聯繫管理員。",
        ephemeral: true
      });
    }
  }
});

// Interactions
chatBotClient.on(Events.InteractionCreate, async (interaction) => {
  // Command interaction
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    //feature 1 command
    if (commandName === "add-available-time") {
      const date = interaction.options.getInteger("date");
      const parsedDate = parseDate(date.toString());
      const formattedDate = formatDate(parsedDate);

      if (!timeSelectionsMap.has(interaction.user.id)) {
        timeSelectionsMap.set(interaction.user.id, {
          date: parsedDate,
          startTime: null,
          endTime: null
        });
      }

      // Time option array
      const times = Array.from({ length: 10 }, (_, i) => {
        const hour = String(i + 9).padStart(2, "0"); // Ensure hour is two digits
        return {
          label: `${hour}:00`,
          value: `${hour}:00`
        };
      });

      const btn_timeslot = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("btn_timeslot")
          .setLabel("Submit")
          .setStyle(ButtonStyle.Primary)
      );

      const ddl_startTime = new StringSelectMenuBuilder()
        .setCustomId("ddl_startTime")
        .setPlaceholder(`start time`)
        .addOptions(times.slice(0, 9));

      const ddl_endTime = new StringSelectMenuBuilder()
        .setCustomId("ddl_endTime")
        .setPlaceholder(`end time`)
        .addOptions(times.slice(1, 10));

      const startTimeRow = new ActionRowBuilder().addComponents(ddl_startTime);
      const endTimeRow = new ActionRowBuilder().addComponents(ddl_endTime);

      await interaction.reply({
        content: `Date: ${formattedDate} \nSelect from below opetions to create available time slot.\n`,
        components: [startTimeRow, endTimeRow, btn_timeslot],
        ephemeral: true
      });
    }

    //feature 2 command
    // if (commandName === "search-available-time") {
    //   const teacherRole = interaction.guild.roles.cache.find(
    //     (role) => role.name === "Teachers"
    //   );

    //   await interaction.guild.members.fetch();

    //   const teachers = interaction.guild.members.cache.filter((member) =>
    //     member.roles.cache.has(teacherRole.id)
    //   );

    //   if (teachers.size === 0) {
    //     return interaction.reply('No teachers found with the "Teachers" role.');
    //   }

    //   const teacherOptions = teachers.map((teacher) => {
    //     return {
    //       label: teacher.user.username, // The name of the teacher
    //       value: teacher.user.id // The teacher's ID to identify them later
    //     };
    //   });

    //   // Create the select menu
    //   const ddl_teacher = new StringSelectMenuBuilder()
    //     .setCustomId("ddl_teacher") // Custom ID for this interaction
    //     .setPlaceholder("Select a teacher to see available times") // Placeholder text
    //     .addOptions(teacherOptions); // Add teacher options

    //   // Send the select menu in a message
    //   const row = new ActionRowBuilder().addComponents(ddl_teacher);

    //   // Reply with the select menu
    //   await interaction.reply({
    //     content: "Please select a teacher to view available times:",
    //     components: [row]
    //   });

    //   // await postAvailableTime(data, interaction.user.id);
    // }
    if (commandName === "search-available-time") {
      const teacherRole = interaction.guild.roles.cache.find(
        (role) => role.name === "Tutors"
      );

      // 如果找不到 "Teachers" 角色，回傳錯誤訊息
      if (!teacherRole) {
        return interaction.reply({
          content: 'No "Teachers" role found in the server.',
          ephemeral: true
        });
      }

      await interaction.guild.members.fetch(); // 確保所有成員都已載入

      const teachers = interaction.guild.members.cache.filter((member) =>
        member.roles.cache.has(teacherRole.id)
      );

      if (teachers.size === 0) {
        return interaction.reply({
          content: 'No teachers found with the "Teachers" role.',
          ephemeral: true
        });
      }

      const teacherOptions = teachers.map((teacher) => ({
        label: teacher.user.username, // 老師名稱
        value: teacher.user.id // 老師的 ID
      }));

      // 建立選單
      const ddl_teacher = new StringSelectMenuBuilder()
        .setCustomId("ddl_teacher")
        .setPlaceholder("Select a teacher to see available times")
        .addOptions(teacherOptions);

      const row = new ActionRowBuilder().addComponents(ddl_teacher);

      // 回應選單訊息
      await interaction.reply({
        content: "Please select a teacher to view available times:",
        components: [row],
        ephemeral: true
      });
    }
  }

  // Feature 1 ddl interaction
  if (
    interaction.isStringSelectMenu() &&
    (interaction.customId === "ddl_startTime" ||
      interaction.customId === "ddl_endTime")
  ) {
    const selectedTime = interaction.values[0];
    const label =
      interaction.customId === "ddl_startTime" ? "Start Time" : "End Time";

    if (!timeSelectionsMap.has(interaction.user.id)) {
      return await interaction.reply({
        content: `Something went wrong... please try again...`,
        ephemeral: true
      });
    }

    const timeSelection = timeSelectionsMap.get(interaction.user.id);
    if (interaction.customId === "ddl_startTime") {
      timeSelection.startTime = selectedTime;
    } else if (interaction.customId === "ddl_endTime") {
      timeSelection.endTime = selectedTime;
    }

    timeSelectionsMap.set(interaction.user.id, timeSelection);

    await interaction.deferUpdate();
  }

  // Feature 2 ddl interaction
  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "ddl_teacher"
  ) {
    const selectedTeacherId = interaction.values[0];

    // Dummy check
    if (!selectedTeacherId) {
      return await interaction.reply({
        content: "Please select a teacher.",
        ephemeral: true
      });
    }

    await interaction.deferReply(); // 延遲回覆，讓用戶知道我們在處理中

    try {
      // API calling
      const data = await getAvailableTime(selectedTeacherId);
      const availableTimes = data.availableTimeSlots;

      // Reply in DC channel
      if (availableTimes.length > 0) {
        const formattedTimes = availableTimes.map((slot) => {
          return `${slot.start_time} - ${slot.end_time}`;
        });

        await interaction.followUp(
          `The available times for the selected teacher are:\n- ${formattedTimes.join(
            "\n- "
          )}`
        );
      } else {
        // 如果老師沒有可用時間
        await interaction.followUp(
          "The selected teacher has no available times."
        );
      }
    } catch (error) {
      // 錯誤處理
      console.error(error);
      await interaction.followUp(
        "Sorry, something went wrong while fetching the available times."
      );
    }
  }

  // Feature 1 btn interaction
  if (interaction.isButton() && interaction.customId === "btn_timeslot") {
    // Retrieve memory record
    const timeSelection = timeSelectionsMap.get(interaction.user.id);

    // Dummy check
    if (!timeSelection || !timeSelection.startTime || !timeSelection.endTime) {
      return await interaction.reply({
        content: "Please select both a start and end time.",
        ephemeral: true
      });
    }

    // API calling
    const { date, startTime, endTime } = timeSelection;
    const data = {
      date: date,
      startTime: startTime,
      endTime: endTime
    };
    await postAvailableTime(data, interaction.user.id);

    // Reply in DC channel
    const formattedDate = formatDate(date);
    await interaction.update({
      content: `Available time slots are created successfully: \n\nTeacher:<@${interaction.user.id}> \nDate: ${formattedDate} \nFrom: ${startTime} \nTo: ${endTime}`,
      components: [],
      ephemeral: true
    });

    // Delete memory record
    timeSelectionsMap.delete(interaction.user.id);
  }
});

// Login Discord
chatBotClient.login(process.env.TOKEN);

// Helper Functions
// -------------------------------------------------------------
function parseDate(dateString) {
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1; // Month is 0-based
  const day = parseInt(dateString.substring(6, 8), 10);

  const parsedDate = new Date(year, month, day);

  return parsedDate;
}

function formatDate(dateObj) {
  const formattedDate =
    dateObj.getFullYear() +
    "-" +
    String(dateObj.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(dateObj.getDate()).padStart(2, "0");

  return formattedDate;
}
// -------------------------------------------------------------

// Call API
// -------------------------------------------------------------
// async function postAvailableTime(data, userId) {
//   console.log(userId);
//   const response = await apiClient.post(
//     `/available_time/teacher/${userId}`,
//     data
//   );
//   return response;
// }

// async function getAvailableTime(teacherId) {
//   const response = await apiClient.get(`/available_time/teacher/${teacherId}`);
//   return response.data;
// }

// async function postUserInfo(data, userId) {
//   const response = await apiClient.post(`/user_info/student/${userId}`, data);
//   return response;
// }
// -------------------------------------------------------------
