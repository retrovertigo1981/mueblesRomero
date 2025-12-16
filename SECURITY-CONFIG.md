# Configuración de Seguridad para Producción - Muebles Romero

## 📋 Resumen de Configuraciones Implementadas

Esta configuración implementa optimizaciones completas de seguridad para producción en Hostinger, manteniendo compatibilidad con desarrollo local.

## 🔧 Configuraciones en vite.config.ts

### 1. **Headers de Seguridad**
- **Desarrollo**: Headers básicos para protección durante desarrollo
- **Producción**: Headers completos incluyendo HSTS, CSP y Permissions Policy

```typescript
// Headers para desarrollo
headers: {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

// Headers para producción (preview)
headers: {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': '...',
}
```

### 2. **Minificación y Tree-Shaking Optimizado**
- **Producción**: Minificación con esbuild
- **Tree-shaking**: Habilitado solo en producción
- **Manual chunks**: Separación de vendor y UI libraries

```typescript
build: {
  minify: isProduction ? 'esbuild' : false,
  treeShaking: isProduction,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/*'], // Todas las librerías UI
      },
    },
  },
}
```

### 3. **Source Maps Seguros**
- **Desarrollo**: Source maps habilitados para debugging
- **Producción**: Source maps deshabilitados y código fuente excluido

```typescript
build: {
  sourcemap: !isProduction,
  sourcemapExcludeSources: isProduction,
}
```

### 4. **CSP Headers Inline**
- **Política restrictiva**: Solo recursos propios permitidos
- **Excepciones controladas**: Para React y desarrollo

```typescript
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // React
  "style-src 'self' 'unsafe-inline'", // CSS inline
  "img-src 'self' data: https:", // Imágenes locales y externas
  "connect-src 'self' https:", // APIs
].join('; ');
```

### 5. **Compresión y Optimización de Assets**
- **Gzip/Brotli**: Compresión habilitada via .htaccess
- **Cache busting**: Hash en nombres de archivos
- **CSS Code Splitting**: Separación de CSS por chunks
- **Asset inlining**: Límite de 4KB para assets pequeños

```typescript
build: {
  cssCodeSplit: true,
  assetsInlineLimit: 4096,
  rollupOptions: {
    output: {
      assetFileNames: 'assets/[name]-[hash][extname]',
      chunkFileNames: 'js/[name]-[hash].js',
    },
  },
}
```

### 6. **Variables de Entorno Seguras**
- **Prefijo requerido**: Solo variables VITE_* disponibles en cliente
- **Constantes de entorno**: __DEV__ y __PROD__ definidas

```typescript
envPrefix: ['VITE_'],
define: {
  __DEV__: !isProduction,
  __PROD__: isProduction,
}
```

## 🌐 Configuraciones en public/.htaccess

### **Compresión**
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>
```

### **Cache Control**
```apache
# Assets estáticos (1 año)
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# HTML (1 hora)
<FilesMatch "\.(html|htm)$">
    Header set Cache-Control "public, max-age=3600, must-revalidate"
</FilesMatch>
```

### **SPA Routing**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 🚀 Comandos de Build

### **Desarrollo**
```bash
npm run dev
```

### **Producción**
```bash
npm run build
npm run preview  # Para probar el build localmente
```

### **Análisis de Bundle** (Opcional)
```bash
ANALYZE=true npm run build
# Genera dist/stats.html para análisis de tamaño
```

## 🔒 Variables de Entorno Requeridas

Crea un archivo `.env.production` para producción:

```env
# URLs de API
VITE_API_URL=https://api.mueblesromero.com
VITE_APP_URL=https://mueblesromero.com

# Configuración de Analytics (opcional)
VITE_GA_ID=GA_MEASUREMENT_ID

# Configuración de errores
VITE_SENTRY_DSN=your_sentry_dsn
```

## 📝 Notas de Seguridad

### **CSP Configuration**
- La configuración actual permite `unsafe-inline` para estilos debido a Tailwind CSS
- Para mayor seguridad, considera usar hashes de estilo si es posible

### **HSTS**
- Solo se aplica en producción con HTTPS
- Descomenta la redirección HTTPS en .htaccess si tienes SSL

### **File Access**
- Archivos sensibles (.env, logs, backups) están bloqueados
- Directorios sin index están protegidos

### **Performance**
- Assets estáticos tienen cache de 1 año
- HTML tiene cache de 1 hora con revalidación
- Compresión gzip habilitada para todos los archivos de texto

## 🛠️ Configuración Específica para Hostinger

### **Paso 1: Subir archivos**
1. Ejecuta `npm run build`
2. Sube el contenido de `dist/` a la carpeta `public_html/`

### **Paso 2: Configurar SSL**
1. Habilita SSL en tu panel de Hostinger
2. Descomenta las líneas de redirección HTTPS en `.htaccess`

### **Paso 3: Variables de entorno**
1. Configura las variables en el panel de Hostinger
2. O usa un servicio como Vercel/Netlify para manejo de env vars

### **Paso 4: Verificación**
1. Usa herramientas como SecurityHeaders.com para verificar headers
2. Prueba la compresión con GTmetrix
3. Verifica el CSP con CSP Evaluator

## 🔧 Mantenimiento

### **Actualizaciones regulares**
- Mantén las dependencias actualizadas
- Revisa los headers de seguridad periódicamente
- Actualiza la política CSP según sea necesario

### **Monitoreo**
- Configura logs de error personalizados
- Monitorea el rendimiento con herramientas como PageSpeed Insights
- Revisa los headers de seguridad regularmente

## 📞 Soporte

Para problemas específicos de configuración:
1. Revisa los logs de Hostinger
2. Verifica la configuración de headers con herramientas online
3. Prueba localmente con `npm run preview` antes de subir

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0