import type { Course, Item } from '../types';
import { isRemainingItem } from '../types';

/**
 * Returns a deep copy of course where each RemainingItem whose id is a key in hyp
 * is replaced by a CompletedItem { id, name, score, max }.
 * Does not mutate the input. No grade math.
 */
export function applyHypotheticals(course: Course, hyp: Map<string, number>): Course {
  return {
    ...course,
    categories: course.categories.map(cat => ({
      ...cat,
      items: cat.items.map((item): Item => {
        if (isRemainingItem(item) && hyp.has(item.id)) {
          return {
            id: item.id,
            name: item.name,
            score: hyp.get(item.id)!,
            max: item.max ?? 100,
          };
        }
        return { ...item } as Item;
      }),
    })),
  };
}
