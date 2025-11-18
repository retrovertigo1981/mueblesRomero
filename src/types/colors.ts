// fabric-colors.ts (o colors.ts)
export interface Colores {
  id: string;
  nombre: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
}

export const COLORES_TELA: Colores[] = [
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

export const COLORES_MADERA: Colores[] = [
  {
    id: 'natural',
    nombre: 'Natural',
    hex: '#FCDBB2',  // ← Pega aquí desde Affinity
    rgb: { r: 252, g: 219, b: 178 }  // ← Pega aquí desde Affinity
  },
  {
    id: 'vintage-blanco',
    nombre: 'Vintage Blanco',
    hex: '#F3E1CB',
    rgb: { r: 243, g: 225, b: 203 }
  },
  {
    id: 'miel-oscuro',
    nombre: 'Miel Oscuro',
    hex: '#C15320',
    rgb: { r: 193, g: 83, b: 32 }
  },
  {
    id: 'miel',
    nombre: 'Miel',
    hex: '#D2893C',
    rgb: { r: 210, g: 137, b: 60 }
  },
  {
    id: 'nogal-oscuro',
    nombre: 'Nogal Oscuro',
    hex: '#95250F',
    rgb: { r: 149, g: 37, b: 15 }
  },
  {
    id: 'nogal',
    nombre: 'Nogal',
    hex: '#A15120',
    rgb: { r: 161, g: 81, b: 32 }
  },
  {
    id: 'chocolate-oscuro',
    nombre: 'Chocolate Oscuro',
    hex: '#560F0D',
    rgb: { r: 86, g: 15, b: 13 }
  },
  {
    id: 'chocolate',
    nombre: 'Chocolate',
    hex: '#68210D',
    rgb: { r: 104, g: 33, b: 13 }
  },
  {
    id: 'negro',
    nombre: 'Negro',
    hex: '#1A150F',
    rgb: { r: 26, g: 21, b: 15 }
  },
  {
    id: 'blanco',
    nombre: 'Blanco',
    hex: '#EDDEE3',
    rgb: { r: 237, g: 222, b: 227 }
  }
  
];




