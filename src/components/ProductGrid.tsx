import type { CleanProduct } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductGridProps {
	products: CleanProduct[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
	const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
	const [loadedCount, setLoadedCount] = useState<number>(6);
	const categories = [
		'Todos',
		'Sillas',
		'Comedor',
		'Muebles de Sala',
		'Infantil',
	];
	const navigate = useNavigate();
	const sentinelRef = useRef<HTMLDivElement>(null);

	const filteredProducts =
		selectedCategory === 'Todos'
			? products
			: products.filter((p) => p.category === selectedCategory);

	const displayedProducts = filteredProducts.slice(0, loadedCount);
	const hasMore = loadedCount < filteredProducts.length;

	const loadMore = useCallback(() => {
		if (hasMore) {
			setLoadedCount((prev) => Math.min(prev + 6, filteredProducts.length));
		}
	}, [hasMore, filteredProducts.length]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore) {
					loadMore();
				}
			},
			{ threshold: 1.0 },
		);

		const currentSentinel = sentinelRef.current;
		if (currentSentinel) {
			observer.observe(currentSentinel);
		}

		return () => {
			if (currentSentinel) {
				observer.unobserve(currentSentinel);
			}
		};
	}, [loadMore, hasMore]);

	useEffect(() => {
		// Reset loaded count when category changes
		setLoadedCount(6);
	}, [selectedCategory]);

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

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 md:px-8 lg:px-32'>
					{displayedProducts.map((product) => (
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
							<CardFooter className='flex flex-col items-start gap-3 p-4 sm:p-6'>
								<div className='w-full'>
									<span className='text-xs text-muted-foreground uppercase tracking-wider'>
										{product.category}
									</span>
									<h3
										className='text-lg font-semibold text-foreground mt-1 truncate'
										title={product.title}
									>
										{product.title}
									</h3>
									<p className='text-2xl font-bold text-primary mt-2'>
										{`$ ${product.price}`}
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
				{hasMore && (
					<div
						ref={sentinelRef}
						className='h-10 flex items-center justify-center'
					>
						<p className='text-muted-foreground'>Cargando más productos...</p>
					</div>
				)}
			</div>
		</section>
	);
};
