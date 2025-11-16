/**
 * ESLint Configuration for Modern JavaScript (2025)
 * Using Flat Config Format (ESLint 9+)
 */

const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        // Browser globals for renderer
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      // Modern Best Practices
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'prefer-spread': 'warn',
      'prefer-rest-params': 'warn',
      'object-shorthand': 'warn',
      'prefer-destructuring': ['warn', {
        'array': false,
        'object': true
      }],

      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // Performance
      'no-inner-declarations': 'warn',
      'no-loop-func': 'warn',

      // Code Quality
      'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
      'no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'no-console': 'off', // Allow console in Electron app
      'no-debugger': 'warn',
      'curly': ['error', 'all'],
      'brace-style': ['warn', '1tbs'],
      'comma-dangle': ['warn', 'never'],
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single', { 'avoidEscape': true }],

      // Async/Await
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',
      'require-atomic-updates': 'error',

      // ES2024 Features
      'prefer-exponentiation-operator': 'warn',
      'prefer-numeric-literals': 'warn',
      'prefer-object-spread': 'warn'
    }
  },
  {
    files: ['test/**/*.js', '**/*.test.js', '**/*.spec.js'],
    rules: {
      'no-unused-expressions': 'off'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'out/**',
      'build/**/*.ico',
      'coverage/**',
      '.git/**'
    ]
  }
];
