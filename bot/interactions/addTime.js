import {
  buildTimeSlotButton
} from "./components/button.js";
import {
  buildStartTimeRow,
  buildEndTimeRow
} from "./components/dropDownList.js";
import {
  postAvailableTime
} from "../api/api.js"


export const getTimeForm = async (interaction, timeSelectionsMap) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "add-available-time"){
    return;
  }

  const date = interaction.options.getInteger("date");
  const parsedDate = parseDate(date.toString());
  const formattedDate = formatDate(parsedDate);

  // Cache current user, for available_time insertion
  if (!timeSelectionsMap.has(interaction.user.id)) {
    timeSelectionsMap.set(interaction.user.id, {
      date: parsedDate,
      startTime: null,
      endTime: null
    });
  }

  const btn_timeslot = buildTimeSlotButton();
  const startTimeRow = buildStartTimeRow()
  const endTimeRow = buildEndTimeRow()

  await interaction.reply({
    content: `Date: ${formattedDate} \nSelect from below opetions to create available time slot.\n`,
    components: [startTimeRow, endTimeRow, btn_timeslot],
    ephemeral: true
  });
}

export const updateTimeCache = async (interaction, timeSelectionsMap) => {
  if (!interaction.isStringSelectMenu()){
    return;
  }
  
  if (!(interaction.customId === "ddl_startTime" || interaction.customId === "ddl_endTime")){
    return;
  }

  const selectedTime = interaction.values[0];
  const label = interaction.customId === "ddl_startTime" ? "Start Time" : "End Time";

  // If user didn't ad
  if (!timeSelectionsMap.has(interaction.user.id)) {
    await interaction.reply({
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

export const submitTimeForm = async (interaction, timeSelectionsMap) => {

  if (!interaction.isButton() || interaction.customId !== "btn_timeslot"){
    return;
  }

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