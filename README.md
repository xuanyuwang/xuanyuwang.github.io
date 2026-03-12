# Xuanyu Personal Site (Astro)

Simple personal site with:

- home page
- app links (`/apps/`, `/qimen/`)
- markdown blog (`/blog/`)
- optional Typst export pipeline

## Structure

```text
.
├── public/
│   ├── CNAME
│   └── typst/            # generated Typst PDFs
├── qimen/                # existing static web app
├── scripts/
│   ├── build-typst.sh
│   └── import-blogs.sh
├── src/
│   ├── content/blog/     # blog markdown files
│   ├── layouts/
│   └── pages/
└── typst/                # source .typ files
```

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
