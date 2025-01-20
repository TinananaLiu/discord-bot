import config from "../config.js";
import { buildUserInfoModal } from "./components/modal.js";
import { postUserInfo } from "../api/api.js";

export const getWelcomeMessage = async (member) => {
  const rulesChannel = member.guild.channels.cache.get(config.rulesChannelId);
  if (rulesChannel) {
    await rulesChannel.send({
      content: `👋 歡迎 ${member.displayName} 加入！請閱讀伺服器規則並點擊該訊息的 ✅ 表情來表示同意規則。`,
      ephemeral: true,
    });
  }
};

export const getUserInfoModal = async (interaction, chatBotClient) => {
  if (!interaction.isButton || interaction.customId !== "btn_userinfo") {
    return;
  }

  const member = interaction.guild.members.cache.get(interaction.user.id);

  if (!member) {
    return await interaction.reply({
      content: "發生了預期以外的錯誤，請稍後再重新填寫。",
      ephemeral: true,
    });
  }

  if (member.roles.cache.has(config.onboardRoleId)) {
    return await interaction.reply({
      content: "您已經完成了身份註冊，無需再次填寫表單。",
      ephemeral: true,
    });
  }

  try {
    const rulesChannel = chatBotClient.channels.cache.get(
      config.rulesChannelId
    );
    const rulesMessage = await rulesChannel.messages.fetch(
      config.rulesMessageId
    );

    const reaction = await rulesMessage.reactions.cache.get("✅")?.fetch();

    const usersReacted = await reaction.users.fetch();
    const hasReacted = usersReacted.has(interaction.user.id);

    if (!hasReacted) {
      return await interaction.reply({
        content: `請先在 #${rulesChannel.name} 頻道按 ✅ 表情，同意規範後再填寫表單。`,
        ephemeral: true,
      });
    }

    const modal = buildUserInfoModal();
    await interaction.showModal(modal);
  } catch (error) {
    console.error("Failed to fetch the rules message:", error);
    await interaction.reply({
      content: "無法找到規則訊息，請聯繫管理員。",
      ephemeral: true,
    });
  }
};

export const submitUserInfoModal = async (interaction, chatBotClient) => {
  if (
    !interaction.isModalSubmit() ||
    !interaction.customId === "userInfoModal"
  ) {
    return;
  }

  const name = interaction.fields.getTextInputValue("name");
  const age = interaction.fields.getTextInputValue("age");
  const interests = interaction.fields.getTextInputValue("interests");
  const userId = interaction.user.id;

  const data = {
    studentName: name,
    age: age,
    interests: interests,
  };

  const signUpChannel = chatBotClient.channels.cache.get(
    config.signUpChannelId
  );

  try {
    await postUserInfo(data, userId);

    const member = interaction.guild.members.cache.get(userId);
    if (member) {
      await member.roles.add(config.onboardRoleId);
      await interaction.reply({
        content: `${member.displayName}，你已成功加入社群，請在 #${signUpChannel.name} 頻道進行選課！`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "找不到你的資料，請稍後再試。",
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("Error during interaction handling:", error);
    await interaction.reply({
      content: "無法儲存你的資料，請聯繫管理員。",
      ephemeral: true,
    });
  }
};
