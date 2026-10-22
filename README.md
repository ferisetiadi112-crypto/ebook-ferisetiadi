# Feri Setiadi Digital Library

A React + Vite public ebook catalogue with a PostgreSQL-backed publication API, secure admin sessions, private Vercel Blob uploads, and a PDF.js reader.

## Architecture
- Frontend: React, TypeScript, Vite, React Router.
- Database: Neon PostgreSQL (admins, admin_sessions, books).
- File storage: private Vercel Blob; readers receive PDFs through a published-book endpoint, not a raw storage URL.
- Authentication: bcrypt password hashes, HttpOnly/Secure/SameSite session cookie, server-side session expiry.
- Public readers do not need an account. Draft books are visible only to authenticated admins.

## Vercel environment variables
- DATABASE_URL — Neon PostgreSQL connection string (sensitive).
- SESSION_SECRET — long random secret for session operations.
- SETUP_SECRET — one-time key to create the first admin. Remove this variable after the first admin account is created.
- BLOB_READ_WRITE_TOKEN — connected by Vercel Blob storage integration.

## First admin
1. Deploy to Vercel and wait for the deployment to become Ready.
2. Open /admin, choose Aktivasi admin pertama, and enter SETUP_SECRET, an admin email, and a password of at least 12 characters.
3. Sign in, then remove SETUP_SECRET from Vercel project environment variables and redeploy.
4. Use the admin studio to upload a PDF (up to 50 MB), enter metadata, save as draft, or publish.

## Local development
Copy environment values into .env.local (never commit it), then run npm install and npm run dev. Vercel API routes require Vercel dev/runtime for local API testing.

## Database schema
See db/migrations/001_initial_schema.sql. The schema is also provisioned in the connected Neon project.

## Important
- Never commit database URLs, blob tokens, session secrets, or admin passwords.
- Published books are public; draft PDFs are served only after admin authentication.
- Remove/replace a book's PDF from Vercel Blob separately if its database record is deleted.
