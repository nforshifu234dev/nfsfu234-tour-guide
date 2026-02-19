# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.7](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v1.0.6...v1.0.7) (2026-02-19)


### Bug Fixes

* eliminate welcome+backdrop overlap by consolidating welcome phase into single full-screen div ([#94](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/94)) ([8a0e83b](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/8a0e83bed8f708af558b1e74fa7536fde7a5f24a))

### [1.0.6](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v1.0.5...v1.0.6) (2026-02-19)


### Bug Fixes

* **tour:** ensure complete cleanup of backdrop & body scroll lock on tour end ([#93](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/93)) ([23b19eb](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/23b19ebeafe07b1e149ca1e983fa591a732f9d8a))

### [1.0.5](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v1.0.4...v1.0.5) (2026-02-19)


### Bug Fixes

* prevent stale welcome screen DOM nodes & add safe cleanup ([c8dbb88](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/c8dbb883698b8ccc448d38a211b4ee0daadc342d))
* **tour:** fix "node not a child of this node" error during welcome → active transition ([#92](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/92)) ([f1c4d34](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/f1c4d34a8397f336d96b55a177a2f2eddcfafdcb))

### [1.0.4](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v1.0.3...v1.0.4) (2026-02-19)


### Bug Fixes

* welcome screen still visible after tour starts ([#91](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/91)) ([623bb9b](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/623bb9bc2de7b9e7e23f2b2d47d52b2bb2d0d4a1))

### [1.0.3](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v1.0.2...v1.0.3) (2026-02-19)


### Bug Fixes

* memoize welcomeConfig and filteredSteps to stabilize isActive phase reset ([#90](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/90)) ([cc5901e](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/cc5901e36ac76e684813366521d33da41785fa47))

### [1.0.2](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v1.0.1...v1.0.2) (2026-02-19)


### Bug Fixes

* reset phase state when isActive toggles to prevent welcome+tooltip double render ([#89](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/89)) ([483209f](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/483209fc5e41c31a6d4e182333d68372c924f2d1))

### [1.0.1](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v1.0.0...v1.0.1) (2026-02-17)


### Bug Fixes

* update module paths in package.json for CommonJS and ES module compatibility ([#88](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/88)) ([7fa1964](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/7fa1964ad2e87a485c717a2c9c0b6f2d9b9b52ea))

## [1.0.0](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.3.1...v1.0.0) (2026-02-17)


### ⚠ BREAKING CHANGES

* update module exports and types in package.json; add comment in index.tsx (#87)

### Bug Fixes

* update module exports and types in package.json; add comment in index.tsx ([#87](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/87)) ([c1a0d1d](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/c1a0d1d481d449f4b250fc809c9fa02055946965))

### [0.3.1](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.3.0...v0.3.1) (2026-02-17)

## [0.3.0](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.21...v0.3.0) (2026-02-17)


### ⚠ BREAKING CHANGES

* removed framer-motion and lucide-react dependencies, changed theme system, removed tourDots prop

### Features

* Add TypeScript definitions for nfsfu234-tour-guide module ([#83](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/83)) ([ace5968](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/ace5968994ede1ee62ab183f4e553f6c257a0856))
* complete rewrite with zero dependencies ([cf97b20](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/cf97b201acadd820e61af7af741658160b3e5e99))

## [1.0.0](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.21...v1.0.0) (2026-02-17)

### ⚠ BREAKING CHANGES

* Complete rewrite of the Tour component architecture
* Removed dependency on framer-motion and lucide-react
* Changed tooltip rendering to use React portals and Intersection Observer
* Simplified API - removed unused props and consolidated theme system
* `tourDots` prop removed - use `showProgress` instead
* Theme customization now uses `customTheme` prop instead of inline style overrides

### Features

* **Zero Dependencies**: Removed all external dependencies except React and ReactDOM ([#83](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/83))
* **Custom Theme System**: Added `customTheme` prop with `ThemeConfig` interface for complete color customization ([#84](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/84))
* **Smart Tooltip Positioning**: Tooltips now follow target elements using Intersection Observer and scroll listeners ([#85](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/85))
* **Body Scroll Lock**: Welcome screen now properly locks body scroll to prevent backdrop movement ([#86](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/86))
* **Device Filtering**: Steps are automatically filtered based on `device` prop (desktop/mobile/both) ([#87](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/87))
* **Mobile-Specific Content**: Added `contentMobile` prop to show different text on mobile devices ([#88](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/88))
* **Improved TypeScript Support**: Complete rewrite of type definitions with better inference ([#89](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/89))
* **Built-in Theme Presets**: Added light and dark theme presets with beautiful defaults ([#90](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/90))

### Bug Fixes

* **Tooltip Positioning**: Fixed tooltips appearing off-screen or in wrong position ([#91](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/91))
* **Scroll Behavior**: Target elements now properly scroll into view and stay visible ([#92](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/92))
* **Welcome Screen**: Fixed backdrop scrolling issue on mobile devices ([#93](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/93))
* **TypeScript Errors**: Resolved declaration file issues with tsup/rollup ([#94](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/94))
* **Z-Index Conflicts**: Improved z-index management for overlay and tooltips ([#95](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/95))

### Performance Improvements

* **Bundle Size**: Reduced bundle size from ~45KB to ~10KB (gzipped) by removing dependencies
* **Render Optimization**: Tooltips only re-render when position changes
* **Memory Management**: Proper cleanup of event listeners and observers

### Documentation

* **Complete README Rewrite**: Added comprehensive API reference with examples ([#96](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/96))
* **Real-World Examples**: Added SaaS onboarding, mobile-aware, and i18n examples
* **Theme Customization Guide**: Detailed guide on creating custom themes
* **Migration Guide**: Added migration guide from v0.x to v1.0 (see MIGRATION.md)
* **Contributing Guide**: Updated CONTRIBUTING.md with current practices

### Refactorings

* **Component Architecture**: Split Tour into main component and Tooltip subcomponent
* **State Management**: Simplified phase management (welcome → active → done)
* **Positioning Logic**: Rewrote tooltip positioning with proper viewport handling
* **Type System**: Reorganized interfaces for better maintainability

---

### [0.2.21](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.20...v0.2.21) (2026-02-17)

### Bug Fixes

* Refactor Tour component and tooltip handling ([#82](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/82)) ([31cda9b](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/31cda9bcbe73a1a3fc36236ccab03e0c8ed4e714))

### [0.2.20](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.19...v0.2.20) (2026-02-17)

### Features

* Enhance tooltip styling and positioning logic ([#81](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/81)) ([feac0bf](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/feac0bf376d59d982d67114144efc217d8d8906b))

### [0.2.19](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.18...v0.2.19) (2026-02-17)

### Features

* Add tooltipStyle state for tooltip positioning ([#80](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/80)) ([774fb1a](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/774fb1a78651a8e173b1504b0305d98453d2105d))

### Bug Fixes

* Refactor tooltip handling and cleanup comments ([#79](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/79)) ([21ad03e](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/21ad03e8019d5abc712ef95674e9d41aabe36d2a))

### [0.2.18](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.17...v0.2.18) (2026-02-17)

### Bug Fixes

* Refactor tooltip handling and step navigation ([#78](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/78)) ([1520782](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/1520782b9e428438198f78f4b7d1e2430781c5c9))
* Refactor Tour component to manage phases and tooltip ([#77](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/77)) ([3721cd6](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/3721cd6c2c7a28dc19302bd70bd23a7167eae9e3))

### [0.2.17](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.16...v0.2.17) (2026-02-17)

### Bug Fixes

* Refactor Tour component and enhance tooltip logic ([#76](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/76)) ([52453e9](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/52453e963a2115e9c2ed3d043f807603fda0a12a))

### [0.2.16](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.15...v0.2.16) (2026-02-17)

### Features

* Enhance Tour component with tooltip positioning and improved navigation ([#75](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/75)) ([ca7afd5](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/ca7afd5d5a781d4895ee7c7163a7318e9714d77a))

### [0.2.15](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.14...v0.2.15) (2026-02-17)

### Features

* Update README and enhance Tour component with new features and styling options ([#72](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/72)) ([bee54f2](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/bee54f21973bd699ce34a8b2494adae7e23e0d76))

### Bug Fixes

* Add missing type definitions for Node and React in devDependencies ([#73](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/73)) ([76d8f8b](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/76d8f8bdd04e787e3c5d544d7fb2d8d66d50b37b))
* Add standard-version for version management ([#74](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/74)) ([8260397](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/8260397ff31431b774fbd6a4a1426f914214a504))

### [0.2.14](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.13...v0.2.14) (2026-02-17)

### Bug Fixes

* Refactor package.json for author and dependencies ([#67](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/67)) ([7b10a79](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/7b10a7946469f754a1424dcff6460347a92bf096))
* Refactor Tour component interfaces and logic ([#66](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/66)) ([3d8934f](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/3d8934f2f33e6b1dcf9f0456faec6b961bc8840e))
* Update Dependabot assignees and reviewers to match current user ([#68](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/68)) ([fbe947a](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/fbe947afef19585d787206c4a5b3a0ef87a80385))

### [0.2.13](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.12...v0.2.13) (2026-02-16)

### [0.2.12](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.11...v0.2.12) (2025-06-01)

### Bug Fixes

* testing new code 2 ([#26](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/26)) ([ba9d7a7](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/ba9d7a737ecbe50a9d4fdb5c915ed24a6e487f56))

### [0.2.11](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.10...v0.2.11) (2025-06-01)

### Bug Fixes

* testing new code ([#25](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/25)) ([18b04ba](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/18b04ba0d6f0790ebca4aa25f2c652ba2be922a0))
* testing new code 1 ([#24](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/24)) ([0a20af4](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/0a20af4e2837a8428f05946d21e272dedad7af46))

### [0.2.10](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.9...v0.2.10) (2025-06-01)

### Bug Fixes

* testing new code ([#23](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/23)) ([5e73502](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/5e73502daf0a4ea222ba667f01e3532491bc14a9))

### [0.2.9](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.8...v0.2.9) (2025-06-01)

### Bug Fixes

* test removing zindex 1 ([#22](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/22)) ([6414277](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/641427767b3ef677402b0abf21e0d9f3b6972d56))

### [0.2.8](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.7...v0.2.8) (2025-06-01)

### Bug Fixes

* test removing zindex ([#21](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/21)) ([268bde2](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/268bde2d0af68f272f969d58dac3e1732380d301))

### [0.2.7](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.6...v0.2.7) (2025-06-01)

### Bug Fixes

* update ([#20](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/20)) ([d6b5226](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/d6b5226823656b70a0083ea95c19118d5b95640f))

### [0.2.6](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.5...v0.2.6) (2025-05-26)

### Bug Fixes

* firsttimeerror ([#17](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/17)) ([ef7b97b](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/ef7b97b41520b43af6bbdc54d7da1e2ca66b70ce))

### [0.2.5](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.4...v0.2.5) (2025-05-17)

### Bug Fixes

* trying to fix the automation hauld for deploying after release is successful ([#12](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/12)) ([805ef3d](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/805ef3d31cb2931fb1574b329a53800a7e9b707a))

### [0.2.4](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.0...v0.2.4) (2025-05-17)

### Features

* adding new files to the project ([a3a16a6](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/a3a16a6644e87e51a9c71101b203ce90b79344c9))

### Bug Fixes

* add comments to tour component ([7366689](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/7366689cda5c557b94731117b066782a8a5a7de8))
* automated release workflow ([#4](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/4)) ([cfca6b5](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/cfca6b53ea14132d34ea59eea06c200eeaddb627))
* commented on the tour component ([#3](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/3)) ([f12b92b](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/f12b92b1bf9443ff757783684ac5c8fb1800d7a2))
* finxing the login issue ([#9](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/9)) ([1c325d3](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/1c325d3c45a4ad154f5a3f42501c62530d6be401))
* fix automated release workflow ([#5](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/5)) ([7d54d1d](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/7d54d1d4de40f5ff56dfe3bcca62861c35d9fabb))
* fixing the release issue ([#7](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/7)) ([18bf30d](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/18bf30df6f8dcf005c17ff48eb8a7e58fae34ccd))
* role stuff ([#6](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/6)) ([e17c06d](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/e17c06dc78ac7139b004133e7ef89d45f446f4c1))
* trying to fix the release issue ([#11](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/11)) ([700dbfa](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/700dbfa58fe56b85b8290b2a428206b53789dcea))

### [0.2.3](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.0...v0.2.3) (2025-05-17)

### Features

* adding new files to the project ([a3a16a6](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/a3a16a6644e87e51a9c71101b203ce90b79344c9))

### Bug Fixes

* add comments to tour component ([7366689](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/7366689cda5c557b94731117b066782a8a5a7de8))
* automated release workflow ([#4](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/4)) ([cfca6b5](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/cfca6b53ea14132d34ea59eea06c200eeaddb627))
* commented on the tour component ([#3](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/3)) ([f12b92b](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/f12b92b1bf9443ff757783684ac5c8fb1800d7a2))
* finxing the login issue ([#9](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/9)) ([1c325d3](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/1c325d3c45a4ad154f5a3f42501c62530d6be401))
* fix automated release workflow ([#5](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/5)) ([7d54d1d](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/7d54d1d4de40f5ff56dfe3bcca62861c35d9fabb))
* fixing the release issue ([#7](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/7)) ([18bf30d](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/18bf30df6f8dcf005c17ff48eb8a7e58fae34ccd))
* role stuff ([#6](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues/6)) ([e17c06d](https://github.com/nforshifu234dev/nfsfu234-tour-guide/commit/e17c06dc78ac7139b004133e7ef89d45f446f4c1))

### [0.2.2](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.1...v0.2.2) (2025-05-17)

### [0.2.1](https://github.com/nforshifu234dev/nfsfu234-tour-guide/compare/v0.2.0...v0.2.1) (2025-05-17)

## [0.1.0] - 2025-05-17

### Added

- Initial release of `nfsfu234-tour-guide`.
- Support for customizable tour steps with target selectors, content, and positions.
- Light and dark themes.
- Welcome screen with customizable content.
- Progress bar and optional progress dots.
- Device-specific steps (`desktop`, `mobile`, `both`).
- TypeScript support with full type definitions.
- Keyboard navigation (Arrow keys, Enter, Escape).
- Integration with `framer-motion` for animations and `lucide-react` for icons.

### Fixed

- N/A (initial release).

### Changed

- N/A (initial release).

### Removed

- N/A (initial release).