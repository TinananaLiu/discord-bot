import {
  buildTeacherRow,
  buildReserveTimeRow
} from "./components/dropDownList.js";
import {
  getAvailableTime,
  getAvailableTimeByDate,
  postReserveTime,
  getTimeSchedule
} from "../api/api.js";
import DateUtil from "../utils/dateUtil.js";

export const getSearchForm = async (interaction) => {
  const teacherRole = interaction.guild.roles.cache.find(
    (role) => role.name === "Tutors"
  );

  if (!teacherRole) {
    return interaction.reply({
      content: 'No "Tutors" role found in the server.',
      ephemeral: true
    });
  }

  await interaction.guild.members.fetch();

  const teachers = interaction.guild.members.cache.filter((member) =>
    member.roles.cache.has(teacherRole.id)
  );

  if (teachers.size === 0) {
    return interaction.reply({
      content: 'No tutors found with the "Tutors" role.',
      ephemeral: true
    });
  }

  const teacherOptions = teachers.map((teacher) => ({
    label: teacher.user.username,
    value: teacher.user.id
  }));

  const row = buildTeacherRow(teacherOptions);

  await interaction.reply({
    content: "請選擇你想查看時段的老師：",
    components: [row],
    ephemeral: true
  });
};

export const submitSearchForm = async (interaction) => {
  const selectedTeacherId = interaction.values[0];

  // Dummy check
  if (!selectedTeacherId) {
    return await interaction.reply({
      content: "請選擇一位老師。",
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // API calling
    const data = await getAvailableTime(selectedTeacherId);
    const availableTimes = data.availableTimeSlots;

    // Reply in DC channel
    if (availableTimes.length > 0) {
      const msg = DateUtil.getRetrieveResultMessage(availableTimes);

      await interaction.followUp(
        `**【這位老師目前可預約的時段如下👇】**\n ${msg}`
      );
    } else {
      await interaction.followUp("你所選擇的老師目前沒有可預約的時段。");
    }
  } catch (error) {
    console.error(error);
    await interaction.followUp("查詢老師時段發生一些錯誤，請稍後再試。");
  }
};

export const getReserveForm = async (interaction) => {
  if (
    !interaction.isChatInputCommand() ||
    interaction.commandName !== "reserve-available-time"
  ) {
    return;
  }

  const date = interaction.options.getInteger("date");
  const parsedDate = DateUtil.parseDate(date.toString());
  const formattedDate = DateUtil.formatDate(parsedDate);

  const data = await getAvailableTimeByDate(date);
  const availableTimes = data.availableTimeSlots;

  if (!availableTimes || availableTimes.length === 0) {
    return await interaction.reply({
      content: `日期：${formattedDate} \n該日期沒有可以預約的時段，請選擇別的日期。`,
      ephemeral: true
    });
  }

  const reserveTimeOptions = availableTimes.map((slot) => ({
    label: `${slot.start_time} - ${slot.end_time}`,
    value: slot.id
  }));

  const reserveTimeRow = buildReserveTimeRow(reserveTimeOptions);

  await interaction.reply({
    content: `日期：${formattedDate} \n請選擇以下你想預約的任一時段。\n`,
    components: [reserveTimeRow],
    ephemeral: true
  });
};

export const submitReserveForm = async (interaction) => {
  const selectedTimeSlotId = interaction.values[0];

  // Dummy check
  if (!selectedTimeSlotId) {
    return await interaction.reply({
      content: "請選擇一個時段。",
      ephemeral: true
    });
  }

  try {
    // API calling
    const data = {
      timeSlotId: selectedTimeSlotId
    };
    await postReserveTime(data, interaction.user.id);

    // Reply in DC channel
    // 這邊我想改成抓到那個選項的label並顯示在content
    await interaction.update({
      content: "該時段已預約成功！請記得你與老師的預約。",
      components: [],
      ephemeral: true
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "預約時段發生一些錯誤，請稍後再試。",
      components: [],
      ephemeral: true
    });
  }
};

export const getTimeByUser = async (interaction) => {
  const userId = interaction.user.id;
  if (!userId) {
    return await interaction.reply({
      content: "發生了預期以外的錯誤，請稍後再重新查詢。",
      ephemeral: true
    });
  }

  try {
    await interaction.deferReply({ ephemeral: true });
    const data = await getTimeSchedule(userId);
    const timeSchedule = data.timeSchedule;
    if (timeSchedule.length > 0) {
      const msg = DateUtil.getRetrieveResultMessage(timeSchedule);
      await interaction.editReply(`**【你與老師預約的時段如下👇】**\n ${msg}`);
    } else {
      await interaction.editReply(
        "你目前沒有預約任何的時段。請使用 `/reserve-available-time` 指令進行預約！"
      );
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply("查詢你預約的時段發生一些錯誤，請稍後再試。");
  }
};
