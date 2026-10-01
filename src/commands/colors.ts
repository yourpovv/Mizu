import type { SlashCommandDefinition } from "./credits.js";

export const ColorPicker: SlashCommandDefinition = {
  name: "color-picker",
  description: "send the color role picker",
  default_member_permissions: "8",
};
