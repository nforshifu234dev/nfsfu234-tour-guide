<h1 align="center">🎯 NFSFU234TourGuide</h1>

<p align="center"><i>
Plug-and-play React tour guide library — perfect for onboarding, walkthroughs, and product tours. Lightweight, extensible, and zero heavy dependencies by default.
</i></p>

<p align="center">
  <a href="https://www.npmjs.com/package/nfsfu234-tour-guide">
    <img src="https://img.shields.io/npm/v/nfsfu234-tour-guide?style=for-the-badge" alt="NPM Version">
  </a>
  <a href="https://github.com/nforshifu234dev/nfsfu234-tour-guide/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/nfsfu234-tour-guide?style=for-the-badge" alt="License">
  </a>
  <a href="https://data.jsdelivr.com/v1/package/npm/nfsfu234-tour-guide">
    <img src="https://data.jsdelivr.com/v1/package/npm/nfsfu234-tour-guide/badge" alt="jsDelivr">
  </a>
  <img src="https://img.shields.io/github/last-commit/nforshifu234dev/nfsfu234-tour-guide?style=for-the-badge" alt="Last Commit">
  <img src="https://img.shields.io/github/stars/nforshifu234dev/nfsfu234-tour-guide?style=for-the-badge" alt="Stars">
</p>

---

## 🚀 Why Use NFSFU234TourGuide?

✅ Interactive onboarding, tooltips & walkthroughs  
⚡ Extremely lightweight — **~3-4 kB gzipped** (real app contribution, tree-shaken)  
🖌️ Fully customizable styling (className props + optional Tailwind)  
🌓 Dark / light / custom theme support  
📱 Mobile-aware steps & device-specific content  
🔌 Clean API + lifecycle callbacks  
🕹️ Keyboard navigation (arrows, Enter, Esc)  
🔷 Full TypeScript support  
📦 Works with React 18+ / 19+

---

## 📦 Installation

```bash
npm install nfsfu234-tour-guide
# or
yarn add nfsfu234-tour-guide
# or
pnpm add nfsfu234-tour-guide
```

Only **React** and **React DOM** are required as peer dependencies. Zero other dependencies.

---

## 🧪 Quick Example

```tsx
'use client';
import { Tour } from 'nfsfu234-tour-guide';


const steps = [
  {
    target: '#hero',
    content: 'This is the hero section!',
    position: 'bottom',
    device: 'both',
  },
  {
    target: '#cta',
    content: 'Click here to get started.',
    contentMobile: 'Tap to get started.',
    position: 'top',
    device: 'both',
  },
];

export default function MyComponent() {
  return (
    <div>
      <Tour
        tourId="demo-tour"
        steps={steps}
        theme="dark"
        isActive={true}
        accentColor="#10b981"
        welcomeScreen={{
          enabled: true,
          title: 'Welcome!',
          message: 'Let me show you around.',
          startButtonText: 'Start Tour',
        }}
        buttonLabels={{
          next: 'Next',
          previous: 'Back',
          skip: 'Skip',
          finish: 'Done',
          start: 'Begin',
        }}
        showProgress={true}
        onStart={() => console.log('Tour started')}
        onStepChange={(step) => console.log(`Step ${step + 1}`)}
        onSkip={() => console.log('Skipped')}
        onComplete={() => console.log('Completed')}
      />

      <section id="hero">Hero Content</section>
      <button id="cta">Call to Action</button>
    </div>
  );
}
```

> **Note**: Make sure target elements (`#hero`, etc.) exist in the DOM when the tour starts.

---

## 🧠 Props Reference

| Prop                | Type                               | Description                                      | Default       |
|---------------------|------------------------------------|--------------------------------------------------|---------------|
| `tourId`            | `string`                           | Unique tour identifier                           | `'tour-guide'`|
| `steps`             | `TourStep[]`                       | Array of tour steps (required)                   | —             |
| `isActive`          | `boolean`                          | Show/hide the tour                               | `true`        |
| `theme`             | `'light' \| 'dark' \| 'custom'`   | Visual theme                                     | `'dark'`      |
| `customTheme`       | `ThemeConfig`                      | Full color override (use with `theme="custom"`)  | —             |
| `accentColor`       | `string`                           | Color for progress bar, buttons, highlights      | `'#10b981'`   |
| `welcomeScreen`     | `WelcomeScreenConfig`              | Optional intro screen                            | `{ enabled: false }` |
| `buttonLabels`      | `ButtonLabels`                     | Customize button text                            | English defaults |
| `showProgress`      | `boolean`                          | Show progress bar                                | `true`        |
| `showBranding`      | `boolean`                          | Show "Built with NFSFU234TourGuide" badge on the welcome screen | `true` |
| `className`         | `string`                           | Class for root overlay                           | —             |
| `overlayClassName`  | `string`                           | Class for backdrop                               | —             |
| `tooltipClassName`  | `string`                           | Class for tooltip/welcome box                    | —             |
| `highlightClassName`| `string`                           | Class for highlighted elements                   | `'nfsfu234-tour-highlight'` |
| `onStart`           | `() => void`                       | Fires when tour starts                           | —             |
| `onStepChange`      | `(index: number) => void`          | Fires on every step change                       | —             |
| `onSkip`            | `() => void`                       | Fires when user skips                            | —             |
| `onComplete`        | `() => void`                       | Fires when tour finishes                         | —             |

