export interface SlashCommandDefinition {
  name: string;
  description: string;
}

export const Ping: SlashCommandDefinition = {
  name: "ping",
  description: "Replies with pong !!",
};
