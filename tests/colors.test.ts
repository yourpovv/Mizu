import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  allColorRoleIds,
  buildColorPicker,
  COLOR_CUSTOM_ID,
  COLOR_MENU,
  resolveColorRoleId,
  rolesToRemove,
} from "../src/lib/colors.js";

const testEnv = {
  RED_ROLE: "111",
  BLUE_ROLE: "222",
  PINK_ROLE: "",
};

describe("resolveColorRoleId", () => {
  it("resolves a configured color to its role id", () => {
    assert.equal(resolveColorRoleId("red", testEnv), "111");
  });

  it("returns null for an empty role id", () => {
    assert.equal(resolveColorRoleId("pink", testEnv), null);
  });

  it("returns null for an unconfigured color", () => {
    assert.equal(resolveColorRoleId("green", testEnv), null);
  });

  it("returns null for an unknown value", () => {
    assert.equal(resolveColorRoleId("invisible", testEnv), null);
  });
});

describe("allColorRoleIds", () => {
  it("lists only configured role ids", () => {
    assert.deepEqual(allColorRoleIds(testEnv), ["111", "222"]);
  });
});

describe("rolesToRemove", () => {
  it("removes other menu roles but keeps the new one", () => {
    assert.deepEqual(
      rolesToRemove(["111", "222", "999"], ["111", "222"], "222"),
      ["111"],
    );
  });

  it("leaves non-menu roles alone", () => {
    assert.deepEqual(rolesToRemove(["999"], ["111", "222"], "111"), []);
  });
});

describe("buildColorPicker", () => {
  it("builds the color select menu", () => {
    const message = buildColorPicker();
    const select = message.components[0].components[0];

    assert.equal(select.custom_id, COLOR_CUSTOM_ID);
    assert.equal(select.placeholder, COLOR_MENU.placeholder);
    assert.equal(select.options.length, 13);
    assert.equal(message.embeds[0].title, COLOR_MENU.title);
  });
});
