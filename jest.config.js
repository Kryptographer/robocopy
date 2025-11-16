/**
 * Jest Configuration for Robocopy GUI
 * Provides unit testing for Node.js/Electron main process code
 */

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '*.js',
    '!jest.config.js',
    '!eslint.config.js',
    '!playwright.config.js',
    '!coverage/**',
    '!node_modules/**',
    '!dist/**',
    '!out/**',
    '!build/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/out/',
    '/build/'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 10000
};
