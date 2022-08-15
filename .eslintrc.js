module.exports = {
  env: {
    browser: true,
    es2021: true,
    'react-native/react-native': true, // whitelist all browser-like globals
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'airbnb',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'react-native',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'linebreak-style': ['warn', 'windows'],
    // previous rules here
    'react-native/no-unused-styles': 2, // disallow unused styles
    'react-native/no-inline-styles': 2, // disallow styles declared within the component itself
    'react-native/no-color-literals': 2, // enforces variable names to be used for storing colors
  },
};
