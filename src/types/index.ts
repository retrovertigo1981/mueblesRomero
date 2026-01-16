// // --- Interfaces ---

// interface IProductAcfBase {
//   price: string;
//   category: string;
//   image: string;
// }

// export interface ProductApi {
//   id: number;
//   title: {
//     rendered: string;
//   };
//   acf: IProductAcfBase;
// }

// interface IProductAcfDetail extends IProductAcfBase {
//   description: string;
//   dimensions: string;
//   material: string;
//   color: string;
//   warranty: string;
// }

// export interface ProductDetailApi extends ProductApi {
//   acf: IProductAcfDetail;
// }

// export interface CleanProduct {
//   id: number;
//   title: string;
//   price: string;
//   category: string;
//   image: string;
// }

// export interface CleanProductDetail extends CleanProduct {
//   details: string;
//   description: string;
//   dimensions: string;
//   material: string;
//   color: string;
//   warranty: string;
// }

// export const cleanDataSingleProduct = (
//   item: ProductDetailApi
// ): CleanProductDetail => {
//   return {
//     id: item.id,
//     title: item.title.rendered,
//     price: item.acf.price,
//     category: item.acf.category,
//     image: item.acf.image,
//     description: item.acf.description,
//     dimensions: item.acf.dimensions,
//     material: item.acf.material,
//     color: item.acf.color,
//     warranty: item.acf.warranty,
//   };
// };

// export const cleanDataProducts = (dataApi: ProductApi[]): CleanProduct[] => {
//   return dataApi.map((item) => ({
//     id: item.id,
//     title: item.title.rendered,
//     price: item.acf.price,
//     category: item.acf.category,
//     image: item.acf.image,
//   }));
// };

// --- Interfaces Base (sin cambios) ---

interface IProductAcfBase {
  price: string;
  category: string;
  image: string;
}

export interface ProductApi {
  id: number;
  title: {
    rendered: string;
  };
  acf: IProductAcfBase;
}

interface IProductAcfDetail extends IProductAcfBase {
  description: string;
  dimensions: string;
  material: string;
  color: string;
  warranty: string;
}

export interface ProductDetailApi extends ProductApi {
  acf: IProductAcfDetail;
}

export interface CleanProduct {
  id: number;
  title: string;
  price: string;
  category: string;
  image: string;
}

// --- 🔥 INTERFACE ACTUALIZADA ---
// Agrega campos opcionales para productos personalizados

export interface CustomizationConfig {
  muebleId: string;
  nombreMueble: string;
  colorTela: {
    id: string;
    nombre: string;
    hex: string;
  };
  colorMadera: {
    id: string;
    nombre: string;
    hex: string;
  };
  colorSuperficie: {
    id: string;
    nombre: string;
    hex: string;
  };
}

export interface CleanProductDetail extends CleanProduct {
  details?: string; // ← Ya era opcional (usa ?)
  description: string;
  dimensions: string;
  material: string;
  color: string;
  warranty: string;
  
  // 🔥 NUEVOS CAMPOS OPCIONALES para catálogo interactivo
  isCustomized?: boolean;
  customizationConfig?: CustomizationConfig;
}

// --- Funciones de limpieza (sin cambios) ---

export const cleanDataSingleProduct = (
  item: ProductDetailApi
): CleanProductDetail => {
  return {
    id: item.id,
    title: item.title.rendered,
    price: item.acf.price,
    category: item.acf.category,
    image: item.acf.image,
    description: item.acf.description,
    dimensions: item.acf.dimensions,
    material: item.acf.material,
    color: item.acf.color,
    warranty: item.acf.warranty,
    // isCustomized e customizationConfig no se incluyen aquí
    // porque vienen del catálogo clásico (API)
  };
};

export const cleanDataProducts = (dataApi: ProductApi[]): CleanProduct[] => {
  return dataApi.map((item) => ({
    id: item.id,
    title: item.title.rendered,
    price: item.acf.price,
    category: item.acf.category,
    image: item.acf.image,
  }));
};