import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Ruler, Package, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface testApi {
	id: number;
	title: {
		rendered: string;
	};
	acf: {
		price: string;
		category: string;
		description: string;
		dimensions: string;
		material: string;
		color: string;
		warranty: string;
		image: string;
	};
}

interface ProductDetailClear {
	id: number;
	title: string;
	price: string;
	category: string;
	description: string;
	dimensions: string;
	material: string;
	color: string;
	warranty: string;
	image: string;
}

export const ProductDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [product, setProduct] = useState<ProductDetailClear | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchProduct = async () => {
			setIsLoading(true);

			try {
				const response = await fetch(
					`http://localhost:8881/wp-json/wp/v2/productos/${id}`
				);

				if (!response.ok) {
					throw new Error('Error al cargar el producto');
				}
				const rawData: testApi = await response.json();
				const cleanProduct: ProductDetailClear = {
					id: rawData.id,
					title: rawData.title.rendered,
					price: rawData.acf.price,
					category: rawData.acf.category,
					description: rawData.acf.description,
					dimensions: rawData.acf.dimensions,
					material: rawData.acf.material,
					color: rawData.acf.color,
					warranty: rawData.acf.warranty,
					image: rawData.acf.image,
				};
				setProduct(cleanProduct);
			} catch (error) {
				console.error('Error fetching product:', error);
				toast.error(
					'No se pudo cargar el producto. Por favor intenta de nuevo.'
				);
				setProduct(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProduct();
	}, [id]);

	if (isLoading) {
		return (
			<div className='min-h-screen'>
				<div className='container mx-auto px-4 py-20 text-center'>
					<div className='animate-pulse space-y-4'>
						<div className='h-8 bg-muted rounded w-1/4 mx-auto'></div>
						<div className='h-4 bg-muted rounded w-1/2 mx-auto'></div>
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className='min-h-screen'>
				<div className='container mx-auto px-4 py-20 text-center'>
					<h1 className='text-3xl font-bold text-foreground mb-4'>
						Producto no encontrado
					</h1>
					<Button onClick={() => navigate('/')}>
						<ArrowLeft className='mr-2' />
						Volver al catálogo
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen'>
			<main className='container mx-auto px-4 py-8 mt-10 md:py-12'>
				<Button
					variant='outline'
					onClick={() => navigate('/catalogo-clasico')}
					className='mb-6 border-2 hover:bg-accent'
				>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Volver al catálogo
				</Button>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
					{/* Image Section */}
					<div className='space-y-4'>
						<div className='aspect-square bg-muted rounded-lg overflow-hidden'>
							<img
								src={product.image}
								alt={product.title}
								className='w-full h-full object-cover'
							/>
						</div>
					</div>

					{/* Product Info Section */}
					<div className='space-y-6'>
						<div>
							<span className='text-sm text-muted-foreground uppercase tracking-wider'>
								{product.category}
							</span>
							<h1 className='text-3xl md:text-4xl  font-serif-display font-bold text-foreground mt-2'>
								{product.title}
							</h1>
							<p className='text-4xl font-bold text-primary mt-4'>
								{product.price}
							</p>
						</div>

						<Separator />

						<div>
							<h2 className='text-lg font-semibold text-foreground mb-3'>
								Descripción
							</h2>
							<p className='text-muted-foreground leading-relaxed'>
								{product.description}
							</p>
						</div>

						<Separator />

						{/* Specifications */}
						<div className='space-y-4'>
							<h2 className='text-lg font-semibold text-foreground'>
								Especificaciones
							</h2>

							<Card>
								<CardContent className='p-4 space-y-4'>
									<div className='flex items-start gap-3'>
										<Ruler className='h-5 w-5 text-primary mt-0.5' />
										<div>
											<p className='font-medium text-foreground'>Dimensiones</p>
											<p className='text-sm text-muted-foreground'>
												{product.dimensions}
											</p>
										</div>
									</div>

									<Separator />

									<div className='flex items-start gap-3'>
										<Package className='h-5 w-5 text-primary mt-0.5' />
										<div>
											<p className='font-medium text-foreground'>Material</p>
											<p className='text-sm text-muted-foreground'>
												{product.material}
											</p>
										</div>
									</div>

									<Separator />

									<div className='flex items-start gap-3'>
										<div className='h-5 w-5 rounded-full border-2 border-primary mt-0.5' />
										<div>
											<p className='font-medium text-foreground'>Color</p>
											<p className='text-sm text-muted-foreground'>
												{product.color}
											</p>
										</div>
									</div>

									<Separator />

									<div className='flex items-start gap-3'>
										<Shield className='h-5 w-5 text-primary mt-0.5' />
										<div>
											<p className='font-medium text-foreground'>Garantía</p>
											<p className='text-sm text-muted-foreground'>
												{product.warranty}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<Button className='w-full h-12 text-base' size='lg'>
							<ShoppingCart className='mr-2 h-5 w-5' />
							Agregar al carrito
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
};
