import { describe, it } from "node:test";
import assert from "node:assert/strict";

const gameRoleEnv = {
  ROBLOX_ROLE: "role-roblox",
  MINECRAFT_ROLE: "role-minecraft",
  AMONG_US_ROLE: "role-among-us",
  MECCHA_CHAMELEON_ROLE: "role-meccha-chameleon",
  BUCKSHOT_ROULETTE_ROLE: "role-buckshot-roulette",
  DEAD_BY_DAYLIGHT_ROLE: "role-dead-by-daylight",
  PHASMOPHOBIA_ROLE: "role-phasmophobia",
  REPO_ROLE: "role-repo",
  TERRARIA_ROLE: "role-terraria",
  STARDEW_VALLEY_ROLE: "role-stardew-valley",
  VALORANT_ROLE: "role-valorant",
  OVERWATCH_ROLE: "role-overwatch",
  APEX_LEGENDS_ROLE: "role-apex-legends",
  FORTNITE_ROLE: "role-fortnite",
  LETHAL_COMPANY_ROLE: "role-lethal-company",
};
Object.assign(process.env, gameRoleEnv);

const {
  buildGamePicker,
  buildGamePingEditor,
  COMPONENTS_V2_FLAG,
  formatGamePingStatus,
  GAME_OPEN_CUSTOM_ID,
  GAME_SELECT_CUSTOM_ID,
  GAMES,
  loadGameOptions,
  gameChecklist,
  gameSelectOptions,
  nextMemberRoleIds,
  planGameRoleSync,
} = await import("../src/lib/games.js");
 
const roblox = GAMES[0];
const minecraft = GAMES[1];
 
describe("game catalog", () => {
  it("lists each game once", () => {
    assert.equal(GAMES.length, 15);
    assert.equal(new Set(GAMES.map((game) => game.value)).size, 15);
    assert.equal(new Set(GAMES.map((game) => game.roleId)).size, 15);
    assert.deepEqual(
      GAMES.map((game) => game.roleId),
      Object.values(gameRoleEnv),
    );
  });

  it("omits games whose role ID is unset or blank", () => {
    assert.deepEqual(
      loadGameOptions({ ROBLOX_ROLE: " 123 ", MINECRAFT_ROLE: " " }),
      [{ label: "Roblox", value: "roblox", emoji: "🧱", roleId: "123" }],
    );
  });
});
 
describe("gameSelectOptions", () => {
  it("marks roles the member already has as selected", () => {
    const options = gameSelectOptions([roblox.roleId]);
    const owned = options.find((option) => option.value === roblox.value);
    const other = options.find((option) => option.value === minecraft.value);
 
    assert.equal(owned?.default, true);
    assert.equal(owned?.description, "you have this ping");
    assert.equal(other?.default, undefined);
    assert.equal(other?.description, undefined);
  });
});
 
describe("gameChecklist", () => {
  it("checks owned games and leaves the rest open", () => {
    const checklist = gameChecklist([roblox.roleId]);
    assert.match(checklist, /✅ 🧱 Roblox/);
    assert.match(checklist, /▫️ ⛏️ Minecraft/);
  });
});
 
describe("planGameRoleSync", () => {
  it("adds newly picked games and removes cleared ones", () => {
    const sync = planGameRoleSync([minecraft.value], [roblox.roleId]);
    assert.deepEqual(sync.addRoleIds, [minecraft.roleId]);
    assert.deepEqual(sync.removeRoleIds, [roblox.roleId]);
    assert.deepEqual(sync.addedNames, ["minecraft"]);
    assert.deepEqual(sync.removedNames, ["roblox"]);
  });
 
  it("leaves unrelated roles and unchanged games alone", () => {
    const sync = planGameRoleSync([roblox.value], [roblox.roleId, "999"]);
    assert.deepEqual(sync.addRoleIds, []);
    assert.deepEqual(sync.removeRoleIds, []);
    assert.deepEqual(nextMemberRoleIds([roblox.roleId, "999"], sync), [
      roblox.roleId,
      "999",
    ]);
  });
 
  it("can clear every game ping", () => {
    const sync = planGameRoleSync([], [roblox.roleId, minecraft.roleId]);
    assert.deepEqual(sync.removeRoleIds, [roblox.roleId, minecraft.roleId]);
    assert.deepEqual(
      nextMemberRoleIds([roblox.roleId, minecraft.roleId, "999"], sync),
      ["999"],
    );
  });
});
 
describe("formatGamePingStatus", () => {
  it("describes adds and removes", () => {
    assert.equal(
      formatGamePingStatus(["minecraft", "valorant"], ["roblox"]),
      "gave you minecraft and valorant and removed roblox",
    );
  });
 
  it("says when nothing changed", () => {
    assert.equal(formatGamePingStatus([], []), "no changes, your pings already match");
  });
});
 
describe("buildGamePicker", () => {
  it("posts a components v2 message with a personal picker button", () => {
    const message = buildGamePicker();
    const button = message.components[0].components[2];
 
    assert.equal(message.flags, COMPONENTS_V2_FLAG);
    assert.equal(button.type, 1);
    if (button.type !== 1) {
      return;
    }
    assert.equal(button.components[0].custom_id, GAME_OPEN_CUSTOM_ID);
  });
});
 
describe("buildGamePingEditor", () => {
  it("builds a multi select prefilled with the member's games", () => {
    const message = buildGamePingEditor([roblox.roleId], "gave you roblox");
    const text = message.components[0].components[0];
    const selectRow = message.components[0].components[2];
 
    assert.equal(text.type, 10);
    if (text.type === 10) {
      assert.match(text.content, /✅ 🧱 Roblox/);
      assert.match(text.content, /gave you roblox/);
    }
    assert.equal(selectRow.type, 1);
    if (selectRow.type !== 1) {
      return;
    }
    const select = selectRow.components[0];
    assert.equal(select.type, 3);
    if (select.type !== 3) {
      return;
    }
    assert.equal(select.custom_id, GAME_SELECT_CUSTOM_ID);
    assert.equal(select.min_values, 0);
    assert.equal(select.max_values, 15);
    assert.equal(select.options.filter((option) => option.default).length, 1);
  });
});