import { buildTimeSlotButton } from "./components/button.js";
import {
  buildStartTimeRow,
  buildEndTimeRow
} from "./components/dropDownList.js";
import { postAvailableTime } from "../api/api.js";
import DateUtil from "../utils/dateUtil.js";

export const getTimeForm = async (interaction, timeSelectionsMap) => {
  if (
    !interaction.isChatInputCommand() ||
    interaction.commandName !== "add-available-time"
  ) {
    return;
  }

  if (!interaction.member.roles.cache.some(role => role.name === "Tutors")){
    await interaction.reply({
      content: `You are not a tutor!!`,
      ephemeral: true
    });
    return;
  }

  const date = interaction.options.getInteger("date");
  const parsedDate = DateUtil.parseDate(date.toString());
  const formattedDate = DateUtil.formatDate(parsedDate);

  // Cache current user, for available_time insertion
  if (!timeSelectionsMap.has(interaction.user.id)) {
    timeSelectionsMap.set(interaction.user.id, {
      date: parsedDate,
      startTime: null,
      endTime: null
    });
  }

  const btn_timeslot = buildTimeSlotButton();
  const startTimeRow = buildStartTimeRow();
  const endTimeRow = buildEndTimeRow();

  await interaction.reply({
    content: `Date: ${formattedDate} \nSelect from below options to create available time slot.\n`,
    components: [startTimeRow, endTimeRow, btn_timeslot],
    ephemeral: true
  });
};

export const updateTimeCache = async (interaction, timeSelectionsMap) => {
  if (!interaction.isStringSelectMenu()) {
    return;
  }

  if (
    !(
      interaction.customId === "ddl_startTime" ||
      interaction.customId === "ddl_endTime"
    )
  ) {
    return;
  }

  const selectedTime = interaction.values[0];
  const label =
    interaction.customId === "ddl_startTime" ? "Start Time" : "End Time";

  // If user didn't add
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
};

export const submitTimeForm = async (interaction, timeSelectionsMap) => {
  if (!interaction.isButton() || interaction.customId !== "btn_timeslot") {
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

  try {
    const { date, startTime, endTime } = timeSelection;
    const data = {
      date: date,
      startTime: startTime,
      endTime: endTime
    };

    // 發送可用時間到資料庫
    const response = await postAvailableTime(data, interaction.user.id);

    if (response.status === 400){
      await interaction.update({
        content: `Detected duplicated available time slot. \nPlease use command "/search-available-time" to check your existing time slot`,
        components: [],
        ephemeral: true
      });
    }
    else{
      // 格式化日期並在 Discord 頻道回應
      const formattedDate = DateUtil.formatDate(date);
      await interaction.update({
        content: `Available time slots are created successfully: \n\nTeacher:<@${interaction.user.id}> \nDate: ${formattedDate} \nFrom: ${startTime} \nTo: ${endTime}`,
        components: [],
        ephemeral: true
      });
    }

    // 刪除記憶體中的記錄
    timeSelectionsMap.delete(interaction.user.id);
  } catch (error) {
    console.error("發生錯誤:", error);

    // 若發生錯誤，回應錯誤訊息給用戶
    await interaction.update({
      content:
        "An error occurred while creating available time slots. Please try again later.",
      components: [],
      ephemeral: true
    });
  }
};
