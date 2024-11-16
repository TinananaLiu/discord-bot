import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  {
    name: "add-available-time",
    description: "Form for add available time",
    options: [
      {
        name: "date",
        description:
          "Please specify the date you want to add, enter in yyyyMMdd format (e.g. 20240214)",
        type: 4,
        required: true
      }
    ]
  },
  {
    name: "search-available-time",
    description: "Search teacher's available time"
  },
  {
    name: "reserve-available-time",
    description: "Form for reserve available time",
    options: [
      {
        name: "date",
        description:
          "Please specify the date you want to search, enter in yyyyMMdd format (e.g. 20240214)",
        type: 4,
        required: true
      }
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started refreshing global application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands
    });

    console.log("Successfully reloaded global application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
