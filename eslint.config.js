module.exports = [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.next/**"]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": "warn"
    }
  }
];