---

## 🧩 TourStep Interface

| Property        | Type                                      | Description                                 |
|-----------------|-------------------------------------------|---------------------------------------------|
| `target`        | `string`                                  | CSS selector (e.g. `'#hero'`, `'.sidebar'`) |
| `content`       | `string`                                  | Main tooltip text                           |
| `contentMobile` | `string?`                                 | Mobile-specific text (optional)             |
| `position`      | `'top' \| 'bottom' \| 'left' \| 'right'` | Tooltip placement (auto-flips if no space)  |
| `offset`        | `{ x?: number; y?: number }`             | Pixel offset from target                    |
| `device`        | `'desktop' \| 'mobile' \| 'both'`        | Show step on specific devices only          |

---

## 🎨 ThemeConfig Interface

Pass this to `customTheme` when `theme="custom"`:

| Property        | Type     | Description                           |
|-----------------|----------|---------------------------------------|
| `backdrop`      | `string` | Overlay background color              |
| `tooltipBg`     | `string` | Tooltip background color              |
| `tooltipText`   | `string` | Tooltip text color                    |
| `tooltipBorder` | `string` | Tooltip border color                  |
| `buttonBg`      | `string` | Secondary button background           |
| `buttonText`    | `string` | Secondary button text color           |
| `progressBar`   | `string` | Progress bar track color              |
| `highlightRing` | `string` | Glow ring color around target element |

```tsx
<Tour
  theme="custom"
  customTheme={{
    backdrop: 'rgba(0, 0, 0, 0.85)',
    tooltipBg: '#0d0019',
    tooltipText: '#faf5ff',
    tooltipBorder: '#4c1d95',
    buttonBg: '#1a0035',
    buttonText: '#faf5ff',
    progressBar: '#3b0764',
    highlightRing: 'rgba(168, 85, 247, 0.5)',
  }}
  accentColor="#a855f7"
/>
```

---

## ✨ Features

- **Zero dependencies** — React & ReactDOM only
- **~3-4 kB gzipped** real app contribution (tree-shaken)
- Smart tooltip positioning — auto-flips when space is limited, never clips off screen
- Intersection Observer scroll tracking — tooltip stays anchored to its target
- Progress bar
- Click-outside-to-skip
- Keyboard support (arrows, Enter, Esc)
- Scroll lock on welcome screen
- Mobile-aware steps & device-specific content
- i18n ready — every label is a prop, no translation library needed
- Full TypeScript support

---

## ⚖️ How We Compare

| Feature                   | nfsfu234-tour-guide | React Joyride | Shepherd.js   | Intro.js          |
|---------------------------|:-------------------:|:-------------:|:-------------:|:-----------------:|
| Bundle size (gzipped)     | **~3-4 kB ✦**      | ~13 kB        | ~22 kB        | ~15 kB            |
| Dependencies              | **0**               | 3             | 0             | 0                 |
| React peer dep only       | ✅                  | ✅            | ❌            | ❌                |
| TypeScript support        | ✅                  | ✅            | ⚠️ partial   | ❌                |
| Mobile-aware steps        | ✅                  | ❌            | ❌            | ❌                |
| Device-specific content   | ✅                  | ❌            | ❌            | ❌                |
| Custom theme / colors     | ✅                  | ✅            | ✅            | ⚠️ CSS only      |
| Welcome screen            | ✅                  | ❌            | ⚠️ custom    | ⚠️ custom        |
| i18n / RTL support        | ✅                  | ⚠️ partial   | ⚠️ partial   | ✅                |
| Lifecycle hooks           | ✅                  | ✅            | ✅            | ✅                |
| License                   | MIT                 | MIT           | MIT           | GPL / Commercial  |

> ✦ Real app contribution (tree-shaken). Sizes are approximate and may vary by version.

---

## 🏷️ Branding Badge

By default, a small **"Built with NFSFU234TourGuide"** badge appears at the bottom of the welcome screen. It's subtle, low-opacity, and links to the docs — never shown on individual step tooltips.

To opt out, pass `showBranding={false}`:

```tsx
<Tour
  steps={steps}
  showBranding={false}
/>
```

If you do leave it on, thank you — it genuinely helps the project grow. 🙏


---

## 📚 Docs & Extras

- Full Docs: [tour-guide.nforshifu234dev.com](https://tour-guide.nforshifu234dev.com)
- API Reference: [tour-guide.nforshifu234dev.com/api-reference](https://tour-guide.nforshifu234dev.com/api-reference)
- Examples: [tour-guide.nforshifu234dev.com/examples](https://tour-guide.nforshifu234dev.com/examples)
- NPM: [npmjs.com/package/nfsfu234-tour-guide](https://www.npmjs.com/package/nfsfu234-tour-guide)

---

## 🤝 Contributing

PRs, issues, and improvements are welcome!  
Start with [CONTRIBUTING.md](./CONTRIBUTING.md) or open an issue.

---

## 📄 License

MIT License — free for personal & commercial use.  
Copyright © NFORSHIFU234 Dev

---

## 🎯 Final Word

**NFSFU234TourGuide** is your no-fluff, high-impact tool for guiding users fast — without bloat or forced dependencies.

> "Lead your users. Don't just onboard — guide like a boss." 💼  
> — Built by [NFORSHIFU234 Dev](https://github.com/nforshifu234dev) 🇳🇬