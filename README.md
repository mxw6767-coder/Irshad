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

## Environment variables

- `DATABASE_URL`: Supabase pooled connection string for Vercel
- `DIRECT_URL`: Supabase direct connection string for Prisma migrations / Railway
- `NEXT_PUBLIC_APP_URL`: Vercel production URL
- `NEXT_PUBLIC_SOCKET_URL`: Railway realtime URL
- `SUPABASE_URL`: `https://vkhuknmxfibruljialve.supabase.co`
- `SUPABASE_ANON_KEY`: your publishable key
