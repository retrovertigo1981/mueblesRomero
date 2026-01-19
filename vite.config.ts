import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    // Configuración base del servidor
    server: {
      host: "::",
      port: 3000,
      strictPort: true,
      hmr: {
        port: 3001,
      },
      // Headers de seguridad para desarrollo
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },

    // Configuración de build optimizada para producción
    build: {
      target: 'es2020',
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction, // Solo en desarrollo
      sourcemapExcludeSources: isProduction, // Excluir código fuente en producción
      rollupOptions: {
        output: {
          // Hash en nombres de archivos para cache busting
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          // Configuración de manual chunks para mejor tree-shaking
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: [
              '@radix-ui/react-accordion', 
              '@radix-ui/react-dialog', 
              '@radix-ui/react-select',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-toast'
            ],
          },
        },
      },
      // Optimizaciones de compresión
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      // Configuración de chunks más pequeños
      chunkSizeWarningLimit: 1000,
    },

    // Configuración de plugins
    plugins: [
      react(),
    ],

    // Configuración de resolución
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Configuración de CSS
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/styles/variables.scss";`,
        },
      },
    },

    // Configuración de optimización
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
      ],
      exclude: [
        // Excluir dependencias que no necesitan pre-bundling
      ],
    },

    // Configuración de variables de entorno
    define: {
      // Asegurar que las variables estén definidas
      __DEV__: !isProduction,
      __PROD__: isProduction,
    },

    // Headers de seguridad para preview y build
    preview: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Para React y desarrollo
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https:",
          "media-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
        ].join('; '),
      },
    },

    // Configuración de servidor para desarrollo
    esbuild: {
      // Remover debugger y console.logs en producción
      drop: isProduction ? ['console', 'debugger'] : [],
      // Minificación de JSX
      jsx: 'automatic',
      // Configuración de tree-shaking
      treeShaking: isProduction,
    },

    // Configuración de Worker
    worker: {
      format: 'es',
    },

    // Configuración de JSON
    json: {
      namedExports: false,
      stringify: false,
    },

    // Configuración experimental para mejor performance
    experimental: {
      renderBuiltUrl(_filename, { hostType }) {
        if (hostType === 'js') {
          return { relative: true };
        } else {
          return { absolute: false };
        }
      },
    },

    // Configuración de seguridad adicional
    envPrefix: ['VITE_'], // Solo permitir variables VITE_* en el cliente
  };
});