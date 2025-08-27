# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is cVim (chromium-vim), a Chrome extension that adds Vim-like key bindings to Google Chrome. It's a Manifest V3 extension providing comprehensive Vim-style navigation, commands, and text editing capabilities within the browser.

**Repository**: Forked from https://github.com/1995eaton/chromium-vim  
**Extension Name**: cVim  
**Current Version**: 1.2.99  
**Manifest Version**: 3

## Development Commands

### Dependencies & Installation
- `npm install` - Install dependencies (@types/chrome, jest, highlight.js, markdown-it, pegjs)
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode  
- `npm run test:coverage` - Run tests with coverage report

### Extension Development
- Load extension: Navigate to `chrome://extensions`, enable Developer Mode, click "Load unpacked extension", select the cVim directory
- No build process required - extension files are directly loaded
- Parser regeneration: `pegjs cvimrc_parser/parser.peg` (generates parser.js from grammar)

## Code Architecture

### Core Components

**Background Scripts** (`background_scripts/`):
- `main.js` - Service worker entry point, imports all background modules
- `actions.js` - Chrome action handling (tab management, navigation)
- `bookmarks.js` - Bookmark search and management
- `clipboard.js` - Clipboard operations
- `history.js` - Browser history integration  
- `sessions.js` - Tab session management
- `popup.js` - Extension popup functionality
- `files.js`, `links.js`, `sites.js` - Utility modules
- `options.js` - Settings management
- `update.js` - Extension update handling
- `frames.js` - Frame management
- `tab_creation_order.js` - Tab order tracking
- `user.css` - User CSS customizations

**Content Scripts** (`content_scripts/`):
- `keys.js` - Keyboard event handling with modern KeyboardEvent.key support
- `command.js` - Command definitions and execution framework  
- `command_execute.js` - Command execution logic
- `hints.js` - Link hint generation and interaction
- `mappings.js` - Key mapping configuration
- `visual.js` - Visual/caret mode implementation
- `scroll.js` - Scrolling behavior
- `find.js` - Search functionality
- `cvimrc_parser.js` - Configuration file parser
- `bookmarks.js`, `clipboard.js` - Client-side implementations
- `complete.js` - Command completion
- `cursor.js` - Cursor management
- `dom.js` - DOM utilities
- `frames.js` - Frame handling
- `hateb.js` - Hatena bookmark integration
- `hud.js` - Heads-up display
- `local.js` - Local storage utilities
- `messenger.js` - Message passing
- `search.js` - Search functionality
- `session.js` - Session management
- `status.js` - Status display
- `utils.js` - General utilities
- `main.css` - Content script styles

**Configuration System**:
- `cvimrc_parser/parser.peg` - PEG.js grammar for .cvimrc syntax
- `cvimrc_parser/parser.js` - Generated parser from grammar
- Supports vim-like configuration with mappings, settings, commands, and site-specific configs

**UI Components**:
- `cmdline_frame.html/js` - Command line interface iframe
- `pages/options.html/js/css` - Extension settings page with CodeMirror editor
- `pages/popup.html/js` - Browser action popup
- `pages/mappings.html` - Mapping configuration
- `pages/codemirror/` - CodeMirror editor for .cvimrc editing
- Various CSS files for styling

**Testing**:
- `test/` - Jest test suite with jsdom environment
- `test/setup.js` - Chrome API mocks and test utilities
- Test files for background scripts, content scripts, and utilities
- Coverage includes background_scripts, content_scripts, and cvimrc_parser

### Key Features

1. **Vim-like Navigation**: hjkl movement, page scrolling, tab navigation
2. **Link Hints**: f/F for link following with customizable hint characters and animations
3. **Command Mode**: Vim-style command bar with tab completion and search engines
4. **Visual Mode**: Text selection and manipulation with caret mode
5. **Search**: Regex-based find with highlighting and incremental search
6. **Custom Mappings**: User-defined key bindings via .cvimrc with leader key support
7. **Bookmark/History Integration**: Search and open bookmarks/history with folder support
8. **Session Management**: Save/restore tab sessions across windows
9. **Site-specific Configuration**: Per-site settings and mappings
10. **Insert Mode Mappings**: Text editing enhancements in input fields
11. **Multi-hint Actions**: Bulk operations on multiple links

### Chrome Extension Architecture

**Manifest V3 Features**:
- Service worker background script (`background_scripts/main.js`)
- Content scripts injected at `document_start` into `<all_urls>`
- Comprehensive permissions: tabs, history, bookmarks, storage, sessions, downloads, clipboard
- Chrome commands integration for keyboard shortcuts
- Web accessible resources for iframe content

**Message Passing**:
- Background ↔ Content script communication
- Tab management and synchronization
- Settings propagation across all tabs
- Command execution coordination

**Storage**:
- Chrome local storage for sessions and temporary data
- Settings synchronization across all tabs
- Bookmark and history caching

## Development Notes

- Extension uses Manifest V3 service worker architecture with importScripts
- Content scripts use all_frames: true for iframe support
- KeyListener supports both legacy keyCode and modern KeyboardEvent.key APIs
- CSS uses high z-index values to ensure UI elements appear above page content
- Parser generation requires pegjs: `pegjs cvimrc_parser/parser.peg`
- No build process - direct file loading for development
- Comprehensive test suite with Chrome API mocks
- Uses jsdom for DOM testing in content scripts