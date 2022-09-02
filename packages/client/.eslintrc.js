const path = require('path');

const ROOT_DIR = __dirname.replace(/packages.*$/, '');

module.exports = {
  env: {
    browser: true,
    node: true,
    es2020: true,
    jest: true,
  },
  globals: {
    artifacts: 'readonly',
    contract: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'mocha',
    'import',
  ],
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:mocha/recommended',
  ],
  rules: {
    'import/no-unresolved': [2, { ignore: ['^@'] }],
    quotes: ['error', 'single'],
    'default-param-last': 'off',
    'no-shadow': 'off',
    'no-debugger': 'off',
    'jsx-a11y/no-autofocus': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'react/function-component-definition': 'off',
    'jsx-a11y/interactive-supports-focus': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-extraneous-dependencies': 'off',
    'function-paren-newline': 'off',
    semi: 'off',
    '@typescript-eslint/semi': ['error'],
    'no-bitwise': 'off',
    'react/destructuring-assignment': 'off',
    'no-return-assign': 'off',
    'mocha/no-async-describe': 'off',
    'mocha/no-mocha-arrows': 'off',
    'import/prefer-default-export': 'off',
    'arrow-body-style': 'off',
    'object-curly-newline': 'off',
    'react/require-default-props': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],
    'import/extensions': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'react/jsx-props-no-spreading': ['error', { custom: 'ignore' }],
    'react/no-unescaped-entities': 'off',
    'prefer-const': 'off',
    // needed because of https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md#how-to-use & https://stackoverflow.com/questions/63818415/react-was-used-before-it-was-defined
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: false, variables: true },
    ],
    '@typescript-eslint/explicit-function-return-type': ['error'],
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: [
          path.join(ROOT_DIR, 'packages', 'client', 'node_modules'),
          path.join(ROOT_DIR, 'node_modules'),
        ],
      },
    },
  },
};
