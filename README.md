# 🌶️ Hot Sauce Rater

A simple, beautiful web app for rating and tracking your favorite hot sauces.

![Hot Sauce Rater Screenshot](screenshot.png)

## Features

- **Browse** a curated collection of popular hot sauces
- **Rate** sauces on a 5-star scale
- **Save favorites** with a single click
- **Filter** by favorites, rated, or unrated sauces
- **Sort** by name, heat level, or your ratings
- **Search** by sauce name, brand, or pepper type
- **Persistent storage** - your ratings and favorites are saved locally

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deploy to GitHub Pages

This project is pre-configured for GitHub Pages deployment.

```bash
# Deploy to GitHub Pages (builds and publishes automatically)
npm run deploy
```

Then enable Pages in your repo settings:
1. Go to **Settings** → **Pages**
2. Set source to `gh-pages` branch
3. Your site will be live at `https://yourusername.github.io/hot-sauce-rater/`

> **Note:** If your repo has a different name, update the `base` path in `vite.config.js` to match.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Local Storage** - Data persistence
- **CSS** - Custom styling (no frameworks)

## Project Structure

```
hot-sauce-rater/
├── src/
│   ├── components/
│   │   ├── HotSauceCard.jsx    # Individual sauce card
│   │   ├── HeatLevel.jsx       # Heat indicator (peppers)
│   │   └── StarRating.jsx      # Interactive star rating
│   ├── data/
│   │   └── hotSauces.js        # Sauce database
│   ├── hooks/
│   │   └── useLocalStorage.js  # Persistence hook
│   ├── App.jsx                 # Main app component
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Adding More Sauces

Edit `src/data/hotSauces.js` to add more sauces:

```javascript
{
  id: 13,  // Unique ID
  name: "Your Sauce Name",
  brand: "Brand Name",
  heatLevel: 3,  // 1-5
  maxHeat: 5,
  description: "A description of the sauce.",
  origin: "Country",
  peppers: ["Pepper Type"],
  scoville: "1,000-5,000"
}
```

## Future Enhancements

- [ ] User accounts and cloud sync
- [ ] Add custom sauces
- [ ] Write detailed reviews
- [ ] Social sharing
- [ ] Sauce recommendations
- [ ] Image uploads
- [ ] Community ratings

## License

MIT
