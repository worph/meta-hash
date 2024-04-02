import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        // Use ts-jest or esbuild to handle TypeScript files
        // Specify other configurations as needed
    },
});
