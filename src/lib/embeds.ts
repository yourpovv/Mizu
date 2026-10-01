export interface EmbedDraft {
  title: string;
  content: string;
  color: number | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
}

export interface BuiltEmbed {
  title: string;
  description: string;
  color?: number;
  image?: { url: string };
  thumbnail?: { url: string };
}

export const EMBED_MODAL_PREFIX = "embed_modal:";
export const EMBED_KEEP_PREFIX = "embed_keep:";
export const EMBED_DELETE_PREFIX = "embed_del:";

export const DEFAULT_EMBED_COLOR = 0x8b9cf6;

export function normalizeColor(raw: string | null | undefined): number | null {
  if (!raw) {
    return null;
  }
  const match = raw.trim().match(/^#?([0-9a-fA-F]{6})$/);
  return match ? Number.parseInt(match[1], 16) : null;
}

export function buildEmbed(draft: EmbedDraft): BuiltEmbed {
  const embed: BuiltEmbed = {
    title: draft.title,
    description: draft.content,
  };
  if (draft.color !== null) {
    embed.color = draft.color;
  }
  if (draft.imageUrl) {
    embed.image = { url: draft.imageUrl };
  }
  if (draft.thumbnailUrl) {
    embed.thumbnail = { url: draft.thumbnailUrl };
  }
  return embed;
}

export interface ModalDefaults {
  title: string;
  content: string;
  color: string;
  imageUrl: string;
  thumbnailUrl: string;
}

function textInput(
  customId: string,
  label: string,
  style: 1 | 2,
  required: boolean,
  value: string,
  maxLength?: number,
): object {
  return {
    type: 1,
    components: [
      {
        type: 4,
        custom_id: customId,
        label,
        style,
        required,
        value,
        ...(maxLength !== undefined ? { max_length: maxLength } : {}),
      },
    ],
  };
}

export function buildModal(channelId: string, defaults: ModalDefaults): object {
  return {
    custom_id: `${EMBED_MODAL_PREFIX}${channelId}`,
    title: "Embed builder",
    components: [
      textInput("title", "Title", 1, true, defaults.title, 256),
      textInput("content", "Content (supports markdown)", 2, true, defaults.content, 4000),
      textInput("color", "Color hex, e.g. #8B9CF6", 1, false, defaults.color, 7),
      textInput("image", "Banner image URL", 1, false, defaults.imageUrl, 512),
      textInput("thumbnail", "Thumbnail image URL", 1, false, defaults.thumbnailUrl, 512),
    ],
  };
}

export function parseModalFields(interaction: {
  data?: { components?: Array<{ components?: Array<{ custom_id?: string; value?: string }> }> };
}): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const row of interaction.data?.components ?? []) {
    for (const input of row.components ?? []) {
      if (input.custom_id) {
        fields[input.custom_id] = input.value ?? "";
      }
    }
  }
  return fields;
}

export function draftFromModal(fields: Record<string, string>): EmbedDraft | null {
  const title = fields.title?.trim() ?? "";
  const content = fields.content?.trim() ?? "";
  if (!title || !content) {
    return null;
  }
  const rawColor = fields.color?.trim() ?? "";
  if (rawColor && normalizeColor(rawColor) === null) {
    return null;
  }
  return {
    title,
    content,
    color: normalizeColor(rawColor) ?? DEFAULT_EMBED_COLOR,
    imageUrl: fields.image?.trim() || null,
    thumbnailUrl: fields.thumbnail?.trim() || null,
  };
}

export function parseModalCustomId(customId: string): string | null {
  if (!customId.startsWith(EMBED_MODAL_PREFIX)) {
    return null;
  }
  const channelId = customId.slice(EMBED_MODAL_PREFIX.length);
  return channelId || null;
}

export interface ConfirmIds {
  authorId: string;
  channelId: string;
  messageId: string;
}

export function buildConfirmCustomId(
  prefix: string,
  ids: ConfirmIds,
): string {
  return `${prefix}${ids.authorId}:${ids.channelId}:${ids.messageId}`;
}

export function parseConfirmCustomId(
  prefix: string,
  customId: string,
): ConfirmIds | null {
  if (!customId.startsWith(prefix)) {
    return null;
  }
  const [authorId, channelId, messageId] = customId
    .slice(prefix.length)
    .split(":");
  if (!authorId || !channelId || !messageId) {
    return null;
  }
  return { authorId, channelId, messageId };
}

export function buildConfirmButtons(ids: ConfirmIds): object {
  return {
    type: 1,
    components: [
      {
        type: 2,
        style: 3,
        label: "Keep",
        custom_id: buildConfirmCustomId(EMBED_KEEP_PREFIX, ids),
      },
      {
        type: 2,
        style: 4,
        label: "Delete",
        custom_id: buildConfirmCustomId(EMBED_DELETE_PREFIX, ids),
      },
    ],
  };
}
