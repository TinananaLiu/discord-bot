import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} from "discord.js";


export const buildUserInfoModal = () => {
  const modal = new ModalBuilder()
  .setCustomId("userInfoModal")
  .setTitle("基本資料填寫");

  const nameInput = new TextInputBuilder()
    .setCustomId("name")
    .setLabel("你的姓名是？")
    .setStyle(TextInputStyle.Short);

  const ageInput = new TextInputBuilder()
    .setCustomId("age")
    .setLabel("你的年齡是？")
    .setStyle(TextInputStyle.Short);

  const interestsInput = new TextInputBuilder()
    .setCustomId("interests")
    .setLabel("你對 AI 哪些方向感興趣？")
    .setStyle(TextInputStyle.Paragraph);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(ageInput),
    new ActionRowBuilder().addComponents(interestsInput)
  );
  return modal
};

