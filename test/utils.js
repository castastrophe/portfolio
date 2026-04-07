/**
 * Shared test utilities — pure JS, no Vitest API.
 *
 * Imported by both test files and bench files. Safe to use anywhere.
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname, parse, sep } from 'node:path';
import { URL } from 'node:url';

export const PUBLIC_DIR = join(new URL(import.meta.url)?.pathname, '../../public');

export const IGNORED_DIRS = [join(PUBLIC_DIR, 'preview')];

/**
 * Recursively collect all .html files under a directory.
 * @param {dir} [dir=PUBLIC_DIR]
 * @param {array} [types=['.html']]
 * @returns string[]
 **/
export function collectHtmlFiles(dir = PUBLIC_DIR, types = ['.html']) {
	if (!existsSync(dir)) return [];
	const results = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (IGNORED_DIRS.includes(full)) continue;
		if (statSync(full).isDirectory()) {
			results.push(...collectHtmlFiles(full));
		} else if (types.includes(extname(entry)) ) {
			results.push(full);
		}
	}

	return results;
}

/**
 * Sanitize HTML before handing it to happy-dom's parser.
 *
 * Two happy-dom limitations require pre-processing:
 *
 * 1. Inline <svg> elements — happy-dom's HTML parser enters SVG/XML mode on
 *    any <svg> tag and does not correctly return to HTML context afterwards,
 *    causing all subsequent elements (including <main>, headings, etc.) to be
 *    dropped from the DOM. SVG content is irrelevant to the a11y rules we test.
 *
 * 2. CSS-invalid element IDs — the markdown-it anchor plugin generates heading
 *    IDs from raw heading text, which can contain apostrophes, percent-encoded
 *    characters, and other chars invalid in CSS selectors (e.g. id="what's-the-
 *    harm%3F"). axe-core calls querySelectorAll with the raw ID value, which
 *    throws a SyntaxError in happy-dom. Replaced with hyphens before parsing.
 */
export function sanitizeForParsing(html) {
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
