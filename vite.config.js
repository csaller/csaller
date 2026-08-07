import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        internalBudget: resolve(__dirname, 'internal/budget.html'),
        internalBudgetPtbr: resolve(__dirname, 'internal/budget-ptbr.html'),
        internalQr: resolve(__dirname, 'internal/qr.html'),
      },
    },
  },
});
