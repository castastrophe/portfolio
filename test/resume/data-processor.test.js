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
		document.body.innerHTML = '';
	});

	describe('getProcessor', () => {
		it('returns a callable handler for string', () => {
			const dp = new DataProcessor({});
			const fn = dp.getProcessor('x');
			expect(typeof fn).toBe('function');
		});

		it('returns a callable handler for number', () => {
			const dp = new DataProcessor({});
			const fn = dp.getProcessor(100);
			expect(typeof fn).toBe('function');
		});

		it('returns a callable handler for boolean', () => {
			const dp = new DataProcessor({});
			const fn = dp.getProcessor(true);
			expect(typeof fn).toBe('function');
			expect(fn.name).toContain('simple');
		});

		it('returns a callable handler for arrays', () => {
			const dp = new DataProcessor({});
			const fn = dp.getProcessor([]);
			expect(typeof fn).toBe('function');
			expect(fn.name).toContain('array');
		});

		it('returns a callable handler for plain objects', () => {
			const dp = new DataProcessor({});
			const fn = dp.getProcessor({ a: 1 });
			expect(typeof fn).toBe('function');
			expect(fn.name).toContain('object');
		});
	});

	describe('simple (data refresh)', () => {
		it('replaces innerHTML when element with data-replace-key exists', () => {
			document.body.innerHTML = '<div data-replace-key="about">Original</div>';

			const data = { about: 'Replaced text' };
			const dp = new DataProcessor(data);

			const el = document.querySelector('[data-replace-key="about"]');
			expect(el).toBeTruthy();
			expect(el.textContent).toBe(data.about);
		});

		it('does nothing when no element has the key', () => {
			document.body.innerHTML = '<div data-replace-key="other">Keep</div>';

			const data = { about: 'Replaced' };
			const dp = new DataProcessor(data);

			const el = document.querySelector('[data-replace-key="other"]');
			expect(el).toBeTruthy();
			expect(el.textContent).toBe('Keep');
		});

		it('removes element content when boolean value is false', () => {
			document.body.innerHTML = '<div data-replace-key="optional">Remove me</div>';

			const data = { optional: false };
			const dp = new DataProcessor(data);
			
			const el = document.querySelector('[data-replace-key="optional"]');
			expect(el.textContent).toBe('');
		});

		it('replaces all elements with the same data-replace-key', () => {
			document.body.innerHTML = `
				<span data-replace-key="name">A</span>
				<p><span data-replace-key="name">B</span></p>
				<footer><span data-replace-key="name">C</span></footer>
			`;

			const data = { name: 'Same everywhere' };
			const dp = new DataProcessor(data);
			
			const all = document.querySelectorAll('[data-replace-key="name"]');
			expect(all.length).toBe(3);
			all.forEach((el) => expect(el.textContent).toBe(data.name));
		});

		it('keeps existing content when new content empty', () => {
			document.body.innerHTML = '<div data-replace-key="about">Default text</div>';

			const data = {};
			const dp = new DataProcessor(data);

			const el = document.querySelector('[data-replace-key="about"]');
			expect(el).toBeTruthy();
			expect(el.textContent).toBe('Default text');
		});

		it('retains element content when forceKeep is off and new content empty', () => {
			document.body.innerHTML = '<div data-replace-key="about">Default text</div>';

			const data = {};
			const dp = new DataProcessor(data, { forceKeep: false });

			const el = document.querySelector('[data-replace-key="about"]');
			expect(el.textContent).toBe('Default text');
		});

		it('replaces content when forceKeep is off but new content is provided', () => {
			document.body.innerHTML = '<div data-replace-key="title">Original</div>';

			const data = { title: 'New title' };
			const dp = new DataProcessor(data, { forceKeep: false });

			const el = document.querySelector('[data-replace-key="title"]');
			expect(el).toBeTruthy();
			expect(el.textContent).toBe(data.title);
		});
	});

	describe('array (list replacement)', () => {
		it('replaces container with one row per array item when items have data-replace-key', () => {
			document.body.innerHTML = `
				<template id="item-template">
					<li data-type="raw"></li>
				</template>
				<ul data-replace-key="items" data-template="item-template">
					<li>placeholder</li>
				</ul>
			`;

			const data = { items: ['First', 'Second', 'Third'] };
			const dp = new DataProcessor(data);
			console.log(dp.logs);

			const container = document.querySelector('[data-replace-key="items"]');

			// Processor appends the inner [data-target] (span) per item, so container has 3 span children
			expect(container.children.length).toBe(3);
			expect(container.children[0].textContent.trim()).toBe('First');
			expect(container.children[1].textContent.trim()).toBe('Second');
			expect(container.children[2].textContent.trim()).toBe('Third');
		});

		it('keeps existing container content when shouldKeep true and array empty', () => {
			document.body.innerHTML = '<ul data-replace-key="items"><li>Existing item</li></ul>';
			const dp = new DataProcessor({});
			dp.array(document, 'items', [], true);
			const container = document.querySelector('[data-replace-key="items"]');
			expect(container.innerHTML).toContain('Existing item');
		});

		it('clears container when shouldKeep false and array empty', () => {
			document.body.innerHTML = '<ul data-replace-key="items"><li>Existing item</li></ul>';
			const dp = new DataProcessor({});
			dp.array(document, 'items', [], false);
			const container = document.querySelector('[data-replace-key="items"]');
			expect(container.innerHTML).toBe('');
		});

		it('replaces container when shouldKeep is false but array has items', () => {
			document.body.innerHTML = `
				<ul data-replace-key="items">
					<li data-template><span data-target data-replace-key="items">old</span></li>
				</ul>
			`;
			const dp = new DataProcessor({});
			dp.array(document, 'items', ['A', 'B'], false);
			const container = document.querySelector('[data-replace-key="items"]');
			expect(container.children.length).toBe(2);
			expect(container.children[0].textContent.trim()).toBe('A');
			expect(container.children[1].textContent.trim()).toBe('B');
		});

		it('replaces each row with object fields when array contains objects (e.g. experience)', () => {
			document.body.innerHTML = `
				<div data-replace-key="experience">
					<div class="job-item" data-target>
						<span data-replace-key="title">Title</span>
						<span data-replace-key="company">Company</span>
						<ul data-replace-key="highlights">
							<li data-target data-replace-key="highlights">highlight</li>
						</ul>
					</div>
				</div>
			`;
			const dp = new DataProcessor({});
			window.formatter = formatter;
			dp.array(document, 'experience', [
				{ title: 'Engineer', company: 'Acme', highlights: ['Built X', 'Shipped Y'] },
				{ title: 'Lead', company: 'Beta', highlights: ['Led Z'] },
			]);
			const container = document.querySelector('[data-replace-key="experience"]');
			expect(container.children.length).toBe(2);
			const first = container.children[0];
			const second = container.children[1];
			expect(first.querySelector('[data-replace-key="title"]')?.textContent).toBe('Engineer');
			expect(first.querySelector('[data-replace-key="company"]')?.textContent).toBe('Acme');
			expect(second.querySelector('[data-replace-key="title"]')?.textContent).toBe('Lead');
			expect(second.querySelector('[data-replace-key="company"]')?.textContent).toBe('Beta');
			const firstHighlights = first.querySelectorAll('[data-replace-key="highlights"]');
			expect(firstHighlights.length).toBeGreaterThanOrEqual(1);
			expect(first.querySelector('ul[data-replace-key="highlights"]')?.children.length).toBe(2);
			expect(second.querySelector('ul[data-replace-key="highlights"]')?.children.length).toBe(1);
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
			const dp = new DataProcessor({ profile: { name: 'Jane', role: 'Engineer' } });

			const container = document.querySelector('[data-replace-key="profile"]');
			expect(container).toBeTruthy();

			const nameEl = container.querySelector('[data-replace-key="name"]');
			const roleEl = container.querySelector('[data-replace-key="role"]');
			
			expect(nameEl?.textContent).toBe('Jane');
			expect(roleEl?.textContent).toBe('Engineer');
		});

		it('keeps existing container content when shouldKeep true and object empty', () => {
			document.body.innerHTML = `
				<div data-replace-key="profile">
					<span data-replace-key="name">Old Name</span>
				</div>
			`;
			const dp = new DataProcessor({});
			dp.object(document, 'profile', {}, true);
			const container = document.querySelector('[data-replace-key="profile"]');
			expect(container.innerHTML).toContain('Old Name');
		});

		it('clears container when shouldKeep false and object empty', () => {
			document.body.innerHTML = `
				<div data-replace-key="profile">
					<span data-replace-key="name">Old Name</span>
				</div>
			`;
			const dp = new DataProcessor({});
			dp.object(document, 'profile', {}, false);
			const container = document.querySelector('[data-replace-key="profile"]');
			expect(container.innerHTML).toBe('');
		});

		it('replaces container when shouldKeep is false but object has keys', () => {
			document.body.innerHTML = `
				<div data-replace-key="profile">
					<span data-replace-key="name">Old</span>
					<span data-replace-key="role">Old Role</span>
				</div>
			`;
			const dp = new DataProcessor({});
			dp.object(document, 'profile', { name: 'Bob', role: 'Designer' }, false);
			const container = document.querySelector('[data-replace-key="profile"]');
			expect(container.querySelector('[data-replace-key="name"]')?.textContent).toBe('Bob');
			expect(container.querySelector('[data-replace-key="role"]')?.textContent).toBe('Designer');
		});
	});

	describe('full payload (renderPage-style)', () => {
		it('correctly replaces simple and array data from a JSON-like payload', () => {
			document.body.innerHTML = `
				<div data-replace-key="about">Default about</div>
				<ul data-replace-key="skills">
					<li>skill</li>
				</ul>
			`;
			const data = {
				about: 'Staff Engineer with 10+ years experience.',
				skills: ['TypeScript', 'Design systems', 'Accessibility'],
			};

			const dp = new DataProcessor(data);
			expect(document.querySelector('[data-replace-key="about"]').textContent).toBe(
				data.about,
			);
			const container = document.querySelector('ul[data-replace-key="skills"]');
			expect(container.children.length).toBe(data.skills.length);
			data.skills.forEach((skill, index) => {
				expect(container.children[index].textContent.trim()).toBe(skill);
			});
		});
	});
});
