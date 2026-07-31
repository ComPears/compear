import '@testing-library/jest-dom/vitest';

// Some Node versions expose an incomplete localStorage object when the
// --localstorage-file flag is present without a path. Keep browser-facing
// tests deterministic by installing the small Web Storage surface we use.
if (
  typeof globalThis.localStorage?.getItem !== 'function' ||
  typeof globalThis.localStorage?.setItem !== 'function' ||
  typeof globalThis.localStorage?.clear !== 'function'
) {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      key: (index: number) => Array.from(values.keys())[index] ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, String(value)),
    },
  });
}
