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

  if (!interaction.member.roles.cache.some((role) => role.name === "Tutors")) {
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
    content: `日期: ${formattedDate} \n請從以下選項中選擇開始和結束的時間，來新增可預約時段。\n`,
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
      content: "請確保同時選擇開始時間和結束時間。",
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

    if (response.status === 400) {
      await interaction.update({
        content: `檢查到重複的時段。\n請使用指令 /search-available-time 查詢您已新增過的時段。`,
        components: [],
        ephemeral: true
      });
    } else {
      // 格式化日期並在 Discord 頻道回應
      const formattedDate = DateUtil.formatDate(date);
      await interaction.update({
        content: `可預約時段新增成功：\n\n老師：<@${interaction.user.id}> \n日期：${formattedDate} \n時間：${startTime} 至 ${endTime}`,
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
      content: "新增時段時發生錯誤。請稍後再試。",
      components: [],
      ephemeral: true
    });
  }
};
