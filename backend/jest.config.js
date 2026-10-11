module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup.js"],
  testMatch: ["**/test/**/*.test.js"],
  clearMocks: true,
  maxWorkers: 1,
};
