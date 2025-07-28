module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/test/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'background_scripts/**/*.js',
    'content_scripts/**/*.js',
    'cvimrc_parser/**/*.js',
    '!**/node_modules/**',
    '!**/test/**'
  ],
  globals: {
    chrome: {}
  }
};