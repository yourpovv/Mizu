import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { config as discordConfig } from "../src/config.js";
import { buildCreditsMessage } from "../src/lib/credits.js";
import { buildColorPicker, COLOR_CUSTOM_ID } from "../src/lib/colors.js";
import {
  handleColorSelect,
  type ColorSelectInteraction,
} from "../src/lib/color-select.js";
import {
  handleEmbedCommand,
  handleEmbedConfirm,
  handleEmbedModalSubmit,
} from "../src/lib/embed-flow.js";
import {
  EMBED_DELETE_PREFIX,
  EMBED_KEEP_PREFIX,
  EMBED_MODAL_PREFIX,
} from "../src/lib/embeds.js";

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const streamed = Buffer.concat(chunks).toString("utf8");
  if (streamed.length > 0) {
    return streamed;
  }
  if (typeof req.body === "string" && req.body.length > 0) {
    return req.body;
  }
  if (req.body !== undefined && typeof req.body === "object" && req.body !== null) {
    return JSON.stringify(req.body);
  }
  return streamed;
}

interface DiscordInteraction {
  type: number;
  guild_id?: string;
  channel_id?: string;
  member?: { user: { id: string } };
  user?: { id: string };
  data?: {
    name?: string;
    custom_id?: string;
    values?: string[];
    options?: Array<{ name: string; value?: string }>;
    components?: Array<{
      components?: Array<{ custom_id?: string; value?: string }>;
    }>;
  };
}

function parseInteraction(rawBody: string): DiscordInteraction | null {
  try {
    return JSON.parse(rawBody) as DiscordInteraction;
  } catch {
    return null;
  }
}

async function isValidRequest(
  rawBody: string,
  signature: string | string[] | undefined,
  timestamp: string | string[] | undefined,
): Promise<boolean> {
  if (typeof signature !== "string" || typeof timestamp !== "string") {
    return false;
  }
  try {
    return await verifyKey(rawBody, signature, timestamp, discordConfig.publicKey);
  } catch {
    return false;
  }
}

function handleColorsCommand(res: VercelResponse): void {
  res.status(200).json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: buildColorPicker(),
  });
}

const componentHandlers: Record<
  string,
  (interaction: ColorSelectInteraction, res: VercelResponse) => Promise<void>
> = {
  [COLOR_CUSTOM_ID]: handleColorSelect,
};

function handleCredits(res: VercelResponse): void {
  res.status(200).json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: buildCreditsMessage(),
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];

  if (!(await isValidRequest(rawBody, signature, timestamp))) {
    res.status(401).send("Invalid request signature");
    return;
  }

  const interaction = parseInteraction(rawBody);
  if (interaction === null) {
    res.status(400).json({ error: "Invalid interaction payload" });
    return;
  }

  if (interaction.type === InteractionType.PING) {
    res.status(200).json({ type: InteractionResponseType.PONG });
    return;
  }

  if (
    interaction.type === InteractionType.APPLICATION_COMMAND &&
    interaction.data?.name === "credits"
  ) {
    handleCredits(res);
    return;
  }

  if (
    interaction.type === InteractionType.APPLICATION_COMMAND &&
    interaction.data?.name === "color-picker"
  ) {
    handleColorsCommand(res);
    return;
  }

  if (
    interaction.type === InteractionType.APPLICATION_COMMAND &&
    interaction.data?.name === "embed"
  ) {
    handleEmbedCommand(interaction, res);
    return;
  }

  if (
    interaction.type === InteractionType.MODAL_SUBMIT &&
    interaction.data?.custom_id?.startsWith(EMBED_MODAL_PREFIX)
  ) {
    await handleEmbedModalSubmit(interaction, res);
    return;
  }

  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data?.custom_id ?? "";
    const handleComponent = componentHandlers[customId];
    if (handleComponent) {
      await handleComponent(interaction, res);
      return;
    }
    if (customId.startsWith(EMBED_KEEP_PREFIX)) {
      await handleEmbedConfirm(interaction, res, true);
      return;
    }
    if (customId.startsWith(EMBED_DELETE_PREFIX)) {
      await handleEmbedConfirm(interaction, res, false);
      return;
    }
  }

  res.status(400).json({ error: "Unknown interaction" });
}
