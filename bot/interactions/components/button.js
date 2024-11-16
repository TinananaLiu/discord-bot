import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export const buildTimeSlotButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_timeslot")
      .setLabel("Submit")
      .setStyle(ButtonStyle.Primary)
  );
};

export const submitCourseButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("btn_course")
  );
};

export const buildReserveButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_reserve")
      .setLabel("Submit")
      .setStyle(ButtonStyle.Primary)
  );
};
