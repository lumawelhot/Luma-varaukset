module.exports = {
  'env': {
    'node':true,
    'browser': true,
    'es6': true,
    //'cypress/globals': true,
    'jest/globals': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    //'plugin:cypress/recommended'
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2020,
    'sourceType': 'module'
  },
  'settings': {
    'react': {
      'createClass': 'createReactClass',
      'pragma': 'React',
      'version': 'detect',
      'flowVersion': '0.53'
    },
    'propWrapperFunctions': [
      { 'property': 'freeze', 'object': 'Object' },
      { 'property': 'myFavoriteWrapper' }
    ],
    'linkComponents': [
      'Hyperlink',
      { 'name': 'Link', 'linkAttribute': 'to' }
    ]
  },
  'plugins': [
    'react',
    //'cypress',
    'jest'
  ],
  'rules': {
    'indent': [
      'error',
      2, { 'SwitchCase': 1 }
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'eqeqeq': 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': [
      'error', 'always'
    ],
    'arrow-spacing': [
      'error', { 'before': true, 'after': true }
    ],
    'no-console': 0,
    'react/prop-types': 0
  }
}