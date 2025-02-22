/* eslint-disable */
const path = require('path');
const fs = require('fs');

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ['<rootDir>'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}),
  transform: {
    '.+\\.(css|less|sass|scss|png|jpg|gif|ttf|woff|woff2|svg)$': 'jest-transform-stub',
  },
};

// From https://dev.to/michaeljota/how-to-add-jest-into-your-vite-project-with-ts-5d21
