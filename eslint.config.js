module.exports = [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs"
    },
    rules: {
      "no-unused-vars": "warn"
    }
  }
];
