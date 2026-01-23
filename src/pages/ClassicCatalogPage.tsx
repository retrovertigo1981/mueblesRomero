import { Helmet } from 'react-helmet-async';
import { useLoaderData } from 'react-router-dom';
import { ProductGrid } from '@/components/ProductGrid';
import type { CleanProduct } from '@/types';

interface LoaderData {
	products: CleanProduct[];
}

const ClassicCatalogPage = () => {
	const { products } = useLoaderData() as LoaderData;
	return (
		<>
			<Helmet>
				<title>Catálogo de Muebles Tradicionales | Muebles El Romero</title>
				<meta
					name='description'
					content='Explora nuestro catálogo completo de muebles tradicionales. Muebles de calidad fabricados en Santiago, Chile con diseños clásicos y modernos.'
				/>
				<meta
					name='keywords'
					content='catálogo muebles, muebles tradicionales, muebles santiago, muebles calidad'
				/>
				<link
					rel='canonical'
					href='https://muebleselromero.cl/catalogo-clasico'
				/>
			</Helmet>
			<div className='min-h-screen'>
				<ProductGrid products={products} />
			</div>
		</>
	);
};

export default ClassicCatalogPage;
