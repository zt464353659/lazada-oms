module.exports = {
  'extends': 'plugin:vue/strongly-recommended',

  rules: {
    'vue/attribute-hyphenation': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/v-on-function-call': 'error',
    'vue/eqeqeq': [
      'error',
      'always',
      {
        null: 'ignore'
      }
    ],
    'vue/component-name-in-template-casing': ['error', 'kebab-case', {
      'registeredComponentsOnly': true,
      'ignores': []
    }],
    'vue/no-use-v-if-with-v-for': 'off'
  },

  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    allowImportExportEverywhere: false,
    codeFrame: false
  }
  // https://vuejs.github.io/eslint-plugin-vue/user-guide/#faq
  // 'parserOptions': {
  //   'parser': 'babel-eslint',
  //   'ecmaVersion': 2017,
  //   'sourceType': 'module'
  // }
}
