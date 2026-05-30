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
