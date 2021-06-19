module.exports = {
  testEnvironment: 'node',
  verbose: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'app.ts',
    '/db/mongo/migration',
    '/db/mongo/index.ts',
  ],
  preset: 'ts-jest',
};
