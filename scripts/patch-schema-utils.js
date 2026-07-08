#!/usr/bin/env node
/**
 * Patches schema-utils validate.js to work with ajv-keywords 5.x (no formatMinimum/formatMaximum).
 * Run after npm install so npm start does not throw "Unknown keyword formatMinimum".
 */
const fs = require('fs');
const path = require('path');

function patchContent(content) {
  if (content.includes('ajv-keywords 5.x compat')) return content;
  const doubleQuote = '  ajvKeywords(ajv, ["instanceof", "formatMinimum", "formatMaximum", "patternRequired"]); // Custom keywords';
  const singleQuote = "ajvKeywords(ajv, ['instanceof', 'formatMinimum', 'formatMaximum', 'patternRequired']); // Custom keywords";
  const tryCatchDouble = `  try {
    ajvKeywords(ajv, ["instanceof", "formatMinimum", "formatMaximum", "patternRequired"]);
  } catch (_) {
    ajvKeywords(ajv, ["patternRequired"]); // ajv-keywords 5.x compat
  }`;
  const tryCatchSingle = `try {
  ajvKeywords(ajv, ['instanceof', 'formatMinimum', 'formatMaximum', 'patternRequired']);
} catch (_) {
  ajvKeywords(ajv, ['patternRequired']); // ajv-keywords 5.x compat
}`;
  if (content.includes(doubleQuote)) return content.replace(doubleQuote, tryCatchDouble);
  if (content.includes(singleQuote)) return content.replace(singleQuote, tryCatchSingle);
  return content;
}

const nodeModules = path.join(__dirname, '..', 'node_modules');
const candidates = [
  path.join(nodeModules, 'fork-ts-checker-webpack-plugin', 'node_modules', 'schema-utils', 'dist', 'validate.js'),
  path.join(nodeModules, 'babel-loader', 'node_modules', 'schema-utils', 'dist', 'validate.js'),
  path.join(nodeModules, 'file-loader', 'node_modules', 'schema-utils', 'dist', 'validate.js'),
];

let patched = 0;
for (const file of candidates) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const newContent = patchContent(content);
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    patched++;
  }
}
if (patched > 0) {
  console.log('patch-schema-utils: patched', patched, 'schema-utils validate.js file(s) for ajv-keywords 5.x');
}
