/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/?(*.)+(test).ts"], 
    transform: {
      "^.+\\.ts$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
    globals: {
      "ts-jest": {
        tsconfig: "tsconfig.json", 
      },
    },
    verbose: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
  };
  