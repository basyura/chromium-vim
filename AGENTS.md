# Repository Guidelines

## Project Structure & Module Organization
- `background_scripts/`: Background logic, message passing, lifecycle handlers.
- `content_scripts/`: Page-level handlers, keymaps, UI injections.
- `cvimrc_parser/`: cVimrc parser and helpers; keep grammar changes tested.
- `pages/`: Extension pages (options/help); HTML/CSS/JS assets.
- `icons/`: Extension icons.
- `manifest.json`: Chrome extension manifest (permissions, scripts, pages).
- `test/`: Jest tests and setup (`test/setup.js`).
- Root: `README.md`, `.eslintrc`, `jest.config.js`, `package.json`.

## Build, Test, and Development Commands
- `npm test`: Run all Jest tests once.
- `npm run test:watch`: Watch mode for rapid iteration.
- `npm run test:coverage`: Generate coverage for core folders.
- Load in Chrome: chrome://extensions → Enable Developer mode → Load unpacked → select repo root (where `manifest.json` lives).

## Coding Style & Naming Conventions
- JavaScript with ESLint: 2-space indent, single quotes, semicolons.
- Enforce `camelCase` props, `eqeqeq`, no unused vars (except `LOG`).
- Prefer small, pure functions; avoid global state in content scripts.
- File names: lowerCamelCase for modules, `UPPER_CASE` for constants.

## Testing Guidelines
- Framework: Jest (`jsdom` env). Tests under `test/**/*.test.js|spec.js`.
- Coverage includes `background_scripts/`, `content_scripts/`, `cvimrc_parser/`.
- Name tests after behavior (e.g., `parser-handles-site-rules.spec.js`).
- Mock `chrome` APIs as needed; see `test/setup.js`.

## Commit & Pull Request Guidelines
- Conventional Commits: `type(scope): subject` (imperative, ≤50 chars, no period).
- Body: blank line, then bullets (~72 chars/line) with rationale/impact.
- Footer: `Refs: #123` / `Closes: #123` when applicable.
- Split logically: manifest updates, build/test tweaks, logic changes separated.
- Fix message issues via `--amend`; if shared already, use `rebase -i` `reword`.
- PRs must include: summary, linked issues, reproduction/verification steps, and screenshots/GIFs when UI/UX changes affect the extension.

## Security & Configuration Tips
- Keep permissions minimal in `manifest.json`; justify new permissions in PRs.
- Do not commit secrets or personal data; avoid site-specific hardcoding.
- Changes to key mappings or cVimrc parsing should include tests covering
  site rules and `unmap` behavior.

