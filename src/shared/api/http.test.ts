import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
vi.mock('./axios', () => ({ api: { get: (...args: unknown[]) => get(...args) } }));
import { http } from './http';

describe('large paginated requests', () => {
  beforeEach(() => get.mockReset());
  it('collects server pages while preserving filters', async () => {
    get.mockResolvedValueOnce({
      data: { count: 3, next: 'next', previous: null, results: [1, 2] },
    });
    get.mockResolvedValueOnce({
      data: { count: 3, next: null, previous: 'previous', results: [3] },
    });
    const result = await http.list<number>('/students/', {
      page: 1,
      page_size: 200,
      status: 'active',
    });
    expect(result.results).toEqual([1, 2, 3]);
    expect(result.count).toBe(3);
    expect(get).toHaveBeenNthCalledWith(2, '/students/', {
      params: { page: 2, page_size: 100, status: 'active' },
    });
  });
  it('uses the normal endpoint for standard pages', async () => {
    get.mockResolvedValueOnce({ data: { count: 0, next: null, previous: null, results: [] } });
    await http.list('/students/', { page: 2, page_size: 20 });
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/students/', { params: { page: 2, page_size: 20 } });
  });
});
