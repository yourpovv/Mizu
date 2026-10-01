export interface SlashCommandDefinition {
  name: string;
  description: string;
  default_member_permissions?: string;
}

export const Ping: SlashCommandDefinition = {
  name: "ping",
  description: "Replies with pong !!",
};
