# Xuanyu Personal Site (Astro)

Simple personal site with:

- home page
- apps section (`/apps/`) with app routes (`/qimen/`, `/menu/`)
- markdown blog (`/blog/`)
- optional Typst export pipeline

## Structure

```text
.
├── public/
│   ├── CNAME
│   └── typst/            # generated Typst PDFs
├── scripts/
│   ├── build-typst.sh
│   └── import-blogs.sh
├── src/
│   ├── apps/             # shared app metadata
│   ├── content/blog/     # blog markdown files
│   ├── layouts/
│   └── pages/            # Astro routes for blog, apps, and app pages
└── typst/                # source .typ files
```

## Sections

- Blog: `/blog/`, backed by Markdown files in `src/content/blog/`
- Apps: `/apps/`, backed by shared app metadata in `src/apps/apps.ts`
- App routes: `/qimen/` and `/menu/`, implemented as Astro pages in `src/pages/`

## Commands

- `npm run dev`: local dev server
- `npm run build`: Astro production build
- `npm run preview`: preview build
- `npm run import:blogs`: import markdown from `../knowledge` (auto-detects `blog/`, `blogs/`, `content/blog/`, `dist/blog/`, `out/blog/`)
- `npm run build:typst`: compile `typst/*.typ` to `public/typst/*.pdf`

## Blog Workflow

1. Generate or write markdown posts in `../knowledge/blogs`.
2. Run `npm run import:blogs` in this repo.
3. Start local site with `npm run dev`.
4. Build/deploy with `npm run build`.

## Typst Workflow

1. Put `.typ` files in `typst/`.
2. Run `npm run build:typst`.
3. Link generated files in posts, for example `/typst/my-note.pdf`.

Typst is optional. If not installed, the main Astro site still works.
