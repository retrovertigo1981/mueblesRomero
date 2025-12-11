// --- Interfaces ---

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

export interface CleanProductDetail extends CleanProduct {
  details: string;
  description: string;
  dimensions: string;
  material: string;
  color: string;
  warranty: string;
}

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
