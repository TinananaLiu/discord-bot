import {
  Client, 
  GatewayIntentBits, 
  Events, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder
} from "discord.js";

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const chatBotClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// In-memory map to cache user selection
const timeSelectionsMap = new Map();


chatBotClient.once(Events.ClientReady, () => {
  console.log("Bot is online!");
});

chatBotClient.on(Events.InteractionCreate, async (interaction) => {

  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'add-available-time') {
      const date = interaction.options.getInteger('date');
      const parsedDate = parseDate(date.toString());
      const formattedDate = formatDate(parsedDate);     

      if (!timeSelectionsMap.has(interaction.user.id)) {
        timeSelectionsMap.set(interaction.user.id, {date:parsedDate, startTime: null, endTime: null });
      }

      // Time option array
      const times = Array.from({ length: 10 }, (_, i) => {
        const hour = String(i + 9).padStart(2, '0'); // Ensure hour is two digits
        return {
          label: `${hour}:00`,
          value: `${hour}:00`
        };
      });

      const btn_timeslot = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('btn_timeslot')
          .setLabel('Submit')
          .setStyle(ButtonStyle.Primary)
      );

      const ddl_startTime = new StringSelectMenuBuilder()
        .setCustomId('ddl_startTime')
        .setPlaceholder(`start time`)
        .addOptions(times.slice(0, 9));

      const ddl_endTime = new StringSelectMenuBuilder()
        .setCustomId('ddl_endTime')
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
  }

  if (interaction.isStringSelectMenu()) {
    const selectedTime = interaction.values[0];
    const label = interaction.customId === 'ddl_startTime' ? 'Start Time' : 'End Time';

    if (!timeSelectionsMap.has(interaction.user.id)) {
      return await interaction.reply({
        content: `Something went wrong... please try again...`,
        ephemeral: true
      });
    }

    const timeSelection = timeSelectionsMap.get(interaction.user.id);
    if (interaction.customId === 'ddl_startTime') {
      timeSelection.startTime = selectedTime;
    } 
    else if (interaction.customId === 'ddl_endTime') {
      timeSelection.endTime = selectedTime;
    }

    timeSelectionsMap.set(interaction.user.id, timeSelection);

    await interaction.reply({
      content: `You selected ${label}: ${selectedTime}.`,
      ephemeral: true
    });
  }

  if (interaction.isButton() && interaction.customId === 'btn_timeslot') {
    
    // Retrieve memory record
    const timeSelection = timeSelectionsMap.get(interaction.user.id);

    // Dummy check
    if (!timeSelection || !timeSelection.startTime || !timeSelection.endTime) {
      return await interaction.reply({
        content: 'Please select both a start and end time.',
        ephemeral: true
      });
    }

    // API calling
    const {date, startTime, endTime } = timeSelection;
    const data = {
      date: date,
      startTime: startTime,
      endTime: endTime
    }
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
  const formattedDate = dateObj.getFullYear() + '-' + 
                        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(dateObj.getDate()).padStart(2, '0');

  return formattedDate;
}
// -------------------------------------------------------------

// Call API
// -------------------------------------------------------------
async function postAvailableTime(data, userId){
  console.log(userId);
  const response = await apiClient.post(`/available_time/teacher/${userId}`, data);
  return response;
}
// -------------------------------------------------------------
