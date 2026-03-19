/**
 * Accessibility tests for all built HTML pages in /public.
 *
 * Uses axe-core (https://github.com/dequelabs/axe-core) injected into a
 * happy-dom Window to evaluate every page against WCAG 2.1 AA + best
 * practice rules.
 *
 * Each page gets its own describe block. Within each page, violations are
 * grouped by impact level (critical → serious → moderate → minor) and each
 * violation is its own it() so failures are individually visible in output.
 *
 * Run:
 *   yarn test              # single run
 *   yarn test:watch        # watch mode
 *
 * Shared utilities: test/utils.js
 * axe configuration:  test/setup.js (loaded automatically via vitest.config.js)
 *
 * Rules disabled for happy-dom compatibility:
 *   see DISABLED_RULES in test/setup.js
 *
 * HTML pre-processing (see sanitizeForParsing in test/utils.js):
 *   1. Inline <svg> elements are stripped — happy-dom's HTML parser enters
 *      SVG/XML mode on <svg> and never returns to HTML context, dropping all
 *      subsequent elements from the DOM.
 *   2. Element IDs with CSS-invalid characters are sanitized — the markdown-it
 *      anchor plugin can produce IDs like id="what's-the-harm%3F", which cause
 *      axe's internal querySelectorAll calls to throw in happy-dom.
 *   3. `iframes: false` is passed to axe.run() — happy-dom's postMessage-based
 *      frame communication throws when axe tries to inject into iframes.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, it, expect } from 'vitest';
import { Window } from 'happy-dom';

import { AXE_SOURCE, RUN_ONLY, DISABLED_RULES } from './setup.js';
import { PUBLIC_DIR, collectHtmlFiles, sanitizeForParsing } from './utils.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Impact order for sorting violations (most severe first). */
const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse an HTML file, inject axe-core, and run an accessibility audit.
 * Returns the raw axe Results object.
 */
async function auditPage(filePath) {
	const contents = readFileSync(filePath, 'utf-8');
	const html = sanitizeForParsing(contents);
	const win = new Window({ url: 'http://localhost' });

	win.document.write(html);
	win.eval(AXE_SOURCE);
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
 *   [CRITICAL] image-alt
 *   Description : Ensure <img> elements have alternative text
 *   Element     : <img src="photo.jpg">
 *   Fix         : Element does not have an alt attribute
 *   More info   : https://dequeuniversity.com/rules/axe/4.11/image-alt
 */
function formatViolation(violation, node) {
	const impact = (violation.impact || 'unknown').toUpperCase();
	return [
		``,
		`  [${impact}] ${violation.id}`,
		`  Description : ${violation.description}`,
		`  Element     : ${node.html.trim()}`,
		`  Fix         : ${(node.failureSummary || '').split('\n').map(l => l.trim()).filter(Boolean).join(' | ')}`,
		`  More info   : ${violation.helpUrl}`,
	].join('\n');
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

const htmlFiles = collectHtmlFiles();

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

for (const filePath of htmlFiles) {
	let label = filePath.replace(resolve(import.meta.dirname, '..') + '/', '')?.replace('public/', '')?.replace('/index.html', '');

	if (label === 'index.html') label = "home page";

	describe(`${label}`, async () => {
		it('validate accessibility', async () => {
			const results = await auditPage(filePath);

			// Yay! No violations!
			if (results?.violation?.length === 0) {
				expect(sorted, 'no violations').toHaveLength(0);
			}

			// Sort the results by impact
			const sorted = [...results.violations].sort(
				(a, b) => (IMPACT_ORDER[a.impact] ?? 99) - (IMPACT_ORDER[b.impact] ?? 99),
			);

			for (const violation of sorted) {
				for (const node of violation.nodes) {
					const shortHtml = node.html.trim().slice(0, 80);

					it(`[${violation.impact}] ${violation.id} — ${shortHtml}`, () => {
						const message =
							`\nAccessibility violation on ${label}:\n` +
							formatViolation(violation, node) +
							'\n';
						expect([], message).toHaveLength(violation.nodes.length);
					});
				}
			}
		});
	});
};
