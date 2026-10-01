import { Ping } from "../src/commands/ping";
import { requiredEnv } from "../src/lib/env";

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
      body: JSON.stringify([Ping]),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Command registration failed: ${detail}`);
  }

  console.log("Registered /ping");
}

registerCommands().catch((error: unknown) => {
  console.error("Failed to register /ping:", error);
  process.exitCode = 1;
});
