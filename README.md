<div align="center">

# Mizu
**Community server bot made for Sleepy's Server**

<img width="1200" height="400" alt="image" src="assets/banner.png" />

</div>

## setup

To get Mizu running, install the dependencies, configure your environment, and deploy it to Vercel:

1. Run `npm install` to install the dependencies.
2. Add your environment variables to `.env`.
3. Run `npm run register` to register the slash commands with Discord.
4. Deploy to [Vercel](https://vercel.com/) and add the same environment variables there.
5. In your Discord application settings, set the Interactions Endpoint URL to `https://<your-app>.vercel.app/api/interactions`.

## updating commands

When you add, rename, or change a command, register it with Discord. Deploying updates the bot, but it doesn't update Discord's command list. Run the register command locally, then push your changes:

1. Run `npm run register` locally. It reads the values in your `.env` file.
2. Commit and push your changes. Vercel will deploy the updated bot.

If you only change what an existing command does, you don't need to register it again. Just push the code.

--- 

### environment variables
```ini
DISCORD_PUBLIC_KEY=
DISCORD_APP_ID=
DISCORD_BOT_TOKEN=

# Color role IDs for the color picker
RED_ROLE=
ORANGE_ROLE=
YELLOW_ROLE=
GREEN_ROLE=
BLUE_ROLE=
PURPLE_ROLE=
MAGENTA_ROLE=
CYAN_ROLE=
PINK_ROLE=
LAVENDER_ROLE=
BLACK_ROLE=
WHITE_ROLE=
GREY_ROLE=

# Game role IDs for game pings
ROBLOX_ROLE=
MINECRAFT_ROLE=
AMONG_US_ROLE=
MECCHA_CHAMELEON_ROLE=
BUCKSHOT_ROULETTE_ROLE=
DEAD_BY_DAYLIGHT_ROLE=
PHASMOPHOBIA_ROLE=
REPO_ROLE=
TERRARIA_ROLE=
STARDEW_VALLEY_ROLE=
VALORANT_ROLE=
OVERWATCH_ROLE=
APEX_LEGENDS_ROLE=
FORTNITE_ROLE=
LETHAL_COMPANY_ROLE=
```

### color roles

For each color, set the role's color in **Server Settings > Roles** to the matching hex value:

| role    | hex       |
|---------|-----------|
| Red     | `#ED4245` |
| Orange  | `#E67E22` |
| Yellow  | `#D4AC0D` |
| Green   | `#27AE60` |
| Blue    | `#0099FF` |
| Purple  | `#A855F7` |
| Magenta | `#D946EF` |
| Cyan    | `#00BCD4` |
| Pink    | `#E84393` |
| Lavender| `#8B7CF6` |
| Black   | `#000000` |
| White   | `#FFFFFF` |
| Grey    | `#808080` |

## commands

### utility

| command         | description                                             |
|-----------------|---------------------------------------------------------|
| `/credits`      | shows the bot credits                                   |
| `/color-picker` | posts the color role picker (**admin only**)                |
| `/game-picker`  | posts the game ping role picker (**admin only**)            |
| `/embed`        | builds a custom embed with preview (**Manage Server only**) |

After you register a new or renamed command, it can take up to an hour to appear, though it usually shows up within a few minutes. If you don't see it, restart Discord to refresh the command list. The picker commands are restricted to server admins.

## stack

- Mizu is written in strict [TypeScript](https://www.typescriptlang.org/).
- It uses [discord-interactions](https://docs.discord.com/developers/interactions/overview) to verify requests and handle interaction types.
- It runs as a serverless function on [Vercel](https://vercel.com/docs/functions/runtimes/node-js).
- It uses [tsx](https://www.tsx.com/) to run the command registration script and tests.

All commands, buttons, and modals are routed through the single serverless function in [`api/interactions.ts`](./api/interactions.ts). When you add a feature, add its handler there instead of creating another file in `api/`. Vercel runs the function when Discord sends an interaction.

## gateway intents

Mizu doesn't need gateway intents since Discord sends interactions to `/api/interactions` over HTTP `POST`, and the handler verifies each request with your app's Ed25519 public key.

## required bot permissions

To assign or remove roles, the bot needs **Manage Roles**. Its role also needs to be above every color and game role it manages.

| permission     | used by         |
|----------------|-----------------|
| Manage Roles   | `/color-picker`, `/game-picker` |

---

## Support & Contact

[YourPOV](https://yourpov.dev/)

> **Last Updated:** October 7th, 2026
