import type { RouteObject, LoaderFunctionArgs } from 'react-router-dom';
import type React from 'react';
import { Layout } from '@/components/Layout';
import Index from '@/pages/Index';
import ClassicCatalogPage from '@/pages/ClassicCatalogPage';
import InteractiveCatalogPage from '@/pages/InteractiveCatalogPage';
import DetailProductPage from '@/pages/DetailProductPage';
import ContactPage from '@/pages/ContactPage';
import OrderFormPage from '@/pages/OrderFormPage';
import NotFound from '@/pages/NotFoundPage';
import type {
	CleanProduct,
	CleanProductDetail,
	ProductApi,
	ProductDetailApi,
} from '@/types';
import { cleanDataProducts, cleanDataSingleProduct } from '@/types';

type AppRoute = RouteObject & {
	path?: string;
	element: React.ReactNode;
	loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
	children?: AppRoute[];
};

const fetchProducts: () => Promise<CleanProduct[]> = async () => {
	const response = await fetch(import.meta.env.VITE_API_URL);
	if (!response.ok) {
		throw new Error(`Error al obtener los productos: ${response.status}`);
	}
	const rawData: ProductApi[] = await response.json();
	return cleanDataProducts(rawData);
};

const fetchProductById: (id: string) => Promise<CleanProductDetail> = async (
	id
) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/${id}`);
	if (!response.ok) {
		throw new Error('Error al cargar el producto');
	}
	const rawData: ProductDetailApi = await response.json();
	return cleanDataSingleProduct(rawData);
};

export const appRoutes: AppRoute[] = [
	{
		path: '/',
		element: <Layout />,
		children: [
			{
				index: true,
				element: <Index />,
			},
			{
				path: 'catalogo-clasico',
				element: <ClassicCatalogPage />,
				loader: async () => {
					try {
						const products = await fetchProducts();
						return { products };
					} catch (error) {
						if (error instanceof Error) {
							throw new Response('Error fetching products', { status: 500 });
						}
					}
				},
			},
			{
				path: 'producto/:id',
				element: <DetailProductPage />,
				loader: async (args: LoaderFunctionArgs) => {
					const { params } = args;
					const { id } = params;
					if (!id) {
						throw new Response('Producto no encontrado', { status: 404 });
					}
					try {
						const product = await fetchProductById(id);
						return { product };
					} catch (error) {
						if (error instanceof Error) {
							throw new Response('Error fetching product detail', {
								status: 500,
							});
						}
					}
				},
			},
			{
				path: 'catalogo-interactivo',
				element: <InteractiveCatalogPage />,
			},
			{
				path: 'contacto',
				element: <ContactPage />,
			},
			{
				path: 'order-form',
				element: <OrderFormPage />,
			},
			{
				path: '*',
				element: <NotFound />,
			},
		],
	},
];
