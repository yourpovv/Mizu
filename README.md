<div align="center">

# Mizu
**Community server bot made for Sleepy's Server**

<img width="1200" height="400" alt="image" src="assets/banner.png" />

</div>

## setup

**Deploy to Vercel:**

1. run `npm install`
2. configure the `.env` file
3. run `npm run register` to registers commands globally
4. deploy to [Vercel](https://vercel.com/) with the same env vars set
5. set the app's Interactions Endpoint URL to `https://<your-app>.vercel.app/api/interactions`

## updating commands

Command definitions live in Discord's directory, not in the deploy — pushing to GitHub only updates the bot's code. After adding, renaming, or editing a command:

1. run `npm run register` **locally** (it reads your local `.env`)
2. commit and push — Vercel auto-deploys the new code

Handler-only changes (same names, new behavior) need just the push.

```env
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
```

### color role palette

Set each role to its hex in Server Settings > Roles:

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

| command         | description                              |
|-----------------|------------------------------------------|
| `/ping`         | replies with `pong !!`                   |
| `/color-picker` | posts the color role picker (admin only) |

New or renamed commands take up to an hour to appear (usually minutes). if one is missing, restart Discord to refresh the command list (note admin commands are ran by server admins)

## stack

- [typescript](https://www.typescriptlang.org/) (strict)
- [discord-interactions](https://docs.discord.com/developers/interactions/overview) (signature verification + interaction types)
- [@vercel/node](https://vercel.com/docs/functions/runtimes/node-js) (serverless functions)
- [tsx](https://www.tsx.com/) (dev runner for the register script + tests)

## required gateway intents

none since Discord sends interactions over HTTP `POST` to `/api/interactions` which is verified with the app's Ed25519 public key

| intent | reason                   |
|--------|--------------------------|
| N/A    | not applicable as of now |

## required bot permissions

- `/color-picker` needs **Manage Roles**, and the bot's role must sit **above** the color roles

| permission     | used by         |
|----------------|-----------------|
| Manage Roles   | `/color-picker` |

---

## Support & Contact

[YourPOV](https://yourpov.dev/)

> **Last Updated:** October 1st, 2026
