export interface SlashCommandDefinition {
  name: string;
  description: string;
  default_member_permissions?: string;
}

export const Credits: SlashCommandDefinition = {
  name: "credits",
  description: "Shows who created Mizu",
};
