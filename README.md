# jianggewu.com

Personal portfolio website for Jiangge Wu — a backend software engineer based in Singapore.

Built with [Astro](https://astro.build), TypeScript, and Tailwind CSS. Deployed to GitHub Pages.

## Pages

- **Home** — Hero introduction, featured projects, experience overview
- **About** — Background, technical focus, work philosophy
- **Projects** — Detailed project cards with problem/approach/result
- **Experience** — Professional timeline (reverse chronological)
- **Blog** — Integrated Markdown notebook with topic navigation and full-text search
- **Contact** — Email, GitHub, LinkedIn, location

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev -- --background

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This site deploys to GitHub Pages via GitHub Actions. Every push to `main` triggers an automatic build and deploy.

### GitHub Repository Setup

1. Go to your repository **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. The workflow at `.github/workflows/deploy.yml` handles the rest

### Custom Domain (GoDaddy + GitHub Pages)

1. In your GitHub repository **Settings** → **Pages** → **Custom domain**, enter `jianggewu.com`
2. In GoDaddy DNS settings, add these records:

   **For apex domain (`jianggewu.com`):**
   | Type | Name | Value |
   |------|------|-------|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

   **For www subdomain (optional):**
   | Type | Name | Value |
   |------|------|-------|
   | CNAME | www | jianggewu.com |

3. Back in GitHub Pages settings, check **Enforce HTTPS** (may take a few minutes after DNS propagates)
4. DNS changes can take up to 48 hours to fully propagate

The `public/CNAME` file is already configured with `jianggewu.com`.

## Content Updates

### Resume

Place your PDF resume at:

```
public/resume/jiangge-wu-resume.pdf
```

All "Download Resume" buttons link to this file.

### Contact Information

Edit `src/config/site.ts` and replace the TODO values:

```typescript
email: 'your-actual@email.com',
githubUrl: 'https://github.com/your-username',
linkedinUrl: 'https://linkedin.com/in/your-profile',
```

### Blog content

Articles live in `src/content/blog/`. Keep the topic directory structure; `_index.md`
defines a collection page, and regular `.md` files define notes. Frontmatter supports
`title`, `description`, `date`, `updated`, `weight`, `tags`, and `draft`. Dates are
optional; undated notes stay accessible through topics and search. Use `updated`
only when an actual update date is known. Drafts are excluded from pages and search.

For example, `src/content/blog/tech/notes/example.md` becomes
`/blog/tech/notes/example/`. Use absolute `/blog/.../` links between notes.
Empty collections keep their URLs but are hidden from navigation. Markdown files
with content in `_index.md` keep that content on the collection page.

After editing, run `npm run build` and `python3 scripts/check-blog.py`.
Preview with `npm run dev -- --background` (add `--port 4323` if needed).
Manage the background server with `npm run astro -- dev status`,
`npm run astro -- dev logs`, and `npm run astro -- dev stop`.

See [migration notes](docs/blog-migration.md) for the jacksite import details.

### Work Experience

Edit `src/data/experience.ts` — replace the placeholder entries with your real employment history.

### Projects

Edit `src/data/projects.ts` — update or add projects. Each project has these fields:

- `slug` — URL-friendly identifier
- `title` — Project name
- `description` — Short summary
- `problem` — What problem it solved
- `role` — Your role
- `approach` — Technical approach
- `keyDecisions` — Important technical decisions
- `techStack` — Technologies used
- `result` — Outcome
- `learned` — Key takeaways
- `featured` — Show on homepage

### Open Graph Image

Replace `public/images/og-default.png` with a 1200x630 image for social media previews.

## Tech Stack

- **Astro** — Static site generator
- **TypeScript** — Type safety
- **Tailwind CSS v4** — Utility-first styling
- **GitHub Pages** — Hosting
- **GitHub Actions** — CI/CD
