
<h1 align="center">🎯 NFSFU234TourGuide</h1>

<p align="center"><i>
Plug-and-play React tour guide library — perfect for onboarding, walkthroughs, and product tours. Built for devs who ship fast and style clean.
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

✅ Interactive onboarding, modals & walkthroughs  
🎨 Built with TailwindCSS for slick UI styling  
🌓 Dark mode & mobile-first support  
📦 Works with React 18+, Framer Motion, Lucide  
⚡ Minimal config, full control — no bloat  
💻 Clean API + callback hooks for tracking

---

## 📦 Prerequisites

Install required **peer dependencies**:

```bash
npm install react@^18.3.1 react-dom@^18.3.1 tailwindcss@^4 framer-motion@^12.12.1 lucide-react@^0.511.0
```

Or with Yarn:

```bash
yarn add react@^18.3.1 react-dom@^18.3.1 tailwindcss@^4 framer-motion@^12.12.1 lucide-react@^0.511.0
```

> 📌 **Heads up**: Tailwind needs to be configured properly. Follow the [Tailwind Docs](https://tailwindcss.com/docs/installation) if you haven’t set it up yet.

---

## 🔧 Installation

```bash
npm install nfsfu234-tour-guide
# or
yarn add nfsfu234-tour-guide
```

---

## 🧪 Quick Example

```tsx
'use client';
import Tour from 'nfsfu234-tour-guide';

const steps = [
  {
    target: '#step1',
    content: 'Welcome to your dashboard!',
    contentMobile: 'Explore your mobile dashboard.',
    position: 'bottom',
    device: 'both',
  },
  {
    target: '#step2',
    content: 'Check out this feature.',
    position: 'right',
    offset: { x: 10, y: 5 },
  },
  {
    target: '#submit-btn',
    content: 'Click to finish!',
    position: 'top',
  },
];

export default function MyApp() {
  return (
    <div>
      <Tour
        tourId="my-tour"
        steps={steps}
        theme="dark"
        isActive={true}
        welcomeScreen={{
          enabled: true,
          content: {
            title: 'Welcome to the App!',
            message: 'Let us guide you through the key features.',
            startButtonText: 'Get Started',
            position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
            mobilePosition: { top: '60%', left: '50%', transform: 'translate(-50%, -60%)' },
          },
        }}
        buttonLabels={{
          next: 'Next Step',
          previous: 'Back',
          skip: 'Skip Tour',
          finish: 'Done',
          start: 'Begin',
        }}
        showProgressDots={true}
        onStart={() => console.log('Tour started!')}
        onStepChange={(step) => console.log(`Step ${step + 1} active`)}
        onSkip={() => console.log('Tour skipped')}
        onComplete={() => console.log('Tour completed!')}
      />
      <div id="step1">Dashboard</div>
      <div id="step2">Feature</div>
      <button id="submit-btn">Submit</button>
    </div>
  );
}
```

> ⚠️ **Note**: Make sure your `target` elements exist in the DOM before triggering the tour.

---

## 🧠 Props Reference

| Prop            | Type    | Description |
|-----------------|---------|-------------|
| `tourId`        | `string` | Unique identifier |
| `steps`         | `TourStep[]` | List of step objects |
| `theme`         | `'light'` \| `'dark'` | Sets theme |
| `isActive`      | `boolean` | Show/hide tour |
| `welcomeScreen` | `WelcomeScreenConfig` | Optional intro screen |
| `buttonLabels`  | `object` | Customize nav buttons |
| `onStart`       | `() => void` | Callback |
| `onStepChange`  | `(stepIndex: number) => void` | Callback |
| `onSkip`        | `() => void` | Callback |
| `onComplete`    | `() => void` | Callback |
| `showProgressDots` | `boolean` | Progress UI |

---

## 🧩 TourStep Interface

| Property       | Type           | Description |
|----------------|----------------|-------------|
| `target`       | `string`       | CSS selector |
| `content`      | `string`       | Tooltip message |
| `position`     | `string`       | top, bottom, left, right |
| `offset`       | `{ x, y }`     | Fine-tune placement |
| `device`       | `'mobile'` \| `'desktop'` \| `'both'` | Show per device |

---

## ✨ Features Recap

- 🧠 Intelligent positioning + offset controls  
- 🖥️ Desktop/mobile specific content  
- 🧑‍🎨 Custom themes via Tailwind  
- 🧭 Welcome screen with title/message  
- 🔢 Step dots + progress bar  
- 🔌 Lifecycle hooks for analytics  
- 🕹️ Keyboard navigation (← → Enter Esc)

---

## 📚 Docs & Extras

- 📘 Full Docs: _Coming Soon_  
- 🧪 Live Demos: _Coming Soon_  
- 📦 NPM: [npmjs.com/package/nfsfu234-tour-guide](https://www.npmjs.com/package/nfsfu234-tour-guide)

---

## 🤝 Contributing

PRs, issues, and improvements are welcome!  
Start with [CONTRIBUTING.md](./CONTRIBUTING.md) — or hit up the issues tab.

---

## 📄 License

MIT License — free for personal & commercial use.  
Copyright © [NFORSHIFU234 Dev](https://github.com/NFORSHIFU234Dev)

---

## 🎯 Final Word

**NFSFU234TourGuide** is your no-fluff, high-impact tool for building beautiful, interactive walkthroughs fast.  
Stay focused on what matters: building great experiences.

> "Lead your users. Don’t just onboard — guide like a boss." 💼  
> — Built by [NFORSHIFU234 Dev](https://github.com/NFORSHIFU234Dev)

