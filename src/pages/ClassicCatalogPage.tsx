import { useLoaderData } from 'react-router-dom';
import { ProductGrid } from '@/components/ProductGrid';
import type { CleanProduct } from '@/types';

interface LoaderData {
	products: CleanProduct[];
}

const ClassicCatalogPage = () => {
	const { products } = useLoaderData() as LoaderData;
	return (
		<div className='min-h-screen'>
			<ProductGrid products={products} />
		</div>
	);
};

export default ClassicCatalogPage;
