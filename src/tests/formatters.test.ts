import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  formatTime,
  getInitials,
  clamp,
} from '@/lib/utils/formatters';

describe('Formatters Utility', () => {
  it('formats NGN, GHS, USD, and GBP currencies correctly', () => {
    expect(formatCurrency(500000, 'NGN')).toContain('₦');
    expect(formatCurrency(500000, 'NGN')).toContain('500,000');
    expect(formatCurrency(12000, 'GHS')).toContain('GH₵');
    expect(formatCurrency(12000, 'GHS')).toContain('12,000');
    expect(formatCurrency(25000, 'USD')).toBe('$25,000');
    expect(formatCurrency(18000, 'GBP')).toBe('£18,000');
  });

  it('formats compact currencies for dashboard KPIs', () => {
    expect(formatCurrency(1500000, 'NGN', true)).toBe('₦1.5m');
    expect(formatCurrency(45000, 'GHS', true)).toBe('GH₵45k');
    expect(formatCurrency(2500000, 'USD', true)).toBe('$2.5m');
    expect(formatCurrency(85000, 'GBP', true)).toBe('£85k');
  });

  it('extracts initials cleanly from personal and business names', () => {
    expect(getInitials('Amina Yusuf')).toBe('AY');
    expect(getInitials('Bluehaven Health Finance')).toBe('BH');
    expect(getInitials('SingleName')).toBe('S');
  });

  it('clamps numbers within defined boundaries', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(45, 0, 100)).toBe(45);
  });

  it('formats dates consistently', () => {
    expect(formatDate('2026-03-15')).toContain('Mar');
    expect(formatShortDate('2026-03-15')).toContain('Mar');
  });

  it('formats time timestamps consistently for dates and ISO strings', () => {
    expect(formatTime(undefined)).toBe('—');
    expect(formatTime('invalid')).toBe('—');
    expect(formatTime('2026-03-15')).toMatch(/\d{2}:\d{2}\s(AM|PM)/);
    expect(formatTime('2026-03-15T14:30:00Z')).toMatch(/\d{2}:\d{2}\s(AM|PM)/);
  });
});
