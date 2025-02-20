import { StringSelectMenuBuilder, ActionRowBuilder } from "discord.js";

// Time options array
const times = Array.from({ length: 10 }, (_, i) => {
  const hour = String(i + 9).padStart(2, "0"); // Ensure hour is two digits
  return {
    label: `${hour}:00`,
    value: `${hour}:00`,
  };
});

export const buildStartTimeRow = () => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ddl_startTime")
      .setPlaceholder(`start time`)
      .addOptions(times.slice(0, 9))
  );
};

export const buildEndTimeRow = () => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ddl_endTime")
      .setPlaceholder(`end time`)
      .addOptions(times.slice(1, 10))
  );
};

export const buildTeacherRow = (teacherOptions) => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ddl_teacher")
      .setPlaceholder("請選擇老師")
      .addOptions(teacherOptions)
  );
};

export const signUpCourseRow = (courseOptions) => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ddl_course")
      .setPlaceholder("請選擇課程")
      .setMinValues(1)
      .setMaxValues(courseOptions.length)
      .addOptions(courseOptions)
  );
};

export const buildReserveTimeRow = (reserveTimeOptions) => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ddl_reserve")
      .setPlaceholder("請選擇時段")
      .addOptions(reserveTimeOptions)
  );
};
