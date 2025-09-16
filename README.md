# 📸 pixel-diff-ui

A **lightweight visual regression testing tool** for frontend apps.  
Easily record baseline screenshots, compare changes, and review them in a built-in dashboard with **Approve** flows.  

No heavy setup, no Docker, no boilerplate tests. Just plug and play.

---

## Features
- **One-liner commands** — `record`, `compare`, `dashboard`.
- **Multi-scenario config** — test multiple pages/components in one run.
- **Built-in Dashboard UI** — review baseline, current, and diff side by side.
- **Approve flow** — accept intended changes, update baselines automatically.
- **CI/CD integration ready** — fail builds on unexpected visual changes.
- **Lightweight** — Node + Puppeteer, no extra infra.

---

## Installation
```bash
npm install -g pixel-diff-ui
```

or run with `npx`:
```bash
npx pixel-diff-ui record ...
```

---

## 🚀 Usage

### 1. Record a baseline
Start your app (e.g. Next.js on `http://localhost:3000`) and run:
```bash
pixel-diff-ui record -n homepage -u http://localhost:3000 -v 1366x768
```

This saves a baseline screenshot in `__pixel_baseline__/`.

---

### 2. Compare with current UI
After making changes in your app:
```bash
pixel-diff-ui compare -n homepage -u http://localhost:3000 -v 1366x768
```

This generates:
- `__pixel_output__/…_current.png` → latest screenshot
- `__pixel_output__/…_diff.png` → highlighted visual differences

---

### 3. Multi-scenario with config
Create a `pixel-diff.json` in your project:

```json
{
  "baselineDir": "__pixel_baseline__",
  "outputDir": "__pixel_output__",
  "threshold": 0.1,
  "scenarios": [
    {
      "name": "Homepage",
      "url": "http://localhost:3000",
      "viewport": "1366x768"
    },
    {
      "name": "About Page",
      "url": "http://localhost:3000/about",
      "viewport": "1366x768"
    },
    {
      "name": "Mobile Homepage",
      "url": "http://localhost:3000",
      "viewport": "375x812"
    }
  ]
}
```

Run all scenarios in one go:
```bash
pixel-diff-ui record --config pixel-diff.json
pixel-diff-ui compare --config pixel-diff.json
```

---

### 4. Review in Dashboard
Launch the built-in dashboard:
```bash
pixel-diff-ui dashboard --config pixel-diff.json
```

- Shows **Baseline / Current / Diff** for each scenario.  
- Click **Approve** → updates baseline with current screenshot.  
- Commit new baselines to keep history in version control.

---

## CI/CD Integration
Perfect for pull requests:
- Run `pixel-diff-ui compare --config pixel-diff.json`
- If diffs are found, the CLI exits with code `1` (failing the build).
- Upload `__pixel_output__/` as build artifacts for review.
- Reviewer uses Dashboard locally or commits updated baselines when design changes are approved.

---

## Benefits

- **Catch accidental UI regressions**: Pixel-perfect checks that unit tests can’t detect.
- **Team workflow**: Designers & devs review visual changes before merging.
- **Simple approval flow**: Update baselines only when changes are intended.
- **Lightweight**: No heavy Docker or third-party services, works locally & in CI.

---

## Why is this novel?
Existing tools exist (BackstopJS, jest-image-snapshot, Differencify, etc.), but they have trade-offs:
- BackstopJS → powerful but config-heavy & not very DX-friendly.
- jest-image-snapshot → requires writing test code, no dashboard.
- Differencify → low-level library, no UI, no workflows.
- Micoo → Docker-based, heavy infra.

**`pixel-diff-ui` is different**:
- Developer-first **CLI workflow** (`record`, `compare`, `dashboard`).
- Zero-config **defaults** that just work.
- Built-in **Dashboard UI** with approve button.
- Works **standalone**, integrates easily into any project.

It’s like **Jest snapshots — but for pixels, with a UI.**

---

## 🛠 Roadmap
- [ ] Approve All button in dashboard
- [ ] CI-friendly HTML report export
- [ ] Ignore regions (mask out ads/timestamps)
- [ ] GitHub Action for easy PR checks

---
