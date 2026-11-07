import { describe, it, expect } from 'vitest';
import { sanitizeHex, calculateLuma, mixColors } from '@/lib/utils/theme';

describe('White-Label Theme Engine', () => {
  it('sanitizes hex color inputs', () => {
    expect(sanitizeHex('#1776ce')).toBe('#1776ce');
    expect(sanitizeHex('invalid')).toBe('#2583d9');
  });

  it('calculates perceived luminance correctly', () => {
    const whiteLuma = calculateLuma('#ffffff');
    const blackLuma = calculateLuma('#000000');
    expect(whiteLuma).toBeGreaterThan(0.9);
    expect(blackLuma).toBeLessThan(0.1);
  });

  it('mixes two colors by specified weight', () => {
    const mixed = mixColors('#000000', '#ffffff', 0.5);
    expect(mixed).toBe('#808080');
  });
});
