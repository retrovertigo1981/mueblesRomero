import Konva from 'konva';

/**
 * Optimiza el canvas de Konva para enviar por email (EmailJS tiene límite de 200KB)
 * @param stage - Referencia al Stage de Konva
 * @param options - Opciones de optimización
 * @returns Data URL de la imagen optimizada (ej: data:image/jpeg;base64,...)
 */
export const optimizeCanvasImage = (
  stage: Konva.Stage | null | undefined,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'webp';
  } = {}
): string => {
  // Valores por defecto optimizados para EmailJS (< 190KB)
  const {
    maxWidth = 200,      // Reducido de 400 a 350 para mejor compresión
    maxHeight = 200,
    quality = 0.6,       // Reducido de 0.7 a 0.6 (calidad media-alta)
    format = 'jpeg'      // JPEG es más compatible y ligero que WebP para emails
  } = options;

  // ✅ VALIDACIÓN: Si no hay stage, devolver string vacío para evitar errores
  if (!stage) {
    console.warn('optimizeCanvasImage: Stage no disponible');
    return '';
  }

  // Calcular escala de reducción manteniendo aspect ratio
  const originalWidth = stage.width();
  const originalHeight = stage.height();
  
  // Si el canvas es muy pequeño, usar escala 1 para no perder calidad innecesariamente
  const scale = Math.min(
    maxWidth / originalWidth,
    maxHeight / originalHeight,
    1 // No escalar hacia arriba
  );

  // 🔥 GENERAR IMAGEN OPTIMIZADA
  const dataURL = stage.toDataURL({
    mimeType: `image/${format}`,
    quality: quality,
    pixelRatio: scale, // Reduce resolución proporcionalmente
  });

  // 📊 DEBUG: Descomentar para ver tamaño
  // const sizeInKB = Math.round(dataURL.length / 1024);
  // console.log(`📊 Imagen optimizada generada: ${sizeInKB} KB`);

  return dataURL;
};


// import Konva from 'konva';

// export const optimizeCanvasImage = (
//   stage: Konva.Stage,
//   options: {
//     maxWidth?: number;
//     maxHeight?: number;
//     quality?: number;
//     format?: 'jpeg' | 'webp';
//   } = {}
// ): string => {
//   const {
//     maxWidth = 400,      // Thumbnail size para email
//     maxHeight = 400,
//     quality = 0.7,       // Balance calidad/tamaño
//     format = 'jpeg'      // JPEG es más compatible con emails
//   } = options;

//   // Calcular escala para el thumbnail
//   const originalWidth = stage.width();
//   const originalHeight = stage.height();
//   const scale = Math.min(
//     maxWidth / originalWidth,
//     maxHeight / originalHeight
//   );

//   // Generar imagen optimizada
//   const dataURL = stage.toDataURL({
//     mimeType: `image/${format}`,
//     quality: quality,
//     pixelRatio: scale, // Reduce resolución
//   });

//   return dataURL;
// };