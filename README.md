# Hana Abdelkader — Portfolio

Personal portfolio website showcasing my work in AI/ML, RAG systems, and software development.

## Tech Stack

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, glassmorphism, responsive grid, animations
- **Vanilla JavaScript** — Intersection Observer scroll animations, mobile nav
- **Google Fonts** — Inter + Space Grotesk

No build tools, bundlers, or frameworks required.

## Getting Started

### Run Locally

Simply open `index.html` in your browser — no server needed:

```bash
# macOS
open index.html

# Windows
start index.html

# Or use a local dev server (optional, for live reload):
npx serve .
```

### Customize

Search for `[PLACEHOLDER]` across the codebase to find all spots that need your real data:

| Placeholder             | File         | What to replace with                    |
|-------------------------|--------------|-----------------------------------------|
| `[GITHUB_REPO_LINK]`   | index.html   | GitHub URL for each project             |
| `[GITHUB_PROFILE_LINK]`| index.html   | Your GitHub profile URL                 |
| `[EMAIL]`              | index.html   | Your email address                      |
| `[C Game Name]`        | index.html   | Your C game's actual title              |
| `[Your Photo]`         | index.html   | Replace the div with an `<img>` tag     |

## Deploy

### GitHub Pages

1. Push this folder to a GitHub repo.
2. Go to **Settings → Pages → Source** → select `main` branch, `/ (root)`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

### Netlify

1. Drag-and-drop the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
2. Done — instant deploy, custom domain available.

### Vercel

```bash
npx vercel --prod
```

## Project Structure

```
Portfolio/
├── index.html        # Single-page portfolio
├── css/
│   └── style.css     # Design system & responsive styles
├── js/
│   └── main.js       # Scroll animations & interactions
└── README.md         # This file
```

## License

MIT — feel free to fork and adapt.
