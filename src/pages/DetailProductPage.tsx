import { Helmet } from 'react-helmet-async';
import { ProductDetail } from '@/components/ProductDetail';
import { useLoaderData } from 'react-router-dom';
import type { CleanProductDetail } from '@/types';

interface LoaderData {
	product: CleanProductDetail;
}

const DetailProductPage = () => {
	const { product } = useLoaderData() as LoaderData;
	return (
		<>
			<Helmet>
				<title>{product.title} | Muebles El Romero</title>
				<meta
					name='description'
					content={`${product.description} - ${product.title} de Muebles El Romero. Fabricado en Santiago, Chile.`}
				/>
				<meta
					name='keywords'
					content={`muebles ${product.title.toLowerCase()}, muebles santiago, muebles calidad`}
				/>
				<link
					rel='canonical'
					href={`https://muebleselromero.cl/producto/${product.id}`}
				/>
			</Helmet>
			<div className='min-h-screen'>
				<ProductDetail product={product} />
			</div>
		</>
	);
};

export default DetailProductPage;
