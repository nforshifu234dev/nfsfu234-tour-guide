# 🚀 Migration Guide: v0.x → v1.0 (and the new @nfsfu234/tour-guide package)

This guide helps you upgrade from `nfsfu234-tour-guide` v0.2.x to v1.0, **and** move to the new scoped package name `@nfsfu234/tour-guide`.

---

## 📦 Package rename

As of the NFSFU234 Open Source Day launch, this library is now published under the `@nfsfu234` npm scope:

```diff
- npm install nfsfu234-tour-guide
+ npm install @nfsfu234/tour-guide
```

```diff
- import { Tour } from 'nfsfu234-tour-guide'
+ import { Tour } from '@nfsfu234/tour-guide'
```

The unscoped `nfsfu234-tour-guide` package will continue to receive critical fixes for a deprecation window, but all new features and releases (starting with this v1.0 line) ship under `@nfsfu234/tour-guide`.

---

## 🎯 TL;DR

**v1.0 is a complete rewrite** with these major changes:

- ✅ Zero dependencies (removed framer-motion, lucide-react)
- ✅ New custom theme system
- ✅ Improved tooltip positioning with Intersection Observer
- ✅ Smaller, minified build output
- ⚠️ Breaking API changes (removed some props, renamed others)

**Upgrade time:** ~15 minutes for most projects

---

## 📦 Installation

```bash
npm install @nfsfu234/tour-guide@latest
# or
yarn add @nfsfu234/tour-guide@latest
# or
pnpm add @nfsfu234/tour-guide@latest
```

---

## 🔄 Breaking Changes

### 1. Removed Props

| v0.x Prop | Status | v1.0 Alternative |
|-----------|--------|------------------|
| `tourDots` | ❌ Removed | Use `showProgress={true}` (default) |
| `tourDotsClassName` | ❌ Removed | Not needed |
| `animation` | ❌ Removed | Built-in smooth transitions |
| `animationDuration` | ❌ Removed | Fixed to 300ms |

**Before (v0.x):**

```tsx
<Tour
  tourDots={true}
  tourDotsClassName="custom-dots"
  animation="fade"
  animationDuration={500}
/>
```

**After (v1.0):**

```tsx
<Tour
  showProgress={true}
  // animation is built-in, no config needed
/>
```

---

### 2. Theme System Changes

**v0.x:** Inline style overrides
**v1.0:** Proper theme system with presets

**Before (v0.x):**

```tsx
<Tour
  theme="dark"
  overlayClassName="bg-black/80"
  tooltipClassName="bg-zinc-900 text-white"
  // Limited customization
/>
```

**After (v1.0):**

```tsx
<Tour
  theme="dark"
  // OR use custom theme
  theme="custom"
  customTheme={{
    backdrop: 'rgba(0, 0, 0, 0.8)',
    tooltipBg: '#18181b',
    tooltipText: '#ffffff',
    tooltipBorder: '#3f3f46',
    buttonBg: '#27272a',
    buttonText: '#ffffff',
    progressBar: '#3f3f46',
    highlightRing: 'rgba(16, 185, 129, 0.5)',
  }}
  accentColor="#10b981"
/>
```

---

### 3. Step Interface Changes

**v0.x:**

```tsx
interface TourStep {
  target: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  // ...
}
```

**v1.0:**

```tsx
interface TourStep {
  target: string;
  content: string;
  contentMobile?: string;          // NEW: mobile-specific content
  position?: 'top' | 'bottom' | 'left' | 'right'; // removed 'center'
  offset?: { x?: number; y?: number };
  device?: 'desktop' | 'mobile' | 'both'; // NEW: device filtering
}
```

**Migration:**

- Remove `position: 'center'` — not supported (use `'bottom'` instead)
- Add `device: 'both'` if you want steps on all devices (default behavior)
- Add `contentMobile` if you want different text on mobile

---

### 4. Dependencies Removed

**v0.x had:**

- `framer-motion` (animations)
- `lucide-react` (icons)

**v1.0:** Zero external dependencies!

**Action Required:** If you imported icons from `lucide-react` elsewhere:

```bash
# Install lucide-react separately if you use it
npm install lucide-react
```

---

## ✅ Step-by-Step Migration

### Step 1: Update Package

```bash
npm uninstall nfsfu234-tour-guide
npm install @nfsfu234/tour-guide@latest
```

### Step 2: Update Imports

