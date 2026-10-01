import { requiredEnv } from "./lib/env.js";

export const config = {
  publicKey: requiredEnv("DISCORD_PUBLIC_KEY"),
  appId: process.env.DISCORD_APP_ID ?? "",
  botToken: process.env.DISCORD_BOT_TOKEN ?? "",
} as const;
