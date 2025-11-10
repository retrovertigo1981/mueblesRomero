import { ProductDetail } from '@/components/ProductDetail';
import { useLoaderData } from 'react-router-dom';
import type { CleanProductDetail } from '@/types';

interface LoaderData {
	product: CleanProductDetail;
}

const ClassicCatalogPage = () => {
	const { product } = useLoaderData() as LoaderData;
	return (
		<div className='min-h-screen'>
			<ProductDetail product={product} />
		</div>
	);
};

export default ClassicCatalogPage;
