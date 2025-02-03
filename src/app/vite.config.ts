import { defineConfig } from 'vite';
// import { defineConfig as defineVitestConfig } from 'vitest';

export default defineConfig({
  test: {
    environment: 'jsdom', // Add this line
  },
});
