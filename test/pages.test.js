/**
 * Accessibility tests for all built HTML pages in /public.
 *
 * Uses axe-core (https://github.com/dequelabs/axe-core) injected into a
 * happy-dom Window to evaluate every page against WCAG 2.1 AA + best
 * practice rules.
 *
 * Each page gets its own describe block. Within each page, violations are
 * grouped by impact level (critical → serious → moderate → minor) and each
 * violation is its own test() so failures are individually visible in output.
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

import { readFileSync } from 'node:fs';
import { parse } from 'node:path';

import { describe, assert, test, expect } from 'vitest';
import { Window } from 'happy-dom';

import { AXE_SOURCE, RUN_ONLY, DISABLED_RULES } from './setup.js';
import { PUBLIC_DIR, collectHtmlFiles, sanitizeForParsing } from './utils.js';

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
		'',
		`  [${impact}] ${violation.id}`,
		`  Description : ${violation.description}`,
		`  Element     : ${node.html.trim()}`,
		`  Fix         : ${(node.failureSummary || '').split('\n').map(l => l.trim()).filter(Boolean).join(' | ')}`,
		`  More info   : ${violation.helpUrl}`,
		'',
	].join('\n');
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

describe('validate', () => {
	const htmlFiles = collectHtmlFiles();

	test('built HTML files', () => {
		expect(htmlFiles?.length, `No HTML files found in ${PUBLIC_DIR}. Be sure to run \`yarn build\` before running tests.`).toBeGreaterThan(0);
	});

	describe.concurrent.each(htmlFiles.map(f => {
		const publishDir = 'public/';
		const fileObj = parse(f);
		let label = fileObj.dir.slice(f.indexOf(publishDir) + publishDir.length);
		if (fileObj.name !== 'index') label += '?variant=' + fileObj.name;
		return [f, '/' + label];
	}))('$1', async (filePath) => {
		describe('should be accessible', async () => {
			const results = await auditPage(filePath).catch((error) => {
				assert.fail(error?.message ?? error);
			});

			if (results?.violations?.length === 0) {
				test('no violations', () => {
					expect(results.violations).toHaveLength(0);
				});
			} else {
				for (const violation of results.violations) {
					test.each(violation.nodes)(`[$impact] ${violation.id}`, (node) => {
						expect.fail(formatViolation(violation, node));
					});
				}
			}
		});
	});
});
