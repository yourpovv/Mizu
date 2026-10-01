import { Ping } from "../src/commands/ping.js";
import { ColorPicker } from "../src/commands/colors.js";
import { requiredEnv } from "../src/lib/env.js";

async function registerCommands(): Promise<void> {
  const appId = requiredEnv("DISCORD_APP_ID");
  const botToken = requiredEnv("DISCORD_BOT_TOKEN");

  const response = await fetch(
    `https://discord.com/api/v10/applications/${appId}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([Ping, ColorPicker]),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Command registration failed: ${detail}`);
  }

  console.log("Registered /ping and /color-picker");
}

registerCommands().catch((error: unknown) => {
  console.error("Failed to register commands:", error);
  process.exitCode = 1;
});
