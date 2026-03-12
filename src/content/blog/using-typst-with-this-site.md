---
title: Using Typst With This Site
description: Keep writing simple while still publishing polished docs
date: 2026-03-12
tags:
  - typst
  - writing
---

Typst files can live under `typst/` in this repo.

Build them with:

```bash
npm run build:typst
```

If `typst/notes.typ` exists, the script will generate:

- `/public/typst/notes.pdf`

Then in a post, link it directly:

[Open the generated PDF](/typst/notes.pdf)
