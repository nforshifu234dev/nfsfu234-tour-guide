# 🤝 Contributing to nfsfu234-tour-guide

Thank you for contributing to **nfsfu234-tour-guide**, a zero-dependency React library for interactive onboarding experiences! Whether you're fixing bugs, adding features, or improving documentation, your help makes onboarding better for everyone 🚀

---

## 🛠️ Getting Started

1. **🍴 Fork the Repository**  
   Click **"Fork"** on [GitHub](https://github.com/nforshifu234dev/nfsfu234-tour-guide)

2. **📥 Clone Your Fork**  

   ```bash
   git clone https://github.com/YOUR_USERNAME/nfsfu234-tour-guide.git
   cd nfsfu234-tour-guide
   ```

3. **📦 Install Dependencies**

   ```bash
   npm install
   ```

4. **🌱 Create a Branch**  
   Use a descriptive name following our convention:

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   # or
   git checkout -b docs/update-readme
   ```

---

## 📐 Development Guidelines

### Code Style

- Follow existing patterns and maintain consistency
- TypeScript is required for all new code
- Use ESLint and Prettier (configured in the project)
- Keep components modular and focused

### Project Structure

```
nfsfu234-tour-guide/
├── src/
│   ├── index.tsx          
│   ├── Tour.tsx           # Main Tour component
│   └── index.d.ts         # TypeScript definitions
├── dist/                  # Built files (auto-generated)
├── README.md              # Documentation
├── CHANGELOG.md           # Version history
└── package.json
```

### 🧪 Testing

Run tests before submitting:

```bash
npm test
```

Build the package locally to verify:

```bash
npm run build
```

Test in a local project:

```bash
npm link
cd ../your-test-project
npm link nfsfu234-tour-guide
```

### ✍️ Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning:

- `feat:` ✨ New features → bumps **minor** version (0.2.x → 0.3.0)
- `fix:` 🐛 Bug fixes → bumps **patch** version (0.2.21 → 0.2.22)
- `docs:` 📝 Documentation updates
- `chore:` 🔧 Maintenance tasks (deps, build config)
- `style:` 💅 Code style changes (formatting, no logic change)
- `refactor:` ♻️ Code refactoring (no feature/bug change)
- `perf:` ⚡ Performance improvements
- `test:` ✅ Adding or updating tests

**Breaking changes:** Add `BREAKING CHANGE:` in the commit body → bumps **major** version

#### Examples

```bash
# Feature (bumps to 0.3.0)
git commit -m "feat: add custom theme support with ThemeConfig interface"

# Bug fix (bumps to 0.2.22)
git commit -m "fix: resolve tooltip positioning on mobile devices"

# Documentation
git commit -m "docs: add examples for mobile-aware steps"

# Breaking change (bumps to 1.0.0)
git commit -m "feat: redesign Tour API

BREAKING CHANGE: removed deprecated 'tourDots' prop, use 'showProgress' instead"
```

---

## 🔁 Submitting a Pull Request

1. **🚀 Push Your Branch**

   ```bash
   git push origin feat/your-feature-name
   ```

2. **📬 Open a Pull Request**
   - Target the `main` branch
   - Use a semantic title matching commit convention:
     - ✅ `feat: add keyboard navigation`
     - ✅ `fix: tooltip arrow positioning`
     - ❌ `Update stuff` (too vague)
   - Describe your changes clearly:

     ```markdown
     ## What Changed
     - Added custom theme support via `customTheme` prop
     - Updated TypeScript definitions
     
     ## Why
     Users requested ability to fully customize colors beyond light/dark themes
     
     ## Testing
     - [x] Tested with custom theme config
     - [x] Verified TypeScript types
     - [x] Updated README examples
     
     Closes #123
     ```

   - Add labels: `enhancement`, `bug`, `documentation`, `good first issue`

3. **✅ Automated Checks**
   - ✨ PR title must follow conventional commit format
   - ✅ Tests must pass
   - 📦 Build must succeed
   - 📝 Changelog is auto-generated on merge using `standard-version`

4. **🔄 Code Review**
   - Address feedback promptly
   - Keep discussions focused and respectful
   - Update your PR based on reviews

---

## 🌱 First-Time Contributors

New to open source? Welcome! 💖  

**Getting Started:**

- Look for issues labeled [`good first issue`](https://github.com/nforshifu234dev/nfsfu234-tour-guide/labels/good%20first%20issue)
- Comment on an issue to claim it: "I'd like to work on this!"
- Ask questions — we're here to help! 🙌

**First PR Checklist:**

- [ ] Fork the repo
- [ ] Create a branch (`feat/my-first-contribution`)
- [ ] Make your changes
- [ ] Test locally (`npm run build`)
- [ ] Commit with conventional format (`feat: add X`)
- [ ] Push and open PR
- [ ] Respond to feedback

Our welcome bot will greet you when you open your first PR! 🎉

---

## 🐛 Reporting Bugs

Found a bug? Help us fix it!

**Before opening an issue:**

1. Check [existing issues](https://github.com/nforshifu234dev/nfsfu234-tour-guide/issues) to avoid duplicates
2. Test with the latest version (`npm update nfsfu234-tour-guide`)

**Bug Report Template:**

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Import Tour with these props: `{ theme: 'dark', ... }`
2. Click "Start Tour"
3. Tooltip doesn't appear

**Expected Behavior**
Tooltip should appear below the target element

**Actual Behavior**
Tooltip is off-screen

**Environment**
- nfsfu234-tour-guide version: 0.2.21
- React version: 18.2.0
- Browser: Chrome 120
- Device: Desktop

**Code Example**
\`\`\`tsx
<Tour steps={[...]} theme="dark" />
\`\`\`

**Screenshots**
(if applicable)
```

---

## 💡 Feature Requests

Have an idea? We'd love to hear it!

Open an issue with the `enhancement` label and describe:

- **What:** The feature you want
- **Why:** The problem it solves
- **How:** Your proposed implementation (optional)

**Examples of good requests:**

- "Add RTL (right-to-left) language support"
- "Allow async step validation before proceeding"
- "Export theme presets for customization"

---

## 📚 Documentation Contributions

Documentation is just as important as code!

**What to improve:**

- Fix typos or unclear explanations
- Add examples for common use cases
- Improve API reference
- Create tutorials or guides

**Files to edit:**

- `README.md` — Main documentation
- `CONTRIBUTING.md` — This file!
- Code comments in `src/index.tsx`

---

## 💬 Questions or Ideas?

- **GitHub Discussions:** Share ideas, ask questions, show off your implementation
- **Issues:** Use the `question` label for help
- **Discord/Slack:** (coming soon)

---

## 🎯 What We're Looking For

**High Priority:**

- 🌍 Internationalization (i18n) support
- ♿ Accessibility improvements (ARIA labels, keyboard nav)
- 📱 Better mobile experience
- 🎨 More theme presets (brand colors, high contrast)
- 📖 Live examples/playground

**Always Welcome:**

- 🐛 Bug fixes
- 📝 Documentation improvements
- ✅ Test coverage
- ⚡ Performance optimizations

---

## 📜 Code of Conduct

Be respectful, inclusive, and collaborative. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

**In short:**

- Be kind and constructive
- Welcome newcomers
- Focus on what's best for the community
- Assume good intentions

---

## 🏆 Recognition

Contributors are recognized in:

- 📋 Changelog (auto-generated from commits)
- 🌟 GitHub contributors list
- 💖 Special thanks in major releases

---

## 💛 Thank You

Your contributions power **nfsfu234-tour-guide** and help developers worldwide deliver outstanding onboarding experiences!

Every bug fix, feature, and doc improvement makes a difference. Thank you for being part of this journey! 🎉

---

**Built with ❤️ by NFORSHIFU234 Dev and contributors like you**
