import { defineConfig } from 'vitest/config';
export default defineConfig({
	test: {
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			include: ['nodes/**/*.ts', 'credentials/**/*.ts'],
			exclude: ['**/*.test.ts', '**/test/**', '**/tests/**'],
		},
	},
});
