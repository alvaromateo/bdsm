/* eslint-disable */
const path = require('path');
const fs = require('fs');

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ['<rootDir>'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}),
  globals: {
    loadFile: (name) => {
      const file = path.join(__dirname, 'test', name);
      return fs.readFileSync(file, { encoding: 'utf8' });
    },
  },
};

// From https://dev.to/michaeljota/how-to-add-jest-into-your-vite-project-with-ts-5d21
