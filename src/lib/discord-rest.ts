import { requiredEnv } from "./env.js";

const DISCORD_API = "https://discord.com/api/v10";

export class DiscordRestError extends Error {
  constructor(
    readonly operation: string,
    readonly status: number,
    detail: string,
  ) {
    super(`${operation} failed (${status}): ${detail}`);
    this.name = "DiscordRestError";
  }
}

async function discordFetch(
  operation: string,
  path: string,
  init: RequestInit,
): Promise<Response> {
  const botToken = requiredEnv("DISCORD_BOT_TOKEN");
  const response = await fetch(`${DISCORD_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new DiscordRestError(operation, response.status, await response.text());
  }
  return response;
}

export async function getMemberRoleIds(
  guildId: string,
  userId: string,
): Promise<string[]> {
  const response = await discordFetch(
    "fetch member roles",
    `/guilds/${guildId}/members/${userId}`,
    { method: "GET" },
  );
  const member = (await response.json()) as { roles?: string[] };
  return member.roles ?? [];
}

export async function addRoleToMember(
  guildId: string,
  userId: string,
  roleId: string,
): Promise<void> {
  await discordFetch(
    "add role to member",
    `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    { method: "PUT" },
  );
}

export async function postMessage(
  channelId: string,
  payload: unknown,
): Promise<string> {
  const response = await discordFetch("post message", `/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const message = (await response.json()) as { id?: string };
  if (!message.id) {
    throw new DiscordRestError("post message", 200, "missing message id");
  }
  return message.id;
}

export async function deleteMessage(channelId: string, messageId: string): Promise<void> {
  await discordFetch(
    "delete message",
    `/channels/${channelId}/messages/${messageId}`,
    { method: "DELETE" },
  );
}

export async function removeRolesFromMember(
  guildId: string,
  userId: string,
  roleIds: string[],
): Promise<void> {
  await Promise.all(
    roleIds.map((roleId) =>
      discordFetch(
        "remove role from member",
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
        { method: "DELETE" },
      ),
    ),
  );
}
