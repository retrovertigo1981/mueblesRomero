import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Ruler, Package, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CleanProductDetail } from '@/types';

interface ProductDetailProps {
	product: CleanProductDetail | null;
}

export const ProductDetail = ({ product }: ProductDetailProps) => {
	const navigate = useNavigate();
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
		<div className='min-h-screen px-36'>
			<main className='container mx-auto px-4 py-4 mt-10 md:py-12'>
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
								{`$ ${product.price}`}
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

						<Button
							className='w-full h-12 text-base'
							size='lg'
							onClick={() =>
								navigate('/order-form', { state: { product: product } })
							}
						>
							<ShoppingCart className='mr-2 h-5 w-5' />
							Completar Orden de Trabajo
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
};
