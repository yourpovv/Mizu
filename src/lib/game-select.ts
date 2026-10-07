import type { VercelResponse } from "@vercel/node";
import {
  InteractionResponseFlags,
  InteractionResponseType,
} from "discord-interactions";
import {
  addRoleToMember,
  getMemberRoleIds,
  removeRolesFromMember,
} from "./discord-rest.js";
import {
  buildGamePingEditor,
  formatGamePingStatus,
  nextMemberRoleIds,
  planGameRoleSync,
} from "./games.js";

export interface GameSelectInteraction {
  guild_id?: string;
  member?: { user: { id: string } };
  data?: { custom_id?: string; values?: string[] };
}

function replyEphemeral(res: VercelResponse, content: string): void {
  res.status(200).json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content, flags: InteractionResponseFlags.EPHEMERAL },
  });
}

export async function handleGamePingsOpen(
  interaction: GameSelectInteraction,
  res: VercelResponse,
): Promise<void> {
  const guildId = interaction.guild_id;
  const userId = interaction.member?.user.id;

  if (!guildId || !userId) {
    replyEphemeral(res, "game pings only work inside a server");
    return;
  }

  try {
    const memberRoleIds = await getMemberRoleIds(guildId, userId);
    const editor = buildGamePingEditor(memberRoleIds);
    res.status(200).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        ...editor,
        flags: editor.flags | InteractionResponseFlags.EPHEMERAL,
      },
    });
  } catch (error) {
    console.error("[game_pings_open] failed to load roles", error);
    replyEphemeral(res, "couldnt load your game pings, check my permissions");
  }
}

export async function handleGameSelect(
  interaction: GameSelectInteraction,
  res: VercelResponse,
): Promise<void> {
  const guildId = interaction.guild_id;
  const userId = interaction.member?.user.id;
  const selected = interaction.data?.values ?? [];

  if (!guildId || !userId) {
    replyEphemeral(res, "game pings only work inside a server");
    return;
  }

  try {
    const memberRoleIds = await getMemberRoleIds(guildId, userId);
    const sync = planGameRoleSync(selected, memberRoleIds);

    if (sync.addRoleIds.length > 0) {
      await Promise.all(
        sync.addRoleIds.map((roleId) => addRoleToMember(guildId, userId, roleId)),
      );
    }
    if (sync.removeRoleIds.length > 0) {
      await removeRolesFromMember(guildId, userId, sync.removeRoleIds);
    }

    res.status(200).json({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: buildGamePingEditor(
        nextMemberRoleIds(memberRoleIds, sync),
        formatGamePingStatus(sync.addedNames, sync.removedNames),
      ),
    });
  } catch (error) {
    console.error("[game_select] role update failed", error);
    replyEphemeral(
      res,
      "couldnt update your game pings, check my permissions and role order",
    );
  }
}