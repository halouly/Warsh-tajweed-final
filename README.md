# القارئ برواية ورش التفاعلي — Warsh Tajweed Reader

A web-based Quran reader with color-coded Tajweed rules, specifically built for **Warsh recitation** (رواية ورش عن نافع). The app highlights each Tajweed rule in a distinct color so learners can see the rules as they read and listen.

## Features

### Tajweed Color Coding
The engine automatically detects and highlights Tajweed rules in the Quranic text:

| Color | Rule | Arabic |
|-------|------|--------|
| 🟢 Green | Ghunnah | غنة |
| 🔵 Blue | Qalqalah | قلقلة |
| 🔵 Dark Blue (bold) | Heavy Letters / Ra Heavy | تفخيم / ر تفخيم |
| 🔵 Cyan | Ra Light | ر ترقيق |
| 🔴 Red | Madd | مد |
| ⚪ Gray | Silent Letters | ساكن |
| 🟠 Orange (bold) | Special (Warsh-specific) | خاص |

### Audio Playback
- Three Warsh reciters: Ibrahim Al-Dosary, Yassin Al-Jazaery, Abdul Basit
- Play/Pause/Resume controls
- Loop with configurable repeat count
- Auto-highlights the current ayah during playback
- Fullscreen mode during playback (hides navigation, shows only player controls)

### Navigation
- All 114 surahs with Arabic names
- View all ayahs or paginate by 5, 10, or a custom number
- Previous/Next surah buttons
- Quick search across the entire Quran

### User Features
- Bookmarks (saved in localStorage)
- Dark mode
- Adjustable text size, line height, word spacing, and content width
- Tajweed legend panel explaining each color rule

### Developer Mode
A built-in Dev Mode for customizing the Tajweed engine:

- **Conditions tab** — edit which letters trigger each rule, toggle individual detection patterns on/off
- **Overrides tab** — click any letter in the text to assign it a custom color
- **Colors tab** — change the color of any Tajweed rule, add custom rules
- **GitHub tab** — save your configuration directly to a GitHub repository as `tajweed-config.json`
- Export configuration as JSON

## File Structure

```
├── index.html              # Main app (UI + all JS logic)
├── engine.js               # Tajweed detection engine
├── tajweed-config.json     # Saved color/rule configuration
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
└── data/
    ├── 1.json              # Al-Fatiha verse data
    ├── 2.json              # Al-Baqarah verse data
    └── ...                 # One JSON file per surah (1–114)
```

## Setup

1. Clone the repository
2. Serve it with any static file server (or open via GitHub Pages)

```bash
# Example with Python
python3 -m http.server 8000

# Example with Node
npx serve .
```

3. Open in a browser

No build step required. The app runs entirely in the browser.

## Surah Data Format

Each file in `data/` is a JSON object:

```json
{
  "name_ar": "الفاتحة",
  "name_en": "Al-Fatiha",
  "verses": [
    "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
    "..."
  ]
}
```

## Configuration

The app loads configuration from two sources (in order):

1. `tajweed-config.json` — served alongside the app (takes priority)
2. `localStorage` — browser-local settings

Configuration includes rule colors, bold settings, detection patterns, letter overrides, condition letters, and letter sets.

To save your configuration to GitHub from the app, open Dev Mode → 🎨 panel → GitHub tab, enter your token and repo details, and click Save.

## Engine Overview

`engine.js` handles all Tajweed detection. Key concepts:

- **Rules** — each Tajweed category (Ghunnah, Qalqalah, Madd, etc.) with a color and detection patterns
- **Conditions** — which letters and triggers activate each rule
- **Sets** — letter groups used in detection (Idgham letters, Ikhfa letters, Lam Shamsiyya letters, Hamza forms)
- **Overrides** — per-letter color overrides at specific surah/verse/position

The `detect(text)` function scans the text and returns an array of annotations `{s, e, cls}` marking start, end, and rule class. The `renderVerse()` function applies these as inline styles.

## Warsh-Specific Notes

This app includes support for Warsh-specific markers and rules:

- Explicit Ghunnah/Ikhfa markers (U+065E `ٞ` and U+065F `ٗ`)
- Madd sign detection (U+0653 `ٓ`)
- Superscript Waw/Ya Madd handling via customized Madd letters field
- Warsh dot marker (U+06EC)

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). Works on mobile with responsive controls.

## License

This project is for educational use in teaching Tajweed rules for Warsh recitation.
