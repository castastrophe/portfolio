/**
 * Vitest setup file — runs once per worker before any test or bench file.
 * Wired via `setupFiles` in vitest.config.js.
 *
 * Exports axe-core configuration constants used by a11y.test.js.
 * perf.bench.js intentionally does not use axe and imports only from utils.js.
 *
 * Note: axe.configure() is NOT called here because it requires a live window
 * context. Each auditPage() call in a11y.test.js configures its own Window
 * instance using these exported constants.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * axe-core source, loaded once and injected into each happy-dom Window via
 * win.eval(). Reading at setup time avoids repeated disk I/O per test.
 */
export const AXE_SOURCE = readFileSync(
	resolve(import.meta.dirname, '../node_modules/axe-core/axe.js'),
	'utf8',
);

/**
 * WCAG 2.1 AA tags + axe best-practice rules.
 * Passed as the `runOnly` option to axe.run().
 */
export const RUN_ONLY = {
	type: 'tag',
	values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
};

/**
 * Rules disabled for happy-dom / jsdom compatibility.
 * - color-contrast: requires a real CSS cascade and computed styles.
 * - meta-viewport:  happy-dom does not process <meta name="viewport">.
 *
 * See: https://github.com/dequelabs/axe-core?tab=readme-ov-file#supported-environments
 */
export const DISABLED_RULES = [
	{ id: 'color-contrast', enabled: false },
	{ id: 'meta-viewport', enabled: false },
];
