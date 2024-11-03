import { StringSelectMenuBuilder, ActionRowBuilder } from "discord.js";

// Time options array
const times = Array.from({ length: 10 }, (_, i) => {
  const hour = String(i + 9).padStart(2, "0"); // Ensure hour is two digits
  return {
    label: `${hour}:00`,
    value: `${hour}:00`
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
      .setPlaceholder("Select a teacher to see available times")
      .addOptions(teacherOptions)
  );
};

export const signUpCourseRow = (courseOptions) => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ddl_course")
      .setPlaceholder("請選擇課程")
      .setMinValues(1) // 最少選擇一個
      .setMaxValues(courseOptions.length) // 最多可選擇的課程數量
      .addOptions(courseOptions) // 添加選項
  );
};
