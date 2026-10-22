# Perpustakaan Digital Feri Setiadi

A personal digital publishing website for public book catalogs and interactive flipbook reading.

## Goals

- Public catalog and book detail pages that require no reader login.
- Interactive page-flip reader.
- Separate protected admin area for book metadata, cover images, PDFs, drafts, and publication status.
- Visual identity aligned with [ferisetiadi.my.id](https://ferisetiadi.my.id), with catalog and reader UX inspired by common digital publishing platforms.
- Target domain: https://ebook.ferisetiadi.my.id

## Development status

This repository starts with the foundation and design prototype. Database, file upload, authentication, and production flipbook rendering must be implemented and tested before being considered production-ready.

## Local development

```bash
npm install
npm run dev
```

## Planned stack

- React + TypeScript + Vite
- React Router
- Page-flip reader library (planned)
- PostgreSQL and object storage (planned)
- Vercel deployment

## Security notes

- Never commit credentials, API keys, private PDFs, or environment files.
- Draft books must never appear in public catalog endpoints.
- Admin mutations must be authorized server-side; hiding UI controls is not sufficient.
