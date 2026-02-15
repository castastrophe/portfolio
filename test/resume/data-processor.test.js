import { beforeEach, describe, it, expect } from 'vitest';
import DataProcessor from '../../pages/resume/data-processor.js';
import formatter from '../../pages/resume/formatter.js';

/**
 * @vitest-environment happy-dom
 * This test validates the DataProcessor class to ensure it correctly replaces the appropriate fields in the document.
 */
describe('DataProcessor', () => {
	beforeEach(() => {
		window.formatter = formatter;
	});

	describe('processorType', () => {
		it('returns a callable handler for string, number, boolean', () => {
			const dp = new DataProcessor();
			const fn = dp.processorType('x');
			expect(typeof fn).toBe('function');
			document.body.innerHTML = '<span data-replace-key="k">old</span>';
			fn(document.body, 'k', 'new');
			expect(document.querySelector('[data-replace-key="k"]').textContent).toBe('new');
		});

		it('returns a callable handler for arrays', () => {
			const dp = new DataProcessor();
			const fn = dp.processorType([]);
			expect(typeof fn).toBe('function');
		});

		it('returns a callable handler for plain objects', () => {
			const dp = new DataProcessor();
			const fn = dp.processorType({ a: 1 });
			expect(typeof fn).toBe('function');
		});
	});

	describe('simple (data replacement)', () => {
		it('replaces innerHTML when element with data-replace-key exists', () => {
			document.body.innerHTML = '<div data-replace-key="about">Original</div>';
			const dp = new DataProcessor();
			dp.simple(document, 'about', 'Replaced text');
			const el = document.querySelector('[data-replace-key="about"]');
			expect(el).toBeTruthy();
			expect(el.textContent).toBe('Replaced text');
		});

		it('does nothing when no element has the key', () => {
			document.body.innerHTML = '<div data-replace-key="other">Keep</div>';
			const dp = new DataProcessor();
			dp.simple(document, 'about', 'Replaced');
			expect(document.querySelector('[data-replace-key="other"]').textContent).toBe('Keep');
		});

		it('removes element when value is false', () => {
			document.body.innerHTML = '<div data-replace-key="optional">Remove me</div>';
			const dp = new DataProcessor();
			dp.simple(document, 'optional', false);
			expect(document.querySelector('[data-replace-key="optional"]')).toBeNull();
		});
	});

	describe('array (list replacement)', () => {
		it('replaces container with one row per array item when items have data-replace-key', () => {
			document.body.innerHTML = `
				<ul data-replace-key="items">
					<li data-template><span data-target data-replace-key="items">placeholder</span></li>
				</ul>
			`;
			const dp = new DataProcessor();
			dp.array(document, 'items', ['First', 'Second', 'Third']);
			const container = document.querySelector('[data-replace-key="items"]');
			// Processor appends the inner [data-target] (span) per item, so container has 3 span children
			expect(container.children.length).toBe(3);
			expect(container.children[0].textContent.trim()).toBe('First');
			expect(container.children[1].textContent.trim()).toBe('Second');
			expect(container.children[2].textContent.trim()).toBe('Third');
		});
	});

	describe('object (keyed replacement)', () => {
		it('replaces container content with updated elements for each subKey', () => {
			document.body.innerHTML = `
				<div data-replace-key="profile">
					<span data-replace-key="name">Old Name</span>
					<span data-replace-key="role">Old Role</span>
				</div>
			`;
			const dp = new DataProcessor();
			dp.object(document, 'profile', { name: 'Jane', role: 'Engineer' });
			const container = document.querySelector('[data-replace-key="profile"]');
			expect(container).toBeTruthy();
			const nameEl = container.querySelector('[data-replace-key="name"]');
			const roleEl = container.querySelector('[data-replace-key="role"]');
			expect(nameEl?.textContent).toBe('Jane');
			expect(roleEl?.textContent).toBe('Engineer');
		});
	});

	describe('full payload (renderPage-style)', () => {
		it('correctly replaces simple and array data from a JSON-like payload', () => {
			document.body.innerHTML = `
				<div data-replace-key="about">Default about</div>
				<ul data-replace-key="skills">
					<li data-template><span data-target data-replace-key="skills">skill</span></li>
				</ul>
			`;
			const data = {
				about: 'Staff Engineer with 10+ years experience.',
				skills: ['TypeScript', 'Design systems', 'Accessibility'],
			};
			const dp = new DataProcessor();
			for (const [key, value] of Object.entries(data)) {
				const processor = dp.processorType(value);
				if (typeof processor === 'function') processor(document, key, value);
			}
			expect(document.querySelector('[data-replace-key="about"]').textContent).toBe(
				'Staff Engineer with 10+ years experience.',
			);
			const container = document.querySelector('ul[data-replace-key="skills"]');
			expect(container.children.length).toBe(3);
			expect(container.children[0].textContent.trim()).toBe('TypeScript');
			expect(container.children[1].textContent.trim()).toBe('Design systems');
			expect(container.children[2].textContent.trim()).toBe('Accessibility');
		});
	});
});
