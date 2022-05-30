module.exports = {
  preset: '@shelf/jest-mongodb',
  watchPathIgnorePatterns: ['globalConfig'],
  setupFilesAfterEnv: ['./setup.js']
}