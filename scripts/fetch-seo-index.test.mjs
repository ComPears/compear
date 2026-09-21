import { describe, expect, it, vi } from 'vitest';
import { fetchSeoIndex } from './fetch-seo-index.mjs';

const page = (items, offset, total) => new Response(JSON.stringify(items), {
  headers: { 'X-Result-Offset': String(offset), 'X-Total-Count': String(total) },
});

describe('SEO pagination', () => {
  it('fetches sequential pages without losing comparison groups', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(page([{ slug: 'a' }, { slug: 'b' }], 0, 3))
      .mockResolvedValueOnce(page([{ slug: 'c' }], 2, 3));
    expect(await fetchSeoIndex('https://api.example', 'nl', fetcher)).toEqual([{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }]);
    expect(fetcher.mock.calls[1][0].searchParams.get('offset')).toBe('2');
    expect(fetcher.mock.calls[0][0].searchParams.get('limit')).toBe('250');
    expect(fetcher.mock.calls[0][1].signal).toBeDefined();
  });
  it('accepts one unpaginated response from an older backend', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ slug: 'old' }])));
    expect(await fetchSeoIndex('https://api.example', 'uk', fetcher)).toEqual([{ slug: 'old' }]);
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it('stops on a failed request or stalled pagination', async () => {
    await expect(fetchSeoIndex('https://api.example', 'nl', async () => new Response('', { status: 503 }))).rejects.toThrow('503');
    await expect(fetchSeoIndex('https://api.example', 'nl', async () => page([], 0, 10))).rejects.toThrow('no progress');
  });
  it('rejects malformed pagination metadata and non-array responses', async () => {
    await expect(fetchSeoIndex('https://api.example', 'nl', async () => page([], 5, 10))).rejects.toThrow('metadata');
    await expect(fetchSeoIndex('https://api.example', 'nl', async () => page({}, 0, 0))).rejects.toThrow('array');
  });
});
