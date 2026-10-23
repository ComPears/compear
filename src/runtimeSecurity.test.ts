// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('build and deployment use patched Node including the separate deploy job', () => {
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  expect(major).toBe(24);
  expect(minor > 22 || (minor === 22 && patch >= 1)).toBe(true);
  expect(readFileSync('.nvmrc', 'utf8').trim()).toBe('24.22.1');
  expect(JSON.parse(readFileSync('package.json', 'utf8')).engines.node).toBe('>=24.22.1 <25');
  expect(readFileSync('.npmrc', 'utf8')).toContain('engine-strict=true');
  expect(readFileSync('netlify.toml', 'utf8')).toContain('NODE_VERSION = "24.22.1"');
  const workflow = readFileSync('.github/workflows/deploy.yaml', 'utf8');
  expect(workflow.match(/node-version-file: .nvmrc/g)).toHaveLength(2);
});
