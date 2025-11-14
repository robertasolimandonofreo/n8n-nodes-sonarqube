module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: [
    'eslint:recommended',
    'plugin:n8n-nodes-base/community',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'n8n-nodes-base/node-param-display-name-miscased': 'error',
    'n8n-nodes-base/node-param-description-miscased': 'error',
    'n8n-nodes-base/node-param-description-missing-final-period': 'error',
  },
  env: {
    node: true,
    es6: true,
  },
};
