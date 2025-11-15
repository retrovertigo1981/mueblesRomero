// fabric-colors.ts (o colors.ts)
export interface ColorTela {
  id: string;
  nombre: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
}

export const COLORES_TELA: ColorTela[] = [
  {
    id: 'crudo',
    nombre: 'Crudo',
    hex: '#E2D3BE',  // ← Pega aquí desde Affinity
    rgb: { r: 220, g: 205, b: 184 }  // ← Pega aquí desde Affinity
  },
  {
    id: 'beige',
    nombre: 'Beige',
    hex: '#D0BCA1',
    rgb: { r: 208, g: 188, b: 161 }
  },
  {
    id: 'gris-plata',
    nombre: 'Gris Plata',
    hex: '#928A7D',
    rgb: { r: 146, g: 138, b: 125 }
  },
  {
    id: 'gris',
    nombre: 'Gris',
    hex: '#9FA5A3',
    rgb: { r: 159, g: 165, b: 163 }
  },
  {
    id: 'camel',
    nombre: 'Camel',
    hex: '#906739',
    rgb: { r: 144, g: 103, b: 57 }
  },
  {
    id: 'ocre',
    nombre: 'Ocre',
    hex: '#D88E37',
    rgb: { r: 216, g: 142, b: 55 }
  },
  {
    id: 'marron',
    nombre: 'Marrón',
    hex: '#873720',
    rgb: { r: 135, g: 55, b: 32 }
  },
  {
    id: 'verde',
    nombre: 'Verde',
    hex: '#3E5646',
    rgb: { r: 62, g: 86, b: 70 }
  },
  {
    id: 'turquesa',
    nombre: 'Turquesa',
    hex: '#4C8F95',
    rgb: { r: 76, g: 143, b: 149 }
  },
  {
    id: 'azulino',
    nombre: 'Azulino',
    hex: '#306392',
    rgb: { r: 48, g: 99, b: 146 }
  },
  {
    id: 'rojo',
    nombre: 'Rojo',
    hex: '#B4172C',
    rgb: { r: 180, g: 23, b: 44 }
  },
  {
    id: 'chocolate',
    nombre: 'Chocolate',
    hex: '#4F4134',
    rgb: { r: 79, g: 65, b: 52 }
  },
  {
    id: 'gris-oscuro',
    nombre: 'Gris Oscuro',
    hex: '#5F5C55',
    rgb: { r: 95, g: 92, b: 85 }
  }
];


// ---

// ## **🎨 Proceso en Affinity (Detallado)**

// ### **Opción 1: Extracción Rápida (menos precisa)**
// ```
// 1. Abre imagen de paleta
// 2. Herramienta: Color Picker (I)
// 3. Para cada muestra:
//    a. Click en centro
//    b. Panel Color > Copia HEX
//    c. Anota RGB manualmente
// 4. Pega valores en el template
// ```

// **Tiempo:** ~5 minutos

// ---

// ### **Opción 2: Extracción Precisa (recomendada)**
// ```
// 1. Abre imagen de paleta
// 2. Para CADA color:
   
//    a. Selection Tool > Selecciona área de muestra (evita bordes)
//    b. Edit > Copy
//    c. File > New from Clipboard
//    d. Filters > Blur > Gaussian Blur: 50px
//       (Esto promedia todos los píxeles)
//    e. Color Picker (I) > Click en centro
//    f. Panel Color:
//       - Copia HEX: #C9B896
//       - Anota RGB: 201, 184, 150
//    g. Cierra sin guardar
   
// 3. Pega valores en template