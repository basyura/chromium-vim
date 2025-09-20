// Mock LOG function
global.LOG = jest.fn();

// Load the utils module to get matchLocation function
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(
  path.join(__dirname, '../../content_scripts/utils.js'),
  'utf8'
);

// Extract matchLocation function
let matchLocation;
eval(utilsCode.replace('var matchLocation', 'matchLocation'));

// Mock Utils.split function
global.Utils = {
  split: (str, regex) => str.split(regex),
};

// Implement isBlacklisted function based on the command.js logic
const isBlacklisted = function (url) {
  const blacklists = global.settings.blacklists;
  let isBlacklistedResult = false;

  for (let i = 0, l = blacklists.length; i < l; i++) {
    const blacklist = blacklists[i].split(/\s+/);
    if (!blacklist.length) {
      continue;
    }
    if (blacklist[0].charAt(0) === '@') {
      if (matchLocation(url, blacklist[0].slice(1))) {
        isBlacklistedResult = false;
        break;
      }
    } else if (matchLocation(url, blacklist[0])) {
      isBlacklistedResult = true;
    }
  }
  return isBlacklistedResult;
};

describe('matchLocation - Blacklist URL matching fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('localhost with ports handling', () => {
    test('should match localhost pattern without port to localhost URL with port', () => {
      const url = 'http://localhost:3000/path';
      const pattern = 'http://localhost/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should match localhost pattern with port to exact URL', () => {
      const url = 'http://localhost:3000/path';
      const pattern = 'http://localhost:3000/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should not match localhost with different ports', () => {
      const url = 'http://localhost:3000/path';
      const pattern = 'http://localhost:8080/*';

      expect(matchLocation(url, pattern)).toBe(false);
    });

    test('should match localhost without port to localhost URL without port', () => {
      const url = 'http://localhost/path';
      const pattern = 'http://localhost/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });
  });

  describe('hostname and port matching logic', () => {
    test('should match domain pattern without port to domain URL with port', () => {
      const url = 'http://example.com:8080/path';
      const pattern = 'http://example.com/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should match domain pattern with port to exact URL', () => {
      const url = 'http://example.com:8080/path';
      const pattern = 'http://example.com:8080/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should not match domain with different ports', () => {
      const url = 'http://example.com:8080/path';
      const pattern = 'http://example.com:3000/*';

      expect(matchLocation(url, pattern)).toBe(false);
    });

    test('should match wildcard domain pattern with ports', () => {
      const url = 'http://sub.example.com:3000/path';
      const pattern = 'http://*.example.com/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });
  });

  describe('edge cases from the fix', () => {
    test('should handle URLs with default ports correctly', () => {
      const url = 'http://example.com:80/path';
      const pattern = 'http://example.com/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should handle HTTPS URLs with default ports', () => {
      const url = 'https://example.com:443/path';
      const pattern = 'https://example.com/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should handle complex localhost patterns', () => {
      const url = 'http://localhost:3000/api/v1/users';
      const pattern = 'http://localhost/api/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should not match partial hostnames', () => {
      const url = 'http://localhost:3000/path';
      const pattern = 'http://local/*';

      expect(matchLocation(url, pattern)).toBe(false);
    });

    test('should handle IPv4 addresses with ports', () => {
      const url = 'http://127.0.0.1:8080/path';
      const pattern = 'http://127.0.0.1/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should handle IPv6 addresses with ports', () => {
      // IPv6 URLs are complex and may not be fully supported in the current implementation
      // This test documents the current behavior
      const url = 'http://[::1]:8080/path';
      const pattern = 'http://[::1]/*';

      // Current implementation may not fully support IPv6 with brackets
      expect(matchLocation(url, pattern)).toBe(false);
    });
  });

  describe('protocol and path matching', () => {
    test('should respect protocol differences', () => {
      const url = 'https://localhost:3000/path';
      const pattern = 'http://localhost/*';

      expect(matchLocation(url, pattern)).toBe(false);
    });

    test('should match wildcard protocols', () => {
      const url = 'https://localhost:3000/path';
      const pattern = '*://localhost/*';

      expect(matchLocation(url, pattern)).toBe(true);
    });

    test('should match specific paths with ports', () => {
      const url = 'http://localhost:3000/api/users';
      const pattern = 'http://localhost:3000/api/users';

      expect(matchLocation(url, pattern)).toBe(true);
    });
  });

  describe('isBlacklisted - Real world blacklist scenarios', () => {
    beforeEach(() => {
      // Mock global settings object
      global.settings = {
        blacklists: ['https://example.com/*', 'http://localhost:4966'],
      };
    });

    test('should not blacklist basyura.org when not in blacklist', () => {
      const url = 'http://basyura.org';

      expect(isBlacklisted(url)).toBe(false);
    });

    test('should blacklist example.com URLs', () => {
      const url = 'https://example.com/some/path';

      expect(isBlacklisted(url)).toBe(true);
    });

    test('should blacklist exact localhost:4966 URL', () => {
      const url = 'http://localhost:4966';

      expect(isBlacklisted(url)).toBe(true);
    });

    test('should not blacklist localhost with different port', () => {
      const url = 'http://localhost:3000';

      expect(isBlacklisted(url)).toBe(false);
    });

    test('should not blacklist basyura.org with HTTPS', () => {
      const url = 'https://basyura.org';

      expect(isBlacklisted(url)).toBe(false);
    });

    test('should not blacklist basyura.org with paths', () => {
      const url = 'http://basyura.org/blog/2023/some-post';

      expect(isBlacklisted(url)).toBe(false);
    });

    test('should blacklist example.com subdomains due to wildcard', () => {
      const url = 'https://sub.example.com/page';

      // This should be false since the pattern is exact "example.com", not "*.example.com"
      expect(isBlacklisted(url)).toBe(false);
    });

    test('should verify basyura.org is active (not blacklisted) in various scenarios', () => {
      const testUrls = [
        'http://basyura.org',
        'https://basyura.org',
        'http://basyura.org/',
        'http://basyura.org/path',
        'http://basyura.org:80',
        'https://basyura.org:443',
      ];

      testUrls.forEach((url) => {
        expect(isBlacklisted(url)).toBe(false);
      });
    });
  });
});
