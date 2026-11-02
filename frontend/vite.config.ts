import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: './', // Đường dẫn tương đối phục vụ triển khai tĩnh trong Tomcat WAR
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    modulePreload: {
      resolveDependencies: (_filename, deps, context) => {
        // Lọc bỏ hoàn toàn các chunk three, geo, form, và radix khỏi danh sách preload tự động ở Landing (hostType === 'html')
        return deps.filter(
          (dep) =>
            !dep.includes('three') &&
            !dep.includes('geo') &&
            !dep.includes('form-vendor') &&
            !dep.includes('radix-vendor')
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');

          // Đảm bảo vite preload-helper thuộc react-vendor thay vì bị rò rỉ vào three
          if (normalizedId.includes('vite/preload-helper')) {
            return 'react-vendor';
          }
          if (normalizedId.includes('/node_modules/')) {
            // 1. Cô lập toàn bộ hệ sinh thái đồ họa 3D Three.js (Lazy Load)
            if (
              normalizedId.includes('/node_modules/three/') ||
              normalizedId.includes('/node_modules/@react-three/') ||
              normalizedId.includes('/node_modules/postprocessing/') ||
              normalizedId.includes('/node_modules/maath/') ||
              normalizedId.includes('/node_modules/stats-gl/') ||
              normalizedId.includes('/node_modules/troika-three-text/')
            ) {
              return 'three';
            }
            // 2. Cô lập thư viện tính toán địa lý nếu có
            if (
              normalizedId.includes('/node_modules/d3-geo/') ||
              normalizedId.includes('/node_modules/topojson-client/') ||
              normalizedId.includes('/node_modules/world-atlas/')
            ) {
              return 'geo-vendor';
            }
            // 3. Cô lập thư viện Form & Validation (Tải theo route cần thiết)
            if (
              normalizedId.includes('/node_modules/react-hook-form/') ||
              normalizedId.includes('/node_modules/@hookform/') ||
              normalizedId.includes('/node_modules/zod/')
            ) {
              return 'form-vendor';
            }
            // 4. Cô lập Radix UI Primitives & thư viện phụ trợ (Tải theo component/route)
            if (
              normalizedId.includes('/node_modules/@radix-ui/') ||
              normalizedId.includes('/node_modules/@floating-ui/') ||
              normalizedId.includes('/node_modules/react-remove-scroll/') ||
              normalizedId.includes('/node_modules/react-remove-scroll-bar/') ||
              normalizedId.includes('/node_modules/react-style-singleton/')
            ) {
              return 'radix-vendor';
            }
            // 5. Cô lập thư viện nền tảng cốt lõi: React, React Router và TanStack Query
            if (
              normalizedId.includes('/node_modules/react/') ||
              normalizedId.includes('/node_modules/react-dom/') ||
              normalizedId.includes('/node_modules/scheduler/') ||
              normalizedId.includes('/node_modules/react-router/') ||
              normalizedId.includes('/node_modules/react-router-dom/') ||
              normalizedId.includes('/node_modules/@tanstack/')
            ) {
              return 'react-vendor';
            }
          }
        },
      },
    },
  },
});
