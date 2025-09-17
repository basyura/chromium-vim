# Repository Guidelines

## Project Structure & Module Organization
Responsibilities are split per folder. `background_scripts/` handles lifecycle hooks and message routing, while `content_scripts/` injects DOM helpers and keymaps. UI assets live in `pages/`, icons in `icons/`, and parser logic in `cvimrc_parser/`. `manifest.json` is the Chrome entry point, and tests plus Chrome mocks reside in `test/` with `test/setup.js` exporting the harness.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Run `npm test` for a single Jest pass, `npm run test:watch` when iterating, and `npm run test:coverage` to review coverage output. To verify changes in Chrome, open `chrome://extensions`, enable Developer Mode, choose Load unpacked, and select the repository root containing `manifest.json`.

## Coding Style & Naming Conventions
JavaScript follows ESLint rules: two-space indentation, single quotes, and mandatory semicolons. Use `camelCase` for functions and props, lowerCamelCase for files, and `UPPER_CASE` for constants. Keep content scripts free of global leaks and prefer small, pure helpers. Run `npm run lint` before pushing so CI matches your result. Add brief intent comments only when logic is non-obvious.

## Testing Guidelines
Jest with a `jsdom` environment powers the suite. Place specs under `test/**/*.test.js` or `*.spec.js`, naming them after behaviors such as `parser-handles-site-rules.spec.js`. Reuse `test/setup.js` for Chrome API mocks. Cover success and edge cases whenever you touch `background_scripts/`, `content_scripts/`, or the parser. Branches should not leave failing `npm test` runs.

## Commit & Pull Request Guidelines
Use `type(scope): subject` (English, imperative, ≤50 chars, no period). After a blank line, add bullet points describing motivation and impact. Split manifest updates, build tweaks, and logic changes into separate commits. Amend messages with `git commit --amend` before sharing. Pull requests must include a summary, linked issues, verification steps, and screenshots or GIFs for UI-visible changes. Explain new permissions or parser adjustments so reviewers can assess risk.

## Security & Configuration Tips
Keep `manifest.json` permissions minimal and remove unused host access. Never commit secrets or user data. Parser or keymap changes must ship with matching tests and a note about potential user impact. Provide sanitized defaults (e.g., `.env.example`) when configuration files are required.

## Workflow Tips
Rebase with `git pull --rebase` before starting work. Open draft PRs early to surface design questions, and prefer smaller, incremental merges. Capture investigation notes or reproduction steps in `docs/` or linked issues so teammates can follow the context quickly.
