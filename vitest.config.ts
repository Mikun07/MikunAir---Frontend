import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    typecheck: { tsconfig: './tsconfig.test.json' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: [
        'src/shared/utils/**/*.ts',
        'src/shared/ui/Modal.tsx',
        'src/shared/ui/ErrorBoundary.tsx',
        'src/shared/ui/Select.tsx',
        'src/shared/ui/Tooltip.tsx',
        'src/shared/ui/Pagination.tsx',
        'src/shared/ui/ProgressBar.tsx',
        'src/shared/ui/Banner.tsx',
        'src/modules/auth/AuthContext.tsx',
        'src/modules/auth/ProtectedRoute.tsx',
        'src/modules/auth/AdminRoute.tsx',
        'src/modules/auth/LoginPage.tsx',
        'src/modules/auth/RegisterPage.tsx',
        'src/modules/search/SearchForm.tsx',
        'src/modules/search/FlightCard.tsx',
        'src/modules/booking/PassengerForm.tsx',
        'src/modules/booking/BookingFlow.tsx',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test-setup.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@modules': resolve(__dirname, 'src/modules'),
    },
  },
});
