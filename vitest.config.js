import { defineConfig } from 'vitest/config';

/** @type {import('vitest').UserConfig} */
export default defineConfig({
	test: {
		environment: 'happy-dom',
		include: ['test/**/*.test.js'],
		setupFiles: ['./test/setup.js'],
	},
});
