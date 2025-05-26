# NFSFU234TourGuide

![npm](https://img.shields.io/npm/v/nfsfu234-tour-guide?style=for-the-badge)  
![License](https://img.shields.io/npm/l/nfsfu234-tour-guide?style=for-the-badge)  
![jsDelivr](https://data.jsdelivr.com/v1/package/npm/nfsfu234-tour-guide/badge)

**NFSFU234TourGuide** is a powerful, plug-and-play React library for crafting seamless, interactive, and fully customizable onboarding experiences. Skip the hassle of building tooltips, modals, or welcome screens from scratch — this library delivers a polished, responsive tour with minimal setup, so you can focus on creating stellar UIs.

---

## 🚀 Why Use It?

- Onboarding in minutes with intuitive setup  
- Modular steps with device-specific content and positioning  
- Tailwind-powered styling for effortless customization  
- Light and dark mode support out of the box  
- Responsive design with mobile and desktop optimizations  
- Advanced positioning with custom offsets and transforms  
- Smart UX with smooth animations, progress indicators, and bulletproof z-index handling  
- Keyboard navigation for accessibility  

---

## 📦 Prerequisites

Ensure your project includes the following **peer dependencies**:

```bash
npm install react@^18.3.1 react-dom@^18.3.1 tailwindcss@^4 framer-motion@^12.12.1 lucide-react@^0.511.0
```

Or with Yarn:

```bash
yarn add react@^18.3.1 react-dom@^18.3.1 tailwindcss@^4 framer-motion@^12.12.1 lucide-react@^0.511.0
```

> **Note:** These are peer dependencies and must be installed separately.  
> For Tailwind CSS, follow the [official setup guide](https://tailwindcss.com/docs/installation) to configure it properly.

---

## 🔧 Installation

```bash
npm install nfsfu234-tour-guide
```

Or with Yarn:

```bash
yarn add nfsfu234-tour-guide
```

---

## 🧪 Basic Usage

Create a guided tour with a welcome screen and interactive steps, complete with callbacks for tracking user actions.

```jsx
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
      {/* Your app UI here */}
      <div id="step1">Dashboard</div>
      <div id="step2">Feature</div>
      <button id="submit-btn">Submit</button>
    </div>
  );
}
```

> ⚠️ **Heads up**: Ensure target elements (e.g., `#step1`, `.class`) exist in the DOM before the tour starts.  
> Use the `tourId` prop to uniquely identify each tour instance.

---

## 🔍 Props

| Prop            | Type                                                                  | Default       | Description                                                                 |
|-----------------|-----------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------|
| `tourId`        | `string`                                                              | **Required**  | Unique identifier for the tour instance                                     |
| `steps`         | `TourStep[]`                                                          | `[]`          | Array of step objects defining targets, content, and positioning            |
| `theme`         | `'light'` \| `'dark'`                                                 | **Required**  | Theme for styling                                                           |
| `deviceMode`    | `'desktop'` \| `'tablet'` \| `'mobile'`                               | Auto-detected | Force device mode                                                           |
| `isActive`      | `boolean`                                                             | `true`        | Controls tour visibility                                                    |
| `onComplete`    | `() => void`                                                          | `null`        | Callback when tour is completed                                             |
| `onSkip`        | `() => void`                                                          | `null`        | Callback when tour is skipped                                               |
| `onStart`       | `() => void`                                                          | `null`        | Callback when tour starts                                                   |
| `onStepChange`  | `(stepIndex: number) => void`                                         | `null`        | Callback when step changes                                                  |
| `welcomeScreen` | `{ enabled: boolean, content?: ReactNode | PredefinedWelcomeConfig }` | `{}`          | Configures welcome screen                                                   |
| `buttonLabels`  | `{ next?, previous?, skip?, finish?, start?: string }`                | `{}`          | Custom labels for navigation buttons                                       |
| `showProgressDots` | `boolean`                                                          | `false`       | Show progress dots below the progress bar                                  |

---

## 🧩 TourStep Interface

| Property       | Type                                                                 | Description                                         |
|----------------|----------------------------------------------------------------------|-----------------------------------------------------|
| `target`       | `string`                                                             | CSS selector (e.g., `#id`, `.class`)                |
| `content`      | `string`                                                             | Default content                                     |
| `contentDesktop` | `string`                                                           | Optional desktop-specific content                   |
| `contentMobile` | `string`                                                            | Optional mobile-specific content                    |
| `position`     | `'top'` \| `'bottom'` \| `'left'` \| `'right'` ...                   | Tooltip position relative to target (default: `bottom`) |
| `customPosition` | `{ top?: number | string, left?: number | string, transform?: string }` | Custom positioning                                |
| `offset`       | `{ x?: number, y?: number }`                                         | Fine-tune tooltip position                          |
| `device`       | `'desktop'` \| `'mobile'` \| `'both'`                                | Restrict step to a device (default: `both`)         |

---

## 📋 PredefinedWelcomeConfig Interface

| Property           | Type                                       | Description                        |
|--------------------|--------------------------------------------|------------------------------------|
| `title`            | `string`                                   | Welcome screen title               |
| `message`          | `string`                                   | Welcome screen message             |
| `startButtonText`  | `string`                                   | Custom text for the start button   |
| `position`         | `{ top?, left?, transform? }`              | Desktop positioning                |
| `mobilePosition`   | `{ top?, left?, transform? }`              | Mobile positioning                 |

---

## ✨ Features

- **Responsive Design:** Mobile & desktop friendly with device-specific content
- **Custom Positioning:** Use `position`, `offset`, and `customPosition` for precision
- **Welcome Screen:** Optional, customizable welcome screen
- **Progress Indicators:** Progress bar and optional dots
- **Animations:** Smooth transitions using Framer Motion
- **Z-Index Handling:** Bulletproof z-index using React Portals
- **Keyboard Navigation:** Arrow keys, Enter, and Escape support
- **Theme Support:** Light and dark modes with Tailwind CSS

---

## 💡 Dev Tips

- **Targeting Elements:** Use stable, unique selectors that are present at render time
- **Dynamic Control:** Use `isActive` to start/stop the tour programmatically
- **Analytics:** Hook into lifecycle with `onStart`, `onStepChange`, `onSkip`, and `onComplete`
- **Custom Styling:** Override styles using Tailwind or `.tour-*` classes (e.g., `.tour-highlight-my-tour`)
- **Testing Layouts:** Set `deviceMode` to test responsiveness without resizing your screen

---

## 📚 Docs & Examples

- **Documentation Site:** Coming soon  
- **Examples Repo:** Coming soon  
- **NPM Package:** [nfsfu234-tour-guide](https://www.npmjs.com/package/nfsfu234-tour-guide)

---

## 🤝 Contributing

Want to make NFSFU234TourGuide even better?  
Check out our `CONTRIBUTING.md` for guidelines.  
Look for issues tagged `good first issue` to dive in!

---

## 📄 License

MIT — free to use, modify, and contribute.  
See the LICENSE file for details.

---

## 🎯 Final Word

NFSFU234TourGuide empowers developers to deliver slick, user-friendly onboarding experiences with minimal effort. From responsive tooltips to customizable welcome screens, it’s built to save you time and elevate your app’s UX.  
**Plug it in, guide your users, and get back to building your masterpiece.**
