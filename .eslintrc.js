module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/html-indent': ['error', 2, {
      attribute: 1,
      baseIndent: 1,
      closeBracket: 0,
      alignAttributesVertically: true,
      ignores: []
    }],
    "vue/html-self-closing": ["error", {
      html: {
        void: "never",
        normal: "always",
        component: "always"
      },
      svg: "always",
      math: "always"
    }],
    "vue/multiline-html-element-content-newline": ["error", {
      ignoreWhenEmpty: true,
      ignores: ["pre", "textarea"],
      allowEmptyLines: false
  }],
  "vue/max-attributes-per-line": ["error", {
    singleline: 1,
    multiline: {
      max: 1,
      allowFirstLine: false
    }
  }]
  }
}
