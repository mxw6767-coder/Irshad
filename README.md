# Irshad

A dark-themed end-to-end encrypted messenger scaffold for a small trusted group.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Socket.IO
- Libsodium for client-side encryption primitives

## Current shape

- Dark Discord/Signal-inspired chat layout
- Conversation sidebar, message list, and composer
- Prisma schema for users, devices, conversations, sessions, and encrypted messages
- API routes for auth, devices, conversations, sessions, and message mutations
- Feature-layered auth, identity, messaging, and socket contracts
- Encryption helpers isolated behind a crypto module boundary

## Next steps

- Wire Socket.IO into a persistent Node runtime
- Add auth flows and session handling
- Move message encryption/decryption into a real client key-management flow
- Add read receipts, typing events, and soft-delete/edit mutations
- Package with Tauri once the web app stabilizes

## Deployment

- `Vercel`: deploy the Next.js app from `mxw6767-coder/Irshad`
- `Railway`: deploy `server.js` with `npm run realtime`
- `Supabase`: use PostgreSQL for app data and ciphertext storage

## Setup tips

- Keep `DATABASE_URL` pointed at the pooled Supabase URL for Vercel.
- Keep `DIRECT_URL` pointed at the direct Supabase URL for migrations and persistent runtimes.
- Set `NEXT_PUBLIC_SOCKET_URL` to the Railway public realtime endpoint.
- Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL after the first deploy.
- Run `npm run build` locally before deploying to catch type issues early.
- Use the `master` branch for deployment unless you intentionally create a release branch.
- Keep secrets out of the repo; store them only in Vercel and Railway variables.
- If a deployment fails, check whether Prisma client generation ran during install.

## Environment variables

- `DATABASE_URL`: Supabase pooled connection string for Vercel
- `DIRECT_URL`: Supabase direct connection string for Prisma migrations / Railway
- `NEXT_PUBLIC_APP_URL`: Vercel production URL
- `NEXT_PUBLIC_SOCKET_URL`: Railway realtime URL
- `NEXT_PUBLIC_ENTRY_PASSWORD`: starter access code for the two-person workspace
- `SUPABASE_URL`: `https://vkhuknmxfibruljialve.supabase.co`
- `SUPABASE_ANON_KEY`: your publishable key

## Access model

- Open the site on `/entry` first.
- Enter the starter access code to unlock the workspace.
- Register or log in to either `Cat` or `Fox` using a profile password.
- The active profile is stored in this browser for this device.
- The access cookie keeps the app locked behind the entry code on repeat visits.
- IP binding is not used; browser/device persistence is the reliable approach here.

## Profile rules

- Allowed animal names are short and capped at 5 characters.
- If `Cat` or `Fox` are already taken, the gate shows fallback options like `Owl`, `Bear`, and `Lynx`.
- Each animal name can be registered once per browser/profile store.
