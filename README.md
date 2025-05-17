# 🧭 NFSFU234TourGuide

[![npm](https://img.shields.io/npm/v/nfsfu234-tour-guide?style=for-the-badge)](https://www.npmjs.com/package/nfsfu234-tour-guide)  
[![License](https://img.shields.io/npm/l/nfsfu234-tour-guide?style=for-the-badge)](https://github.com/NFSFU234TourGuide/nfsfu234-tour-guide/blob/main/LICENSE)  
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/nfsfu234-tour-guide/badge)](https://www.jsdelivr.com/package/npm/nfsfu234-tour-guide)

**NFSFU234TourGuide** is your plug-and-play React library for building clean, interactive, and customizable onboarding experiences. Skip the hassle of building tooltips or modals from scratch — this library does the heavy lifting, so you can focus on building dope UIs.

---

## 🚀 Why Use It?

- 🎯 **Zero to onboarding in minutes**  
- 🧱 Modular & composable tour steps  
- 🌈 Built with Tailwind for easy styling  
- 🌓 Dark mode support baked in  
- 🔧 Fully customizable — control what shows, when, and how  
- 🧠 Smart positioning & user experience design built in

## 📋 Prerequisites

Before installing `nfsfu234-tour-guide`, make sure your project has the following peer dependencies installed:

```bash
npm install react@^19.0.0 react-dom@^19.0.0 tailwindcss@^4 framer-motion@^12.12.1 lucide-react@^0.511.0
```

Or with Yarn:

```bash
yarn add react@^19.0.0 react-dom@^19.0.0 tailwindcss@^4 framer-motion@^12.12.1 lucide-react@^0.511.0
```

> ⚠️ **Note:** These are **peer dependencies** and are required for the library to work properly. They will not be automatically installed with `nfsfu234-tour-guide`.
>
> If you're using Tailwind CSS, ensure it's properly configured in your project. See the [Tailwind CSS docs](https://tailwindcss.com/docs/installation) for setup guidance.

---

## 📦 Installation

```bash
npm install nfsfu234-tour-guide
```

or

```bash
yarn add nfsfu234-tour-guide
```

---

## ⚙️ Basic Usage with Callbacks

```jsx
import Tour from 'nfsfu234-tour-guide';

const steps = [
  { target: '#step1', content: 'This is the first step of your tour.' },
  { target: '#step2', content: 'Here’s another cool feature!' },
  { target: '#submit-btn', content: 'Click here when you’re done.' },
];

export default function MyApp() {
  return (
    <div>
      <TourGuide
        steps={steps}
        start={true}
        theme="light"
        onFinish={() => {
          console.log('Tour finished — trigger follow-up actions or analytics.');
        }}
        onSkip={() => {
          console.log('Tour skipped — clean up or log event here.');
        }}
        onStepChange={(currentStep) => {
          console.log(`Moved to step ${currentStep} — update state or UI accordingly.`);
        }}
      />
      {/* Your app UI below */}
    </div>
  );
}
```

> ☝️ **Heads up**: Wrap `TourGuide` around your app or the relevant UI section. Use IDs or classes that exist in the DOM before the tour starts for reliable targeting.

---

## 🧩 Props

| Prop          | Type     | Default | Description                                             |
|---------------|----------|---------|---------------------------------------------------------|
| steps         | Array    | []      | Array of step objects with target and content           |
| start         | Boolean  | false   | Whether to auto-start the tour on load                  |
| theme         | String   | 'light' | Theme of the tour: `'light'` or `'dark'`                |
| onFinish      | Function | null    | Callback after completing the last step                 |
| onSkip        | Function | null    | Callback when the user skips the tour                   |
| onStepChange  | Function | null    | Callback when the step changes; gets current step index |

---

## 📚 Docs & Examples

- 🔗 Documentation Site: Coming soon  
- 🛠️ Examples Repo: Coming soon  
- 📦 NPM Package: `nfsfu234-tour-guide`

---

## 🧪 Dev Tips

- Target elements by `id` or `className` that exist before the tour starts.
- Use callbacks to hook in analytics, UI updates, or state management.
- You can dynamically control tour visibility with `start`.

---

## 📝 License

MIT — free to use, tweak, and contribute.  
See the LICENSE for details.

---

## 💡 Final Word

**NFSFU234TourGuide** is built for devs who want onboarding done right — clean UX, no clutter, full control.  
Stop wasting time on half-baked solutions. Plug in, guide your users, and get back to building your vision.
