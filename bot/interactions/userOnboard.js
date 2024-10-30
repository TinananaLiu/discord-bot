import config from "../config.js"
import {
  buildUserInfoModal
} from "./components/modal.js"
import {
  postUserInfo
} from "../api/api.js"


export const getWelcomeMessage = async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    (channel) => channel.name === "welcome-and-rules"
  );
  if (welcomeChannel) {
    await welcomeChannel.send({
      content: `👋 歡迎 ${member.displayName} 加入！請閱讀伺服器規則並點擊本訊息的 ✅ 表情來表示同意規則。`,
      ephemeral: true
    });
  }
}

export const getUserInfoModal = async (interaction, chatBotClient) => {
  if (!interaction.isButton || interaction.customId !== "openModal"){
    return;
  }
  
  const member = interaction.guild.members.cache.get(interaction.user.id);
    
  if (!member) {
    return await interaction.reply({
      content: "發生了預期以外的錯誤，請稍後再重新填寫。",
      ephemeral: true
    });
  }

  try {
    // 從指定頻道中抓取訊息
    const rulesChannel = chatBotClient.channels.cache.get(config.rulesChannelId);
    const rulesMessage = await rulesChannel.messages.fetch(config.rulesMessageId);

    const hasReacted = rulesMessage.reactions.cache
      .get("✅")
      ?.users.cache.has(interaction.user.id);

    if (!hasReacted) {
      return await interaction.reply({
        content:
          "請先在 #welcome-and-rules 頻道按 ✅ 表情，同意規範後再填寫表單。",
        ephemeral: true
      });
    }

    const modal = buildUserInfoModal();
    await interaction.showModal(modal);
  } catch (error) {
    console.error("Failed to fetch the rules message:", error);
    await interaction.reply({
      content: "無法找到規則訊息，請聯繫管理員。",
      ephemeral: true
    });
  }
}

export const submitUserInfoModal = async (interaction) => {
  if (!interaction.isModalSubmit() || !interaction.customId === "userInfoModal"){
    return;
  }

  const name = interaction.fields.getTextInputValue("name");
  const age = interaction.fields.getTextInputValue("age");
  const interests = interaction.fields.getTextInputValue("interests");
  const userId = interaction.user.id;

  const data = {
    studentName: name,
    age: age,
    interests: interests
  };

  try {
    // 發送資料到後端
    await postUserInfo(data, userId);

    const member = interaction.guild.members.cache.get(userId);
    if (member) {
      await member.roles.add(config.studentsRoleId);
      await interaction.reply({
        content: `${member.displayName}，你已成功加入社群並獲得 "Students" 身份組！`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "找不到你的資料，請稍後再試。",
        ephemeral: true
      });
    }
  } catch (error) {
    console.error("Error during interaction handling:", error);
    await interaction.reply({
      content: "無法儲存你的資料，請聯繫管理員。",
      ephemeral: true
    });
  }
}
