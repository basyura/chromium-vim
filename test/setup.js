// Chrome API mocks
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    getURL: jest.fn((path) => `chrome-extension://test-id/${path}`),
    getManifest: jest.fn(() => ({ version: '1.0.0' })),
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    sendMessage: jest.fn(),
    onActivated: {
      addListener: jest.fn(),
    },
    onUpdated: {
      addListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  bookmarks: {
    search: jest.fn(),
    getTree: jest.fn(),
  },
  history: {
    search: jest.fn(),
  },
  action: {
    setIcon: jest.fn(),
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
};

// DOM mocks for content scripts
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com',
    origin: 'https://example.com',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
