import { describe, expect, it } from 'vitest';
import { buildWeekRail, daysUntil, getWeekStart } from './rail';

const MONDAY = '2026-10-19';
const WEDNESDAY = '2026-10-21';

const tasks = [
  { id: '1', dueDate: MONDAY, completed: false },
  { id: '2', dueDate: MONDAY, completed: false },
  { id: '3', dueDate: MONDAY, completed: true },
  { id: '4', dueDate: WEDNESDAY, completed: false },
  { id: '5', dueDate: '2026-10-30', completed: false },
];

describe('getWeekStart', () => {
  it('returns the Monday of the week containing the date', () => {
    expect(getWeekStart(WEDNESDAY)).toBe(MONDAY);
    expect(getWeekStart(MONDAY)).toBe(MONDAY);
  });

  it('treats Sunday as the end of the week, not the start', () => {
    expect(getWeekStart('2026-10-25')).toBe(MONDAY);
  });
});

describe('buildWeekRail', () => {
  const rail = buildWeekRail(tasks, WEDNESDAY);

  it('always returns seven segments in week order', () => {
    expect(rail).toHaveLength(7);
    expect(rail[0].key).toBe(MONDAY);
    expect(rail[6].key).toBe('2026-10-25');
  });

  it('counts only open tasks on their due day', () => {
    expect(rail[0].count).toBe(2);
    expect(rail[2].count).toBe(1);
  });

  it('ignores tasks outside the week', () => {
    expect(rail.reduce((sum, segment) => sum + segment.count, 0)).toBe(3);
  });

  it('marks today', () => {
    expect(rail[2].today).toBe(true);
    expect(rail.filter((segment) => segment.today)).toHaveLength(1);
  });

  it('scales the fill against the heaviest day of the week', () => {
    expect(rail[0].value).toBe(1);
    expect(rail[2].value).toBe(0.5);
    expect(rail[4].value).toBe(0);
  });

  it('gives a readable description for every segment', () => {
    expect(rail[0].hint).toBe('Ponedeljek — 2 nalogi');
    expect(rail[2].hint).toBe('Sreda — 1 naloga');
    expect(rail[4].hint).toBe('Petek — brez nalog');
  });
  it('uses the warn tone for today and leaves empty days unfilled', () => {
    expect(rail[2].tone).toBe('warn');
    expect(rail[0].tone).toBe('accent');
    expect(rail[4].tone).toBe('empty');
  });

  it('survives an empty task list', () => {
    const empty = buildWeekRail([], WEDNESDAY);
    expect(empty).toHaveLength(7);
    expect(empty.every((segment) => segment.value === 0)).toBe(true);
  });
});

describe('daysUntil', () => {
  it('counts forward days', () => {
    expect(daysUntil('2026-10-25', WEDNESDAY)).toBe(4);
  });

  it('never returns a negative number for a past date', () => {
    expect(daysUntil('2026-10-01', WEDNESDAY)).toBe(0);
  });
});
