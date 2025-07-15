# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is cVim, a Chrome extension that adds Vim-like key bindings to Google Chrome. It's a Manifest V3 extension that provides comprehensive Vim-style navigation, commands, and text editing capabilities within the browser.

## Development Commands

- `npm install` - Install dependencies (highlight.js, markdown-it, pegjs)
- Load extension in Chrome: Navigate to `chrome://extensions`, enable Developer Mode, click "Load unpacked extension", select the cVim directory
- No automated build process - extension files are directly loaded

## Code Architecture

### Core Components

**Background Scripts** (`background_scripts/`):
- `main.js` - Service worker entry point, manages extension lifecycle
- `actions.js` - Chrome action handling (tab management, navigation)
- `bookmarks.js` - Bookmark search and management
- `clipboard.js` - Clipboard operations
- `history.js` - Browser history integration
- `sessions.js` - Tab session management
- `popup.js` - Extension popup functionality

**Content Scripts** (`content_scripts/`):
- `keys.js` - Keyboard event handling and key mapping system
- `command.js` - Command definitions and execution framework
- `hints.js` - Link hint generation and interaction
- `mappings.js` - Key mapping configuration
- `visual.js` - Visual/caret mode implementation
- `scroll.js` - Scrolling behavior
- `find.js` - Search functionality
- `cvimrc_parser.js` - Configuration file parser

**Configuration System**:
- `cvimrc_parser/` - PEG.js parser for .cvimrc configuration files
- `parser.peg` - Grammar definition for configuration syntax
- Support for vim-like configuration with mappings, settings, and commands

**UI Components**:
- `cmdline_frame.html/js` - Command line interface
- `pages/options.html` - Extension settings page
- `pages/popup.html` - Browser action popup

### Key Features

1. **Vim-like Navigation**: hjkl movement, page scrolling, tab navigation
2. **Link Hints**: f/F for link following with customizable hint characters
3. **Command Mode**: Vim-style command bar with tab completion
4. **Visual Mode**: Text selection and manipulation
5. **Search**: Regex-based find with highlighting
6. **Custom Mappings**: User-defined key bindings via .cvimrc
7. **Bookmark/History Integration**: Quick access to bookmarks and history
8. **Session Management**: Save/restore tab sessions

### Message Passing

The extension uses Chrome's message passing API for communication between background scripts and content scripts. Key message types include:
- Tab actions (create, close, switch)
- Settings synchronization
- Command execution
- Clipboard operations

### Settings System

Settings are stored in Chrome's local storage and synchronized across all tabs. The extension supports both boolean settings (set/unset) and value settings (let assignments).

## Development Notes

- Extension uses Manifest V3 service worker architecture
- All content scripts are injected into `<all_urls>` with `document_start` timing
- Parser is generated from PEG.js grammar - regenerate with `pegjs parser.peg`
- CSS uses high z-index values to ensure UI elements appear above page content
- KeyListener handles both legacy keyCode and modern KeyboardEvent.key APIs