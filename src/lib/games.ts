export interface GameOption {
  label: string;
  value: string;
  emoji: string;
  roleId: string;
}
 
export const GAME_OPEN_CUSTOM_ID = "game_pings_open";
export const GAME_SELECT_CUSTOM_ID = "game_select";
 
export const COMPONENTS_V2_FLAG = 1 << 15;
 
const GAME_ACCENT = 0x8c96ff;
 
interface GameDefinition extends Omit<GameOption, "roleId"> {
  roleEnvVar: string;
}

const GAME_DEFINITIONS: GameDefinition[] = [
  { label: "Roblox", value: "roblox", emoji: "🧱", roleEnvVar: "ROBLOX_ROLE" },
  { label: "Minecraft", value: "minecraft", emoji: "⛏️", roleEnvVar: "MINECRAFT_ROLE" },
  { label: "Among Us", value: "among-us", emoji: "🧑‍🚀", roleEnvVar: "AMONG_US_ROLE" },
  { label: "Meccha Chameleon", value: "meccha-chameleon", emoji: "🦎", roleEnvVar: "MECCHA_CHAMELEON_ROLE" },
  { label: "Buckshot Roulette", value: "buckshot-roulette", emoji: "🎰", roleEnvVar: "BUCKSHOT_ROULETTE_ROLE" },
  { label: "Dead by Daylight", value: "dead-by-daylight", emoji: "👻", roleEnvVar: "DEAD_BY_DAYLIGHT_ROLE" },
  { label: "Phasmophobia", value: "phasmophobia", emoji: "🔦", roleEnvVar: "PHASMOPHOBIA_ROLE" },
  { label: "R.E.P.O.", value: "repo", emoji: "🤖", roleEnvVar: "REPO_ROLE" },
  { label: "Terraria", value: "terraria", emoji: "🌳", roleEnvVar: "TERRARIA_ROLE" },
  { label: "Stardew Valley", value: "stardew-valley", emoji: "🌾", roleEnvVar: "STARDEW_VALLEY_ROLE" },
  { label: "Valorant", value: "valorant", emoji: "🎯", roleEnvVar: "VALORANT_ROLE" },
  { label: "Overwatch", value: "overwatch", emoji: "🦸", roleEnvVar: "OVERWATCH_ROLE" },
  { label: "Apex Legends", value: "apex-legends", emoji: "🏆", roleEnvVar: "APEX_LEGENDS_ROLE" },
  { label: "Fortnite", value: "fortnite", emoji: "🚌", roleEnvVar: "FORTNITE_ROLE" },
  { label: "Lethal Company", value: "lethal-company", emoji: "🪙", roleEnvVar: "LETHAL_COMPANY_ROLE" },
];

export function loadGameOptions(
  env: Record<string, string | undefined> = process.env,
): GameOption[] {
  return GAME_DEFINITIONS.flatMap(({ roleEnvVar, ...game }) => {
    const roleId = env[roleEnvVar]?.trim();
    return roleId ? [{ ...game, roleId }] : [];
  });
}

export const GAMES = loadGameOptions();
 
export interface GameSelectOption {
  label: string;
  value: string;
  emoji: { name: string };
  description?: string;
  default?: boolean;
}
 
export function gameSelectOptions(memberRoleIds: readonly string[]): GameSelectOption[] {
  const owned = new Set(memberRoleIds);
  return GAMES.map((game) => {
    const hasRole = owned.has(game.roleId);
    const option: GameSelectOption = {
      label: game.label,
      value: game.value,
      emoji: { name: game.emoji },
    };
    if (hasRole) {
      option.description = "you have this ping";
      option.default = true;
    }
    return option;
  });
}
 
export function gameChecklist(memberRoleIds: readonly string[]): string {
  const owned = new Set(memberRoleIds);
  return GAMES.map((game) => {
    const mark = owned.has(game.roleId) ? "✅" : "▫️";
    return `${mark} ${game.emoji} ${game.label}`;
  }).join("\n");
}
 
