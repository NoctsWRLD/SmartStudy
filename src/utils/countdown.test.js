import { describe, expect, it } from 'vitest';
import { countdown, daysLabel } from './countdown';

const TODAY = '2026-10-21';

describe('countdown', () => {
  it('names today', () => {
    const result = countdown(TODAY, TODAY);
    expect(result.label).toBe('Danes');
    expect(result.urgent).toBe(true);
    expect(result.past).toBe(false);
  });

  it('names tomorrow', () => {
    expect(countdown('2026-10-22', TODAY).label).toBe('Jutri');
  });

  it('counts the days for anything further away', () => {
    const result = countdown('2026-10-28', TODAY);
    expect(result.label).toBe('Čez 7 dni');
    expect(result.days).toBe(7);
  });

  it('marks the week before as urgent', () => {
    expect(countdown('2026-10-28', TODAY).urgent).toBe(true);
    expect(countdown('2026-10-29', TODAY).urgent).toBe(false);
  });

  it('marks a past date as overdue', () => {
    const result = countdown('2026-10-18', TODAY);
    expect(result.past).toBe(true);
    expect(result.urgent).toBe(true);
    expect(result.label).toContain('Zamujeno');
  });
});

describe('daysLabel', () => {
  it('uses "dan" for one day and "dni" for the rest', () => {
    expect(daysLabel(0)).toBe('danes');
    expect(daysLabel(1)).toBe('dan');
    expect(daysLabel(2)).toBe('dni');
    expect(daysLabel(11)).toBe('dni');
  });
});
