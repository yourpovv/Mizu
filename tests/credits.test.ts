import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildCreditsMessage,
  YourPOV,
  Portfolio,
  githubRepo,
} from "../src/lib/credits.js";
import { Credits } from "../src/commands/credits.js";

describe("Credits command", () => {
  it("is named credits", () => {
    assert.equal(Credits.name, "credits");
  });
});

describe("buildCreditsMessage", () => {
  it("credits the creator with site, discord id, stack, and source", () => {
    const message = buildCreditsMessage();
    const embed = message.embeds[0];

    assert.equal(embed.title, "₊˚⊹ meet Mizu ⊹˚₊");
    assert.ok(embed.description.includes(Portfolio));
    assert.ok(embed.description.includes(YourPOV));
    assert.ok(embed.description.includes("TypeScript"));
    assert.ok(embed.description.includes(githubRepo));
  });
});