```diff
- import Tour from 'nfsfu234-tour-guide';
+ import { Tour } from '@nfsfu234/tour-guide';
```

### Step 3: Update Props

**Basic Usage (Minimal Changes):**

```diff
<Tour
  steps={steps}
  theme="dark"
- tourDots={true}
+ showProgress={true}
  accentColor="#10b981"
/>
```

**Custom Styling:**

```diff
<Tour
  steps={steps}
- theme="dark"
- overlayClassName="custom-overlay"
- tooltipClassName="custom-tooltip"
+ theme="custom"
+ customTheme={{
+   backdrop: 'rgba(0, 0, 0, 0.9)',
+   tooltipBg: '#1e293b',
+   tooltipText: '#f1f5f9',
+   // ... full control
+ }}
  accentColor="#6366f1"
/>
```

### Step 4: Update Steps Array

```diff
const steps = [
  {
    target: '#hero',
    content: 'Welcome to our app!',
+   contentMobile: 'Welcome!', // Optional: shorter text on mobile
    position: 'bottom',
+   device: 'both', // Optional: 'desktop' | 'mobile' | 'both'
  },
  {
    target: '#features',
-   position: 'center', // ❌ Not supported
+   position: 'bottom', // ✅ Use this instead
  },
];
```

### Step 5: Test on Mobile

v1.0 has better mobile support. Test:

- Tooltip positioning on small screens
- Device filtering (`device: 'mobile'`)
- Mobile-specific content (`contentMobile`)

---

## 🐛 Common Issues

### Issue 1: "tourDots is not a valid prop"

**Solution:** Change to `showProgress`

```diff
- <Tour tourDots={true} />
+ <Tour showProgress={true} />
```

### Issue 2: "position: center is deprecated"

**Solution:** Use `bottom` or `top`

```diff
- { target: '#hero', position: 'center' }
+ { target: '#hero', position: 'bottom' }
```

### Issue 3: Module not found after upgrading

**Cause:** The package moved to the `@nfsfu234` scope.
**Solution:**

```bash
npm uninstall nfsfu234-tour-guide
npm install @nfsfu234/tour-guide
```

Then update every import from `'nfsfu234-tour-guide'` to `'@nfsfu234/tour-guide'`.

### Issue 4: Custom styles not applying

**Solution:** Use `customTheme` instead of className overrides

```tsx
<Tour
  theme="custom"
  customTheme={{
    tooltipBg: '#yourColor',
    // ...
  }}
/>
```

---

## 📊 Feature Comparison

| Feature | v0.x | v1.0 |
|---------|------|------|
| **Package name** | `nfsfu234-tour-guide` | `@nfsfu234/tour-guide` ✨ |
| **Bundle Size** | ~45KB | ~3-4 kB gzipped ✨ |
| **Dependencies** | 2 (framer-motion, lucide-react) | 0 ✨ |
| **Themes** | Light, Dark | Light, Dark, Custom ✨ |
| **Mobile Support** | Basic | Enhanced ✨ |
| **Tooltip Positioning** | Fixed calculations | Intersection Observer ✨ |
| **Scroll Lock** | Partial | Full (welcome screen) ✨ |
| **Device Filtering** | ❌ | ✅ ✨ |
| **Mobile Content** | ❌ | ✅ ✨ |
| **TypeScript** | Partial | Full ✨ |

---

## 🎯 Migration Checklist

- [ ] Uninstall `nfsfu234-tour-guide`, install `@nfsfu234/tour-guide@^1.0.0`
- [ ] Update every import path to `@nfsfu234/tour-guide`
- [ ] Replace `tourDots` with `showProgress`
- [ ] Remove `tourDotsClassName`
- [ ] Remove `animation` and `animationDuration`
- [ ] Update custom styling to use `customTheme`
- [ ] Change `position: 'center'` to `'bottom'` or `'top'`
- [ ] Add `device` filtering if needed
- [ ] Add `contentMobile` for mobile-specific text
- [ ] Test on desktop and mobile
- [ ] Remove `framer-motion` and `lucide-react` if not used elsewhere
- [ ] Update any custom CSS targeting tour classes

---

## 🆘 Need Help?

- 📖 [Full Documentation](https://github.com/nforshifu234dev/nfsfu234-tour-guide#readme)
- 💬 [GitHub Discussions](https://github.com/nforshifu234dev/nfsfu234-tour-guide/discussions)
- 🐛 [Report Issues](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues)

---

**Happy migrating! 🎉**