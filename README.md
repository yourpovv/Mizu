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

```env
DISCORD_PUBLIC_KEY=
DISCORD_APP_ID=
DISCORD_BOT_TOKEN=
```

## commands

### utility

| command   | description            |
|-----------|------------------------|
| `/ping`   | replies with `pong !!` |

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

- N/A as of now

| permission | used by                                                       |
|------------|---------------------------------------------------------------|
| N/A        | not applicable yet (`/ping` needs nothing beyond being added) |

---

## Support & Contact

[YourPOV](https://yourpov.dev/)

> **Last Updated:** September 30th, 2026
