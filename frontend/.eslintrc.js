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
    'react/prop-types': 0,
    'camelcase': [ 'error', { 'ignoreImports': true } ],
    'no-multi-spaces': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-mixed-operators': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'no-return-await': 'error',
    'no-throw-literal': 'error',
    'no-var': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'prefer-const': 'error',
    'prefer-destructuring': ['error', {
      'VariableDeclarator': {
        'array': false,
        'object': true
      },
      'AssignmentExpression': {
        'array': true,
        'object': false
      }
    }, {
      'enforceForRenamedProperties': false
    }],
    'prefer-object-spread': 'error',
    'prefer-template': 'error',
    'require-await': 'error',
    'eol-last': ['error', 'always'],
    'jsx-quotes': ['error', 'prefer-single'],
    'no-whitespace-before-property': 'error',
    'nonblock-statement-body-position': ['error', 'beside'],
    'rest-spread-spacing': ['error'],
    'space-infix-ops': 'error',
  }
}
