export const Portfolio  = "https://yourpov.dev/";
export const YourPOV    = "1470172610636808425";
export const githubRepo = "https://github.com/yourpovv/Mizu";

export interface CreditsMessage {
  embeds: Array<{ title: string; description: string; color: number }>;
}

export function buildCreditsMessage(): CreditsMessage {
  return {
    embeds: [
      {
        title: "₊˚⊹ meet Mizu ⊹˚₊",
        description: [
          "⋆｡˚ ☁︎ a sleepy little cloud helper ☁︎ ˚｡⋆",
          "",
          "꒷︶♡︶꒷",
          "",
          `❥ made with ♡ by [YourPOV](${Portfolio}) (<@${YourPOV}>)`,
          `❥ built with TypeScript ・ open source: [yourpovv/Mizu](${githubRepo})`,
          "",
          "꒷︶♡︶꒷",
        ].join("\n"),
        color: 0x8c96ff,
      },
    ],
  };
}