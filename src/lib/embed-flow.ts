import type { VercelResponse } from "@vercel/node";
import {
  InteractionResponseFlags,
  InteractionResponseType,
} from "discord-interactions";
import {
  buildConfirmButtons,
  buildEmbed,
  buildModal,
  draftFromModal,
  EMBED_DELETE_PREFIX,
  EMBED_KEEP_PREFIX,
  parseConfirmCustomId,
  parseModalCustomId,
  parseModalFields,
  type ModalDefaults,
} from "./embeds.js";
import { deleteMessage, postMessage } from "./discord-rest.js";

export interface EmbedCommandInteraction {
  channel_id?: string;
  data?: { options?: Array<{ name: string; value?: string }> };
}

export interface EmbedModalInteraction {
  guild_id?: string;
  member?: { user: { id: string } };
  user?: { id: string };
  data?: {
    custom_id?: string;
    components?: Array<{
      components?: Array<{ custom_id?: string; value?: string }>;
    }>;
  };
}

export interface EmbedButtonInteraction {
  member?: { user: { id: string } };
  user?: { id: string };
  data?: { custom_id?: string };
}

function optionOf(
  interaction: EmbedCommandInteraction,
  name: string,
): string {
  return (
    interaction.data?.options?.find((option) => option.name === name)?.value?.trim() ?? ""
  );
}

function replyEphemeral(res: VercelResponse, content: string): void {
  res.status(200).json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content, flags: InteractionResponseFlags.EPHEMERAL },
  });
}

function authorOf(interaction: {
  member?: { user: { id: string } };
  user?: { id: string };
}): string | undefined {
  return interaction.member?.user.id ?? interaction.user?.id;
}

export function handleEmbedCommand(
  interaction: EmbedCommandInteraction,
  res: VercelResponse,
): void {
  const channelId = interaction.channel_id;
  if (!channelId) {
    replyEphemeral(res, "embed builder only works inside a server channel");
    return;
  }

  const defaults: ModalDefaults = {
    title: optionOf(interaction, "title"),
    content: optionOf(interaction, "content"),
    color: optionOf(interaction, "color"),
    imageUrl: optionOf(interaction, "image"),
    thumbnailUrl: optionOf(interaction, "thumbnail"),
  };

  res.status(200).json({
    type: InteractionResponseType.MODAL,
    data: buildModal(channelId, defaults),
  });
}

export async function handleEmbedModalSubmit(
  interaction: EmbedModalInteraction,
  res: VercelResponse,
): Promise<void> {
  const guildId = interaction.guild_id;
  const channelId = parseModalCustomId(interaction.data?.custom_id ?? "");
  if (!guildId || !channelId) {
    replyEphemeral(res, "embed builder only works inside a server");
    return;
  }

  const draft = draftFromModal(parseModalFields(interaction));
  if (!draft) {
    replyEphemeral(
      res,
      "that embed needs a title, content, and a color like #5865F2",
    );
    return;
  }

  try {
    const messageId = await postMessage(channelId, { embeds: [buildEmbed(draft)] });
    const authorId = authorOf(interaction) ?? "unknown";
    res.status(200).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "preview posted above — keep it or delete it:",
        flags: InteractionResponseFlags.EPHEMERAL,
        components: [buildConfirmButtons({ authorId, channelId, messageId })],
      },
    });
  } catch (error) {
    console.error("[embed] preview post failed", error);
    replyEphemeral(
      res,
      "couldnt post the preview, check my Send Messages + Embed Links permission here",
    );
  }
}

export async function handleEmbedConfirm(
  interaction: EmbedButtonInteraction,
  res: VercelResponse,
  keep: boolean,
): Promise<void> {
  const prefix = keep ? EMBED_KEEP_PREFIX : EMBED_DELETE_PREFIX;
  const ids = parseConfirmCustomId(prefix, interaction.data?.custom_id ?? "");
  if (!ids) {
    replyEphemeral(res, "that button has expired, run /embed again");
    return;
  }

  if (authorOf(interaction) !== ids.authorId) {
    replyEphemeral(res, "only the person who built this embed can confirm it");
    return;
  }

  try {
    if (keep) {
      replyEphemeral(res, "kept ✅");
    } else {
      await deleteMessage(ids.channelId, ids.messageId);
      replyEphemeral(res, "deleted ❌");
    }
  } catch (error) {
    console.error("[embed] confirm failed", error);
    replyEphemeral(res, "couldnt finish that, check my Manage Messages permission");
  }
}
