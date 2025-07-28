// Mock global variables and dependencies
global.Quickmarks = {};
global.activePorts = [];
global.Actions = {};
global.settings = {
  defaultnewtabpage: false,
  blacklists: []
};
global.Utils = {
  toSearchURL: jest.fn((url) => url)
};
global.History = {
  commandHistory: []
};
global.Bookmarks = {};
global.Options = {};
global.Frames = {
  add: jest.fn()
};

// Mock port object
const mockPort = {
  postMessage: jest.fn()
};

// Load the actions module
const fs = require('fs');
const path = require('path');
const actionsCode = fs.readFileSync(path.join(__dirname, '../../background_scripts/actions.js'), 'utf8');
eval(actionsCode);

describe('Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.activePorts = [mockPort];
  });

  describe('Actions module functions', () => {
    test('should call updateLastCommand action', () => {
      const testData = { command: 'test', args: [] };
      const mockCallback = jest.fn();
      
      const request = {
        action: 'updateLastCommand',
        data: testData,
        repeats: 1
      };
      
      const sender = {
        tab: { id: 1 }
      };

      const result = Actions(request, sender, mockCallback, mockPort);

      expect(mockPort.postMessage).toHaveBeenCalledWith({
        type: 'updateLastCommand',
        data: testData
      });
    });

    test('should call getRootUrl action', () => {
      const mockCallback = jest.fn();
      
      const request = {
        action: 'getRootUrl',
        repeats: 1
      };
      
      const sender = {
        tab: { url: 'https://example.com/path' }
      };

      Actions(request, sender, mockCallback, mockPort);

      expect(mockCallback).toHaveBeenCalledWith('https://example.com/path');
    });

    test('should return false for invalid action', () => {
      const request = {
        action: 'invalidAction',
        repeats: 1
      };
      
      const sender = { 
        tab: { id: 1 } 
      };
      
      const mockCallback = jest.fn();

      const result = Actions(request, sender, mockCallback, mockPort);

      expect(result).toBe(false);
    });

    test('should return false when no sender tab for non-openLinkTab actions', () => {
      const request = {
        action: 'updateLastCommand',
        data: { command: 'test' },
        repeats: 1
      };
      
      const sender = {}; // No tab property
      const mockCallback = jest.fn();

      const result = Actions(request, sender, mockCallback, mockPort);

      expect(result).toBe(false);
    });
  });
});