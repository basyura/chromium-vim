// Mock LOG function
global.LOG = jest.fn();

// Mock the global environment that utils.js expects
global.Utils = {};

// Load the utils module
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.join(__dirname, '../../content_scripts/utils.js'), 'utf8');
eval(utilsCode);

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheFunction', () => {
    test('should cache function results', () => {
      const mockCallback = jest.fn((x) => x * 2);
      const cachedFunction = Utils.cacheFunction(mockCallback);

      const result1 = cachedFunction(5);
      const result2 = cachedFunction(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should clear cache when clearCache is called', () => {
      const mockCallback = jest.fn((x) => x * 2);
      const cachedFunction = Utils.cacheFunction(mockCallback);

      cachedFunction(5);
      cachedFunction.clearCache();
      cachedFunction(5);

      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('trueModulo', () => {
    test('should handle positive numbers correctly', () => {
      expect(Utils.trueModulo(7, 3)).toBe(1);
      expect(Utils.trueModulo(6, 3)).toBe(0);
    });

    test('should handle negative numbers correctly', () => {
      expect(Utils.trueModulo(-1, 3)).toBe(2);
      expect(Utils.trueModulo(-4, 3)).toBe(2);
    });
  });

  describe('uniqueElements', () => {
    test('should return unique elements from array', () => {
      const input = [1, 2, 2, 3, 1, 4];
      const expected = [1, 2, 3, 4];
      expect(Utils.uniqueElements(input)).toEqual(expected);
    });

    test('should handle empty array', () => {
      expect(Utils.uniqueElements([])).toEqual([]);
    });

    test('should handle array with no duplicates', () => {
      const input = [1, 2, 3];
      expect(Utils.uniqueElements(input)).toEqual(input);
    });
  });

  describe('compressArray', () => {
    test('should remove falsy values from array', () => {
      const input = [1, null, 2, undefined, 3, false, 4, '', 5, 0];
      const expected = [1, 2, 3, 4, 5];
      expect(Utils.compressArray(input)).toEqual(expected);
    });

    test('should handle array with no falsy values', () => {
      const input = [1, 2, 3];
      expect(Utils.compressArray(input)).toEqual(input);
    });
  });
});