import { InteractionCollector } from "discord.js";
import { signUpCourseRow } from "./components/dropDownList.js";
import { submitCourseButton } from "./components/button.js";

export const signUpCourseForm = async (interaction, userSelections) => {
  const member = interaction.guild.members.cache.get(interaction.user.id);

  if (!member) {
    return await interaction.reply({
      content: "發生了預期以外的錯誤，請稍後再重新填寫。",
      ephemeral: true,
    });
  }

  try {
    const courseCategory = interaction.guild.channels.cache.find(
      (channel) => channel.name.toLowerCase() === "course" && channel.type === 4
    );

    if (!courseCategory) {
      return await interaction.reply({
        content: "找不到 'course' 類別，請聯繫管理員。",
        ephemeral: true,
      });
    }

    const courseOptions = interaction.guild.channels.cache
      .filter(
        (channel) =>
          channel.parentId === courseCategory.id && channel.type === 0 // type 0 for text channel
      )
      .map((channel) => ({
        label: channel.name,
        value: channel.id,
      }));

    const signUpRow = signUpCourseRow(courseOptions);
    const btn_course = submitCourseButton();

    const message = await interaction.reply({
      content: `請從以下選項中選擇您感興趣的課程進行註冊。\n`,
      components: [signUpRow, btn_course],
      ephemeral: true,
      fetchReply: true,
    });

    // Listener for update cache
    const selectCollector = new InteractionCollector(interaction.client, {
      message,
      time: 60000,
    });

    selectCollector.on("collect", async (selectInteraction) => {
      if (selectInteraction.customId === "ddl_course") {
        userSelections.set(selectInteraction.user.id, selectInteraction.values);
        await selectInteraction.deferUpdate();
      }
    });
  } catch (error) {
    console.error("發生錯誤:", error);
    await interaction.reply({
      content: "發生錯誤，請稍後再試。",
      ephemeral: true,
    });
  }
};

export const submitCourseForm = async (interaction, userSelections) => {
  if (!interaction.isButton || interaction.customId !== "btn_course") {
    return;
  }

  const selectedCourses = userSelections.get(interaction.user.id);

  if (!selectedCourses || selectedCourses.length === 0) {
    return await interaction.reply({
      content: "請選擇至少一種課程。",
      ephemeral: true,
    });
  }

  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member) {
    return await interaction.reply({
      content: "無法找到你的用戶資料，請稍後再試。",
      ephemeral: true,
    });
  }

  try {
    for (const channelId of selectedCourses) {
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) continue;

      const roleName = `s-${channel.name}`;
      const role = interaction.guild.roles.cache.find(
        (r) => r.name === roleName
      );

      if (role) {
        await member.roles.add(role);
      } else {
        console.warn(`找不到身份組 ${roleName}`);
      }
    }

    await interaction.reply({
      content: "已成功為你分配選擇的課程身份組！現在可以查看該課程頻道內容了。",
      ephemeral: true,
    });

    userSelections.delete(interaction.user.id);
  } catch (error) {
    console.error("分配身份組時發生錯誤:", error);
    await interaction.reply({
      content: "分配身份組時發生錯誤，請稍後再試。",
      ephemeral: true,
    });
  }
};
