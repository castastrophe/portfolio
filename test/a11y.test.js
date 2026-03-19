/**
 * Accessibility tests for all built HTML pages in /public.
 *
 * Uses axe-core (https://github.com/dequelabs/axe-core) injected into a
 * happy-dom Window to evaluate every page against WCAG 2.1 AA + best
 * practice rules.
 *
 * Each page gets its own describe block so failures are scoped clearly.
 * Within each page, violations are grouped by impact level (critical →
 * serious → moderate → minor) and each violation is its own it() so you
 * can see exactly which rule failed and on which element.
 *
 * Run:
 *   yarn test              # single run
 *   yarn test:watch        # watch mode
 *
 * Rules disabled for happy-dom compatibility:
 *   - color-contrast  (requires real CSS cascade / computed styles)
 *   - meta-viewport   (happy-dom doesn't process <meta> viewport)
 *
 * HTML pre-processing (see sanitizeForParsing):
 *   1. Inline <svg> elements are stripped — happy-dom's HTML parser enters
 *      SVG/XML mode on <svg> and never returns to HTML context, dropping all
 *      subsequent elements from the DOM.
 *   2. Element IDs with CSS-invalid characters are sanitized — the markdown-it
 *      anchor plugin can produce IDs like id="what's-the-harm%3F", which cause
 *      axe's internal querySelectorAll calls to throw in happy-dom.
 *   3. `iframes: false` is passed to axe.run() — happy-dom's postMessage-based
 *      frame communication throws when axe tries to inject into iframes.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { Window } from 'happy-dom';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PUBLIC_DIR = resolve(import.meta.dirname, '../public');
const IGNORED_DIRS = [join(PUBLIC_DIR, 'preview')];

const AXE_SOURCE = readFileSync(
    resolve(import.meta.dirname, '../node_modules/axe-core/axe.js'), 'utf8'
);

const RUN_ONLY = {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
};

/**
 * Rules that are incompatible with happy-dom / jsdom environments.
 * See: https://github.com/dequelabs/axe-core?tab=readme-ov-file#supported-environments
 */
const DISABLED_RULES = [
    { id: 'color-contrast', enabled: false },
    { id: 'meta-viewport', enabled: false },
];

/** Impact order for sorting (most severe first). */
const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively collect all .html files under a directory. */
function collectHtmlFiles(dir) {
	if (!existsSync(dir)) return [];

	const results = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (IGNORED_DIRS.includes(full)) continue;

		if (statSync(full).isDirectory()) {
			results.push(...collectHtmlFiles(full));
		} else if (entry.endsWith('.html')) {
			results.push(full);
		}
	}
	return results.sort();
}

/**
 * Sanitize HTML before handing it to happy-dom's parser.
 *
 * Two issues require pre-processing:
 *
 * 1. Inline <svg> elements: happy-dom's HTML parser enters SVG/XML mode on
 *    any <svg> tag and does not correctly return to HTML context afterwards,
 *    causing all subsequent elements (including <main>, headings, etc.) to be
 *    dropped from the DOM. SVG content is irrelevant to the a11y rules we
 *    test, so stripping is safe.
 *
 * 2. CSS-invalid element IDs: the markdown-it anchor plugin generates heading
 *    IDs from raw heading text, which can contain apostrophes, percent-encoded
 *    characters, and other chars that are invalid in CSS selectors (e.g.
 *    id="what's-the-harm%3F"). axe-core internally calls querySelectorAll with
 *    the raw ID value, which throws a SyntaxError in happy-dom. Replace any
 *    non-[a-zA-Z0-9_-] characters in IDs with hyphens before parsing.
 */
function sanitizeForParsing(html) {
	return html
		.replace(
			/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,
			'<!-- svg removed for a11y parsing -->',
		)
		.replace(/\bid="([^"]+)"/g, (match, id) => {
			const safe = id.replace(/[^a-zA-Z0-9_-]/g, '-');
			return safe === id ? match : `id="${safe}"`;
		});
}

/**
 * Parse an HTML file, inject axe-core, and run an accessibility audit.
 * Returns the raw axe Results object.
 */
async function auditPage(filePath) {
	const html = sanitizeForParsing(readFileSync(filePath, 'utf8'));
	const win = new Window({ url: 'http://localhost' });

	// Write the page HTML
	win.document.write(html);

	// Inject axe-core into the window so it attaches to win.axe
	win.eval(AXE_SOURCE);

	// Disable rules that don't work in happy-dom
	win.axe.configure({ rules: DISABLED_RULES });

	return win.axe.run(win.document, {
		runOnly: RUN_ONLY,
		// Prevent axe from trying to postMessage into iframes — happy-dom's frame
		// communication throws "Respondable target must be a frame in the current window".
		iframes: false,
	});
}

/**
 * Build a human-readable failure message for a single axe violation node.
 *
 * Example output:
 *   [critical] image-alt on <img src="photo.jpg">
 *   Description: Ensure <img> elements have alternative text
 *   Fix: Element does not have an alt attribute
 *   More info: https://dequeuniversity.com/rules/axe/4.11/image-alt
 */
function formatViolation(violation, node) {
	const impact = (violation.impact || 'unknown').toUpperCase();
	const lines = [
		``,
		`  [${impact}] ${violation.id}`,
		`  Description : ${violation.description}`,
		`  Element     : ${node.html.trim()}`,
		`  Fix         : ${(node.failureSummary || '').split('\n').map(l => l.trim()).filter(Boolean).join(' | ')}`,
		`  More info   : ${violation.helpUrl}`,
	];
	return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

const htmlFiles = collectHtmlFiles(PUBLIC_DIR);

if (htmlFiles.length === 0) {
	describe('Validating publish (public/)', () => {
		it('finds built HTML files', () => {
			expect.fail(
				`No HTML files found in ${PUBLIC_DIR}. ` +
				`Run \`yarn build\` before running tests.`,
			);
		});
	});
}

async function generateA11yTest(filePath) {
	// Label relative to project root for readable test names, e.g. "public/about/index.html"
	const label = filePath.replace(resolve(import.meta.dirname, '..') + '/', '');

	return describe(`a11y: ${label}`, async () => {
		// Audit once per page; vitest hoists the describe callback so this runs
		// before the it() calls are registered.
		const results = await auditPage(filePath);

		// Sort violations by severity so critical issues appear first
		const sorted = [...results.violations].sort(
			(a, b) =>
				(IMPACT_ORDER[a.impact] ?? 99) - (IMPACT_ORDER[b.impact] ?? 99),
		);

		if (sorted.length === 0) {
			// Explicitly pass so there's always at least one green test per page
			it('no violations', () => {
				expect(sorted).toHaveLength(0);
			});
		} else {
			// One it() per violation so each rule failure is individually visible
			for (const violation of sorted) {
				for (const node of violation.nodes) {
					const shortHtml = node.html.trim().slice(0, 80);
					const testName = `[${violation.impact}] ${violation.id} — ${shortHtml}`;

					it(testName, () => {
						const message =
							`\nAccessibility violation on ${label}:\n` +
							formatViolation(violation, node) +
							'\n';
						expect([], message).toHaveLength(violation.nodes.length); // always fails
					});
				}
			}
		}
	});
}

htmlFiles.forEach(generateA11yTest);
