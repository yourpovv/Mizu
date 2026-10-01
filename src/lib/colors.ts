export interface ColorOption {
  label: string;
  value: string;
  emoji: string;
}

export const COLOR_CUSTOM_ID = "color_select";

export const COLOR_MENU = {
  color: 0xff69b4,
  title: "🎨 pick your color role",
  description: "choose your favorite color from the dropdown below",
  placeholder: "pick a color",
  options: [
    { label: "Red", value: "red", emoji: "🔴" },
    { label: "Orange", value: "orange", emoji: "🟠" },
    { label: "Yellow", value: "yellow", emoji: "🟡" },
    { label: "Green", value: "green", emoji: "🟢" },
    { label: "Blue", value: "blue", emoji: "🔵" },
    { label: "Purple", value: "purple", emoji: "🟣" },
    { label: "Magenta", value: "magenta", emoji: "🌺" },
    { label: "Cyan", value: "cyan", emoji: "🩵" },
    { label: "Pink", value: "pink", emoji: "🩷" },
    { label: "Lavender", value: "lavender", emoji: "🪻" },
    { label: "Black", value: "black", emoji: "⚫" },
    { label: "White", value: "white", emoji: "⚪" },
    { label: "Grey", value: "grey", emoji: "🩶" },
  ] as ColorOption[],
} as const;

const COLOR_ROLE_ENV_VARS: Record<string, string> = {
  red: "RED_ROLE",
  orange: "ORANGE_ROLE",
  yellow: "YELLOW_ROLE",
  green: "GREEN_ROLE",
  blue: "BLUE_ROLE",
  purple: "PURPLE_ROLE",
  magenta: "MAGENTA_ROLE",
  cyan: "CYAN_ROLE",
  pink: "PINK_ROLE",
  lavender: "LAVENDER_ROLE",
  black: "BLACK_ROLE",
  white: "WHITE_ROLE",
  grey: "GREY_ROLE",
};

export function resolveColorRoleId(
  value: string,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const variable = COLOR_ROLE_ENV_VARS[value];
  if (!variable) {
    return null;
  }
  return env[variable]?.trim() || null;
}

export function allColorRoleIds(
  env: Record<string, string | undefined> = process.env,
): string[] {
  return Object.keys(COLOR_ROLE_ENV_VARS)
    .map((value) => resolveColorRoleId(value, env))
    .filter((id): id is string => id !== null);
}

export function rolesToRemove(
  memberRoleIds: string[],
  menuRoleIds: string[],
  newRoleId: string | null,
): string[] {
  return menuRoleIds.filter(
    (id) => id !== newRoleId && memberRoleIds.includes(id),
  );
}

export interface ColorPickerMessage {
  embeds: Array<{ title: string; description: string; color: number }>;
  components: Array<{
    type: 1;
    components: Array<{
      type: 3;
      custom_id: string;
      placeholder: string;
      options: Array<{
        label: string;
        value: string;
        emoji: { name: string };
      }>;
    }>;
  }>;
}

export function buildColorPicker(): ColorPickerMessage {
  return {
    embeds: [
      {
        title: COLOR_MENU.title,
        description: COLOR_MENU.description,
        color: COLOR_MENU.color,
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: COLOR_CUSTOM_ID,
            placeholder: COLOR_MENU.placeholder,
            options: COLOR_MENU.options.map((option) => ({
              label: option.label,
              value: option.value,
              emoji: { name: option.emoji },
            })),
          },
        ],
      },
    ],
  };
}
