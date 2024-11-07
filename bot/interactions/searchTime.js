import {
  buildTeacherRow,
  buildReserveTimeRow
} from "./components/dropDownList.js";
import {
  getAvailableTime,
  getAvailableTimeByDate,
  postReserveTime
} from "../api/api.js";

export const getSearchForm = async (interaction) => {
  const teacherRole = interaction.guild.roles.cache.find(
    (role) => role.name === "Tutors"
  );

  if (!teacherRole) {
    return interaction.reply({
      content: 'No "Teachers" role found in the server.',
      ephemeral: true
    });
  }

  await interaction.guild.members.fetch();

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
    label: teacher.user.username,
    value: teacher.user.id
  }));

  const row = buildTeacherRow(teacherOptions);

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

  await interaction.deferReply();

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
      await interaction.followUp(
        "The selected teacher has no available times."
      );
    }
  } catch (error) {
    console.error(error);
    await interaction.followUp(
      "Sorry, something went wrong while fetching the available times."
    );
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
  const parsedDate = parseDate(date.toString());
  const formattedDate = formatDate(parsedDate);

  const data = await getAvailableTimeByDate(date);
  const availableTimes = data.availableTimeSlots;
  console.log(availableTimes);

  const reserveTimeOptions = availableTimes.map((slot) => ({
    label: `${slot.start_time} - ${slot.end_time}`,
    value: slot.id
  }));

  const reserveTimeRow = buildReserveTimeRow(reserveTimeOptions);

  await interaction.reply({
    content: `Date: ${formattedDate} \nSelect from below options to reserve an available time slot.\n`,
    components: [reserveTimeRow],
    ephemeral: true
  });
};

export const submitReserveForm = async (interaction) => {
  const selectedTimeSlotId = interaction.values[0];

  // Dummy check
  if (!selectedTimeSlotId) {
    return await interaction.reply({
      content: "Please select a time slot.",
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
    //const formattedDate = formatDate(date);
    await interaction.update({
      // content: `Available time slot is reserved successfully: \n\nDate: ${formattedDate} \nTime: ${}`,
      content: "Available time slot is reserved successfully",
      components: [],
      ephemeral: true
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content:
        "Sorry, something went wrong while reserving the available time slot.",
      components: [],
      ephemeral: true
    });
  }
};

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
