import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export const userInfoButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_userinfo")
      .setLabel("填寫表單")
      .setStyle(ButtonStyle.Primary)
  );
};

export const signupCourseButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_signup")
      .setLabel("選擇課程")
      .setStyle(ButtonStyle.Primary)
  );
};

export const buildTimeSlotButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_timeslot")
      .setLabel("提交")
      .setStyle(ButtonStyle.Primary)
  );
};

export const submitCourseButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_course")
      .setLabel("提交")
      .setStyle(ButtonStyle.Primary)
  );
};

export const buildReserveButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_reserve")
      .setLabel("提交")
      .setStyle(ButtonStyle.Primary)
  );
};
