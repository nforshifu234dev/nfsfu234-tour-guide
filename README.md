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
⚡ Extremely lightweight — no forced heavy dependencies  
🖌️ Fully customizable styling (className props + optional Tailwind)  
🌓 Dark/light theme support  
📱 Mobile-aware steps & content  
🔌 Clean API + lifecycle callbacks  
🕹️ Keyboard navigation (arrows, Enter, Esc)  
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

Only **React** and **React DOM** are required.

---

## 🧪 Quick Example

```tsx
'use client';
import Tour from 'nfsfu234-tour-guide';
// Optional: for nice default styling
import 'nfsfu234-tour-guide/tailwind.css';

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
    position: 'top',
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
| `theme`             | `'light' \| 'dark'`                | Visual theme                                     | `'dark'`      |
| `accentColor`       | `string`                           | Color for progress bar, buttons, highlights      | `'#10b981'`   |
| `welcomeScreen`     | `{ enabled: boolean; ... }`        | Optional intro screen                            | `{ enabled: false }` |
| `buttonLabels`      | `object`                           | Customize button text                            | English defaults |
| `showProgress`      | `boolean`                          | Show progress bar                                | `true`        |
| `className`         | `string`                           | Class for root overlay                           | —             |
| `overlayClassName`  | `string`                           | Class for backdrop                               | —             |
| `tooltipClassName`  | `string`                           | Class for tooltip/welcome box                    | —             |
| `highlightClassName`| `string`                           | Class for highlighted elements                   | `'tour-highlight'` |
| `onStart`           | `() => void`                       | Tour started                                     | —             |
| `onStepChange`      | `(index: number) => void`          | Step changed                                     | —             |
| `onSkip`            | `() => void`                       | User skipped                                     | —             |
| `onComplete`        | `() => void`                       | Tour finished                                    | —             |

---

## 🧩 TourStep Interface

| Property       | Type           | Description                                      |
|----------------|----------------|--------------------------------------------------|
| `target`       | `string`       | CSS selector (e.g. `'#hero'`, `'.sidebar'`)      |
| `content`      | `string`       | Main tooltip text                                |
| `contentMobile`| `string?`      | Mobile-specific text (optional)                  |
| `position`     | `'top' \| 'bottom' \| 'left' \| 'right' \| 'center'` | Tooltip placement |
| `offset`       | `{ x?: number; y?: number }` | Pixel offset from target |
| `device`       | `'desktop' \| 'mobile' \| 'both'` | Show on specific devices |

---

## ✨ Features

- Zero heavy dependencies by default (React only)
- Optional beautiful Tailwind styling (`import 'nfsfu234-tour-guide/tailwind.css'`)
- Fully customizable via className props
- Progress bar & dots
- Click-outside-to-skip
- Keyboard support (arrows, Enter, Esc)
- Mobile-aware content & steps

---

## Styling

**Default**: Minimal clean look using plain CSS variables.

**With Tailwind** (recommended for best appearance):

```tsx
import 'nfsfu234-tour-guide/tailwind.css';
```

**Without Tailwind**:

Use the className props to apply your own styles:

```tsx
<Tour
  overlayClassName="bg-gray-900/80 backdrop-blur-xl"
  tooltipClassName="bg-blue-950 text-white rounded-2xl p-6 shadow-2xl border border-blue-800/50"
  highlightClassName="ring-4 ring-purple-500 ring-offset-4 rounded-xl"
/>
```

---

## 📚 Docs & Extras

- Full Docs: [tour-guide.nforshifu234dev.com](https://tour-guide.nforshifu234dev.com)
- Live Demos: _Coming Soon_
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

> "Lead your users. Don’t just onboard — guide like a boss." 💼  
> — Built by [NFORSHIFU234 Dev](https://github.com/nforshifu234dev)
