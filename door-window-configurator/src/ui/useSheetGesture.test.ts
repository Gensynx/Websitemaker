import { describe, expect, it } from 'vitest';
import { nextSheetState } from './useSheetGesture';

describe('the phone sheet moves one resting state per drag', () => {
  it('up: closed -> half -> full, and stays full', () => {
    expect(nextSheetState('closed', 'up')).toBe('half');
    expect(nextSheetState('half', 'up')).toBe('full');
    expect(nextSheetState('full', 'up')).toBe('full');
  });
  it('down: full -> half -> closed, and stays closed', () => {
    expect(nextSheetState('full', 'down')).toBe('half');
    expect(nextSheetState('half', 'down')).toBe('closed');
    expect(nextSheetState('closed', 'down')).toBe('closed');
  });
});
