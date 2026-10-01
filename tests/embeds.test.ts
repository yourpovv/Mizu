import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildConfirmButtons,
  buildConfirmCustomId,
  buildEmbed,
  buildModal,
  draftFromModal,
  EMBED_DELETE_PREFIX,
  EMBED_KEEP_PREFIX,
  EMBED_MODAL_PREFIX,
  normalizeColor,
  parseConfirmCustomId,
  parseModalCustomId,
  parseModalFields,
} from "../src/lib/embeds.js";

describe("normalizeColor", () => {
  it("accepts hex with and without hash", () => {
    assert.equal(normalizeColor("#5865F2"), 0x5865f2);
    assert.equal(normalizeColor("5865F2"), 0x5865f2);
  });

  it("rejects empty and malformed colors", () => {
    assert.equal(normalizeColor(null), null);
    assert.equal(normalizeColor(""), null);
    assert.equal(normalizeColor("blurple"), null);
    assert.equal(normalizeColor("#12345"), null);
  });
});

describe("buildEmbed", () => {
  it("includes only the provided optional parts", () => {
    assert.deepEqual(
      buildEmbed({
        title: "Hi",
        content: "hello",
        color: 0xff0000,
        imageUrl: "https://imgur.com/a.png",
        thumbnailUrl: null,
      }),
      {
        title: "Hi",
        description: "hello",
        color: 0xff0000,
        image: { url: "https://imgur.com/a.png" },
      },
    );
  });
});

describe("modal round-trip", () => {
  it("builds a modal and parses its fields back", () => {
    const modal = buildModal("99", {
      title: "Zoomies",
      content: "# hi",
      color: "#8B9CF6",
      imageUrl: "",
      thumbnailUrl: "",
    }) as {
      custom_id: string;
      components: Array<{
        components: Array<{ custom_id: string; value: string }>;
      }>;
    };

    assert.equal(parseModalCustomId(modal.custom_id), "99");

    const fields = parseModalFields({ data: { components: modal.components } });
    const draft = draftFromModal(fields);
    assert.deepEqual(draft, {
      title: "Zoomies",
      content: "# hi",
      color: 0x8b9cf6,
      imageUrl: null,
      thumbnailUrl: null,
    });
  });

  it("rejects missing title/content and bad colors", () => {
    assert.equal(draftFromModal({ title: "", content: "x" }), null);
    assert.equal(draftFromModal({ title: "t", content: "" }), null);
    assert.equal(
      draftFromModal({ title: "t", content: "x", color: "nope" }),
      null,
    );
  });
});

describe("confirm buttons", () => {
  it("round-trips ids through the custom id", () => {
    const ids = { authorId: "1", channelId: "2", messageId: "3" };
    const customId = buildConfirmCustomId(EMBED_KEEP_PREFIX, ids);

    assert.ok(customId.length <= 100);
    assert.deepEqual(parseConfirmCustomId(EMBED_KEEP_PREFIX, customId), ids);
    assert.equal(parseConfirmCustomId(EMBED_DELETE_PREFIX, customId), null);
    assert.equal(parseConfirmCustomId(EMBED_KEEP_PREFIX, "bogus"), null);

    const buttons = buildConfirmButtons(ids) as {
      components: Array<{ custom_id: string }>;
    };
    assert.equal(buttons.components.length, 2);
  });
});

describe("prefixes", () => {
  it("are distinct", () => {
    const prefixes = new Set([
      EMBED_MODAL_PREFIX,
      EMBED_KEEP_PREFIX,
      EMBED_DELETE_PREFIX,
    ]);
    assert.equal(prefixes.size, 3);
  });
});
