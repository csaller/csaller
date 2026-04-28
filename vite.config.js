import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        budget: resolve(__dirname, 'budget.html'),
        budgetPtbr: resolve(__dirname, 'budget-ptbr.html'),
      },
    },
  },
});
