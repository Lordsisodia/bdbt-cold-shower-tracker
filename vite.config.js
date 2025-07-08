import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/components': resolve(__dirname, './src/components'),
            '@/hooks': resolve(__dirname, './src/hooks'),
            '@/utils': resolve(__dirname, './src/utils'),
            '@/types': resolve(__dirname, './src/types'),
            '@/lib': resolve(__dirname, './src/lib'),
        },
    },
    server: {
        port: 8081,
        host: true,
    },
});
