import type { VercelResponse } from "@vercel/node";
import {
  InteractionResponseFlags,
  InteractionResponseType,
} from "discord-interactions";
import {
  allColorRoleIds,
  resolveColorRoleId,
  rolesToRemove,
} from "./colors.js";
import {
  addRoleToMember,
  getMemberRoleIds,
  removeRolesFromMember,
} from "./discord-rest.js";

export interface ColorSelectInteraction {
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

async function assignColorRole(
  guildId: string,
  userId: string,
  selected: string,
): Promise<string> {
  const newRoleId = resolveColorRoleId(selected);
  const menuRoleIds = allColorRoleIds();
  const memberRoleIds = await getMemberRoleIds(guildId, userId);
  const staleRoleIds = rolesToRemove(memberRoleIds, menuRoleIds, newRoleId);

  if (staleRoleIds.length > 0) {
    await removeRolesFromMember(guildId, userId, staleRoleIds);
  }

  if (!newRoleId) {
    return `that ${selected} color role isnt set up yet`;
  }

  await addRoleToMember(guildId, userId, newRoleId);
  return `gave you the ${selected} color role`;
}

export async function handleColorSelect(
  interaction: ColorSelectInteraction,
  res: VercelResponse,
): Promise<void> {
  const guildId = interaction.guild_id;
  const userId = interaction.member?.user.id;
  const selected = interaction.data?.values?.[0];

  if (!guildId || !userId || !selected) {
    replyEphemeral(res, "color roles only work inside a server");
    return;
  }

  try {
    replyEphemeral(res, await assignColorRole(guildId, userId, selected));
  } catch (error) {
    console.error("[color_select] role update failed", error);
    replyEphemeral(
      res,
      "couldnt update your color role, check my permissions and role order",
    );
  }
}
