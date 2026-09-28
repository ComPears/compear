// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('production content security policy', () => {
  const config = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  const policy = config.match(/Content-Security-Policy = "([^"]+)"/)![1];
  const directives = new Map<string, string[]>(policy.split(';').map((part) => {
    const [name, ...sources] = part.trim().split(/\s+/);
    return [name, sources];
  }));

  it('blocks inline scripts, event handlers, eval and embedded plugins', () => {
    expect(directives.get('script-src')).toEqual(["'self'"]);
    expect(directives.get('script-src-attr')).toEqual(["'none'"]);
    expect(directives.get('object-src')).toEqual(["'none'"]);
  });

  it('retains MUI styling and required API endpoints without wildcard preview origins', () => {
    expect(directives.get('style-src')).toContain("'unsafe-inline'");
    expect(directives.get('connect-src')).toContain('https://compear-backend.onrender.com');
    expect(directives.get('connect-src')).toContain('https://api.emailjs.com');
    expect(directives.get('connect-src')?.some((value) => value.includes('*') || value.startsWith('http:'))).toBe(false);
  });
});
