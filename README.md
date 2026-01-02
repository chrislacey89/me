# chrislacey.dev

Personal portfolio site built with Astro, Tailwind CSS, and deployed on Vercel.

**[chrislacey.dev](https://chrislacey.dev)**

## Tech Stack

- **Framework:** [Astro](https://astro.build) v5
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4
- **Fonts:** Geist Sans & Geist Mono
- **Deployment:** [Vercel](https://vercel.com)
- **Linting:** [Biome](https://biomejs.dev)

## Features

- Animated particle background
- Interactive skill icons with hover effects
- Magnetic button interactions
- Scroll-triggered reveal animations
- Dynamic OG image generation
- View transitions between pages
- Responsive design

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Astro components
├── data/            # JSON content files
├── layouts/         # Page layouts
├── pages/           # Routes (index, about, projects, contact)
│   └── api/         # API routes (OG image generation)
├── scripts/         # Client-side TypeScript
└── styles/          # Global CSS
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint & format
pnpm check
```

## License

MIT
