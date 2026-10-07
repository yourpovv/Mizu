import type { SlashCommandDefinition } from "./credits.js";
 
export const GamePicker: SlashCommandDefinition = {
  name: "game-picker",
  description: "send the game ping role picker",
  default_member_permissions: "8",
};