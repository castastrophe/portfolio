import { beforeEach, describe, it, expect } from 'vitest';
import formatter from '../../pages/resume/formatter.js';

/**
 * @vitest-environment happy-dom
 * Tests for resume formatter helpers (clean, date, raw).
 */
describe('formatter', () => {
	describe('clean', () => {
		it('trims whitespace and wraps in a single paragraph', () => {
			expect(formatter.clean('  Hello world  ')).toBe('<p>Hello world</p>');
		});

		it('replaces single newlines with spaces within a paragraph', () => {
			expect(formatter.clean('Line one\nLine two')).toBe('<p>Line one Line two</p>');
		});

		it('splits on double newlines into separate paragraphs', () => {
			expect(formatter.clean('First para\n\nSecond para')).toBe(
				'<p>First para</p><p>Second para</p>',
			);
		});

		it('handles empty string as single empty paragraph', () => {
			expect(formatter.clean('')).toBe('<p></p>');
		});
	});

	describe('date', () => {
		it('returns empty string for falsy value', () => {
			expect(formatter.date('')).toBe('');
			expect(formatter.date(null)).toBe('');
			expect(formatter.date(undefined)).toBe('');
		});

		it('returns unprocessed string when value is not a date', () => {
			expect(formatter.date('present')).toBe('present');
			expect(formatter.date('Present')).toBe('Present');
			expect(formatter.date('PRESENT')).toBe('PRESENT');
		});

		it('formats a date string as long month and year', () => {
			// Use full ISO date so parsing is timezone-stable
			const result = formatter.date('2024-06-15');
			expect(result).toBe('June 2024');
		});

		it('respects document lang when formatting', () => {
			const result = formatter.date('2024-06-15', { lang: 'de-DE' });
			expect(result).toBe('Juni 2024');
		});
	});

	describe('raw', () => {
		it('returns trimmed string for non-empty value', () => {
			expect(formatter.raw('  text  ')).toBe('text');
			expect(formatter.raw('no trim')).toBe('no trim');
		});

		it('returns empty string for null or undefined', () => {
			expect(formatter.raw(null)).toBe('');
			expect(formatter.raw(undefined)).toBe('');
		});

		it('converts numbers to string', () => {
			expect(formatter.raw(42)).toBe('42');
		});
	});
});
