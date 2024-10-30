import {
  buildTeacherRow
} from "./components/dropDownList.js";
import {
  getAvailableTime
} from "../api/api.js";

export const getSearchForm = async (interaction) => {
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

  const row = buildTeacherRow(teacherOptions);

  // 回應選單訊息
  await interaction.reply({
    content: "Please select a teacher to view available times:",
    components: [row],
    ephemeral: true
  });
};

export const submitSearchForm = async (interaction) => {
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