export interface GameRoleSync {
  addRoleIds: string[];
  removeRoleIds: string[];
  addedNames: string[];
  removedNames: string[];
}
 
export function planGameRoleSync(
  selected: readonly string[],
  memberRoleIds: readonly string[],
): GameRoleSync {
  const wanted = new Set(selected);
  const owned = new Set(memberRoleIds);
  const sync: GameRoleSync = {
    addRoleIds: [],
    removeRoleIds: [],
    addedNames: [],
    removedNames: [],
  };
 
  for (const game of GAMES) {
    const wants = wanted.has(game.value);
    const has = owned.has(game.roleId);
    if (wants && !has) {
      sync.addRoleIds.push(game.roleId);
      sync.addedNames.push(game.label.toLowerCase());
    } else if (!wants && has) {
      sync.removeRoleIds.push(game.roleId);
      sync.removedNames.push(game.label.toLowerCase());
    }
  }
 
  return sync;
}
 
function joinNames(names: string[]): string {
  if (names.length <= 1) {
    return names[0] ?? "";
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
 
export function formatGamePingStatus(added: string[], removed: string[]): string {
  const parts: string[] = [];
  if (added.length > 0) {
    parts.push(`gave you ${joinNames(added)}`);
  }
  if (removed.length > 0) {
    parts.push(`removed ${joinNames(removed)}`);
  }
  if (parts.length === 0) {
    return "no changes, your pings already match";
  }
  return parts.join(" and ");
}
 
export function nextMemberRoleIds(
  memberRoleIds: readonly string[],
  sync: GameRoleSync,
): string[] {
  const removing = new Set(sync.removeRoleIds);
  return memberRoleIds.filter((id) => !removing.has(id)).concat(sync.addRoleIds);
}
 
interface TextDisplay {
  type: 10;
  content: string;
}
 
interface Separator {
  type: 14;
  divider: true;
  spacing: 1;
}
 
interface ButtonRow {
  type: 1;
  components: Array<{
    type: 2;
    style: 1;
    label: string;
    custom_id: string;
  }>;
}
 
interface SelectRow {
  type: 1;
  components: Array<{
    type: 3;
    custom_id: string;
    placeholder: string;
    min_values: number;
    max_values: number;
    options: GameSelectOption[];
  }>;
}
 
export interface ComponentsV2Message {
  flags: number;
  components: Array<{
    type: 17;
    accent_color: number;
    components: Array<TextDisplay | Separator | ButtonRow | SelectRow>;
  }>;
}
 
function container(
  children: Array<TextDisplay | Separator | ButtonRow | SelectRow>,
): ComponentsV2Message {
  return {
    flags: COMPONENTS_V2_FLAG,
    components: [
      {
        type: 17,
        accent_color: GAME_ACCENT,
        components: children,
      },
    ],
  };
}
 
export function buildGamePicker(): ComponentsV2Message {
  return container([
    {
      type: 10,
      content: [
        "## 🎮 game pings",
        "check the games you want to be pinged for.",
      ].join("\n"),
    },
    { type: 14, divider: true, spacing: 1 },
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1,
          label: "manage my pings",
          custom_id: GAME_OPEN_CUSTOM_ID,
        },
      ],
    },
  ]);
}
 
export function buildGamePingEditor(
  memberRoleIds: readonly string[],
  status?: string,
): ComponentsV2Message {
  if (GAMES.length === 0) {
    throw new Error("Game role IDs are not configured as environment variables.");
  }

  const lines = [
    "## your game pings",
    "check games you would like to be pinged for.",
  ];
  if (status) {
    lines.push("", status);
  }
  lines.push("", gameChecklist(memberRoleIds));
 
  return container([
    { type: 10, content: lines.join("\n") },
    { type: 14, divider: true, spacing: 1 },
    {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: GAME_SELECT_CUSTOM_ID,
          placeholder: "your game pings",
          min_values: 0,
          max_values: GAMES.length,
          options: gameSelectOptions(memberRoleIds),
        },
      ],
    },
  ]);
}