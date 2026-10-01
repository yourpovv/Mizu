import type { SlashCommandDefinition } from "./credits.js";

function stringOption(name: string, description: string, required: boolean): object {
  return {
    type: 3,
    name,
    description,
    required,
  };
}

export const Embed: SlashCommandDefinition & { options: object[] } = {
  name: "embed",
  description: "build a custom embed with preview",
  default_member_permissions: "32",
  options: [
    stringOption("title", "Embed title (also editable in the form)", true),
    stringOption("content", "Prefills the markdown content box", false),
    stringOption("color", "Prefills the color, e.g. #5865F2", false),
    stringOption("image", "Prefills the banner image URL", false),
    stringOption("thumbnail", "Prefills the thumbnail image URL", false),
  ],
};
