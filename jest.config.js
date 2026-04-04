/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "commonjs", moduleResolution: "node" } }],
  },
  testPathPattern: "\\.(test|spec)\\.tsx?$",
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/app/**", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
};

module.exports = config;
