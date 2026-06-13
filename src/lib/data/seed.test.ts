import { afterEach, describe, expect, it } from 'vitest';
import { LocalRepo } from './local-repo';
import { seedDemoData } from './seed';
import { detectCrisis } from '@/lib/crisis/detector';

afterEach(() => window.localStorage.clear());

describe('seedDemoData', () => {
  it('seeds an 8-day demo journal only once', async () => {
    const repo = new LocalRepo();
    const count = await seedDemoData(repo);
    expect(count).toBe(8);
    expect(await repo.listEntries()).toHaveLength(8);

    const second = await seedDemoData(repo);
    expect(second).toBe(0);
  });

  it('embeds the "night before mock test" stress pattern for the demo', async () => {
    const repo = new LocalRepo();
    await seedDemoData(repo);
    const entries = await repo.listEntries();
    const distressed = entries.filter((e) => detectCrisis(e.body).level !== 'none');
    expect(distressed.length).toBeGreaterThanOrEqual(2);
  });
});
