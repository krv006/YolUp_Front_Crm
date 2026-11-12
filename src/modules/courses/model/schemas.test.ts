import { describe, expect, it } from 'vitest';
import { courseSchema } from './schemas';

describe('course API contract', () => {
  it('requires the course code, duration and lesson count', () => {
    const result = courseSchema.safeParse({
      name: 'English',
      code: '',
      price_som: 1000,
      is_active: true,
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(['code', 'duration_months', 'lessons_count'])
      );
  });
});
