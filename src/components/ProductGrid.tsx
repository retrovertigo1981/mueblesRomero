import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductApi {
	id: number;
	title: {
		rendered: string;
	};
	acf: {
		price: string;
		category: string;
		image: string;
	};
}

interface CleanProduct {
	id: number;
	title: string;
	price: string;
	category: string;
	image: string;
}

const cleanDataProducts = (dataApi: ProductApi[]): CleanProduct[] => {
	return dataApi.map((item) => ({
		id: item.id,
		title: item.title.rendered,
		price: item.acf.price,
		category: item.acf.category,
		image: item.acf.image,
	}));
};

export const ProductGrid = () => {
	const [products, setProducts] = useState<CleanProduct[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const categories = ['Todos', 'Sala', 'Comedor', 'Oficina', 'Almacenamiento'];
	const navigate = useNavigate();

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					'http://localhost:8881/wp-json/wp/v2/productos'
				);
				if (!response.ok) {
					throw new Error(`Error al obtener los productos: ${response.status}`);
				}
				const rawData: ProductApi[] = await response.json();
				const cleanData = cleanDataProducts(rawData);
				setProducts(cleanData);
			} catch (err) {
				if (err instanceof Error) {
					setError('Error al cargar los productos.');
				}
			} finally {
				setLoading(false);
			}
		};
		fetchProducts();
	}, []);

	const filteredProducts =
		selectedCategory === 'Todos'
			? products
			: products.filter((p) => p.category === selectedCategory);

	if (loading) {
		return (
			<section id='catalogo-clasico' className='py-20 px-4 bg-background'>
				<div className='container mx-auto min-h-screen flex items-center justify-center'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4'></div>
						<p className='text-2xl font-semibold text-foreground'>
							Cargando productos...
						</p>
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section id='catalogo-clasico' className='py-20 px-4 bg-background'>
				<div className='container mx-auto min-h-screen flex items-center justify-center'>
					<div className='text-center'>
						<p className='text-2xl font-semibold text-destructive mb-4'>
							{error}
						</p>
						<Button onClick={() => window.location.reload()}>Reintentar</Button>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section id='catalogo-clasico' className='py-20 px-4 bg-background'>
			<div className='container mx-auto min-h-screen'>
				<div className='text-center mb-12'>
					<h2 className='text-4xl font-serif-display font-bold mb-4 text-foreground mt-8'>
						Catálogo Clásico
					</h2>
					<p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
						Explora nuestra colección de muebles cuidadosamente seleccionados
					</p>
				</div>

				<div className='flex justify-center gap-3 mb-12 flex-wrap'>
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? 'default' : 'outline'}
							onClick={() => setSelectedCategory(category)}
							className='transition-all'
						>
							{category}
						</Button>
					))}
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{filteredProducts.map((product) => (
						<Card
							key={product.id}
							className='group hover:shadow-hover transition-all duration-300 overflow-hidden border-border bg-gradient-card'
						>
							<CardContent className='p-0'>
								<div className='aspect-square bg-muted overflow-hidden'>
									<img
										src={product.image}
										alt={product.title}
										className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
									/>
								</div>
							</CardContent>
							<CardFooter className='flex flex-col items-start gap-3 p-6'>
								<div className='w-full'>
									<span className='text-xs text-muted-foreground uppercase tracking-wider'>
										{product.category}
									</span>
									<h3 className='text-lg font-semibold text-foreground mt-1'>
										{product.title}
									</h3>
									<p className='text-2xl font-bold text-primary mt-2'>
										{product.price}
									</p>
								</div>
								<Button
									className='w-full shadow-soft hover:shadow-hover transition-all'
									onClick={() => navigate(`/producto/${product.id}`)}
								>
									Ver Detalles
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};
