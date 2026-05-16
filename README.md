# AI Docs Editor

A modern personal document editor with AI assistant built using Next.js 15, TailwindCSS, Tiptap, Prisma, SQLite, and Zustand.

## Fitur

- Sidebar dokumen
- Editor rich text dengan Tiptap
- AI Assistant panel kanan
- Auto-save ke SQLite
- CRUD dokumen
- Dark mode modern
- Responsive layout
- Keyboard shortcut ready (Ctrl+S, Ctrl+K)

## Struktur Folder

- `app/` - App Router pages dan API routes
- `components/` - UI komponen reusable
- `lib/` - Helper dan Prisma client
- `store/` - Zustand state store
- `prisma/` - Schema Prisma dan migrasi

## Setup

1. Copy `.env.example` ke `.env`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client dan migrate database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Jalankan development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `DATABASE_URL` - URL SQLite, contoh: `file:./dev.db`
- `GEMINI_API_KEY` - API key untuk Gemini
- `GEMINI_API_URL` - Endpoint API Gemini

## Catatan

AI integration di `app/api/ai/chat/route.ts` dapat disesuaikan dengan endpoint Gemini sebenarnya.
