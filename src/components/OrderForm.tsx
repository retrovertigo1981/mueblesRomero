import { useLocation, useNavigate } from 'react-router';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card';
import { toast } from 'sonner';
import type { CleanProductDetail } from '@/types';
import { useOrderForm } from '@/hooks/useSecureForm';
import {
	ArrowLeft,
	Ruler,
	Package,
	Palette,
	Shield,
	Loader2,
	AlertCircle,
	Clock,
} from 'lucide-react';

interface LocationState {
	product: CleanProductDetail;
}

export const OrderForm = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { product } = (location.state as LocationState) || {};

	const {
		register,
		handleSubmit,
		formState,
		isRateLimited,
		timeUntilNextSubmit,
		resetRateLimit,
	} = useOrderForm(async (data) => {
		const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
		const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
		const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

		if (!serviceID || !templateID || !publicKey) {
			throw new Error('Configuración de EmailJS no encontrada');
		}

		const templateParams = {
			nombre: data.nombre,
			apellido: data.apellido,
			telefono: data.telefono,
			correo: data.correo,
			direccion: data.direccion,
			ciudad: data.ciudad,
			comentario: data.comentario || '',
			product_title: product.title || '',
			product_price: product.price?.toString() || '0',
			product_category: product.category || '',
			product_image: product.image || '',
			product_description: product.description || 'No hay descripción.',
			product_dimensions: product.dimensions || 'No especificado',
			product_material: product.material || 'No especificado',
			product_color: product.color || 'No especificado',
			product_warranty: product.warranty || 'No especificado',
		};

		await emailjs.send(serviceID, templateID, templateParams, publicKey);
		toast.success(
			'¡Pedido enviado con éxito! Nos pondremos en contacto contigo pronto.'
		);
	});

	if (!product) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center text-center p-4'>
				<p className='text-xl text-muted-foreground mb-4'>
					No se ha seleccionado ningún producto.
				</p>
				<Button onClick={() => navigate('/catalogo-clasico')}>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Volver al catálogo
				</Button>
			</div>
		);
	}

	return (
		<div className='min-h-screen pt-24 pb-20'>
			<div className='container mx-auto px-4'>
				<h1 className='text-3xl md:text-4xl font-bold text-center mb-8 font-serif-display'>
					Completa tu Pedido
				</h1>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
					{/* Formulario - Contenedor más ancho */}
					<div className='lg:col-span-1'>
						<Card className='shadow-hover h-full'>
							<CardHeader className='pb-6'>
								<CardTitle className='text-2xl'>Tus Datos</CardTitle>
								<p className='text-muted-foreground text-sm'>
									Completa el formulario para procesar tu pedido
								</p>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className='space-y-6'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
										<div className='space-y-2'>
											<Label htmlFor='nombre'>Nombre *</Label>
											<Input
												id='nombre'
												{...register('nombre')}
												className={`h-11 ${
													formState.validationErrors.nombre
														? 'border-red-500'
														: ''
												}`}
												disabled={formState.isSubmitting || isRateLimited}
											/>
											{formState.validationErrors.nombre && (
												<p className='text-sm text-red-600 flex items-center gap-1'>
													<AlertCircle className='w-4 h-4' />
													{String(formState.validationErrors.nombre)}
												</p>
											)}
										</div>
										<div className='space-y-2'>
											<Label htmlFor='apellido'>Apellido *</Label>
											<Input
												id='apellido'
												{...register('apellido')}
												className={`h-11 ${
													formState.validationErrors.apellido
														? 'border-red-500'
														: ''
												}`}
												disabled={formState.isSubmitting || isRateLimited}
											/>
											{formState.validationErrors.apellido && (
												<p className='text-sm text-red-600 flex items-center gap-1'>
													<AlertCircle className='w-4 h-4' />
													{String(formState.validationErrors.apellido)}
												</p>
											)}
										</div>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='telefono'>Teléfono *</Label>
										<Input
											id='telefono'
											type='tel'
											{...register('telefono')}
											className={`h-11 ${
												formState.validationErrors.telefono
													? 'border-red-500'
													: ''
											}`}
											disabled={formState.isSubmitting || isRateLimited}
										/>
										{formState.validationErrors.telefono && (
											<p className='text-sm text-red-600 flex items-center gap-1'>
												<AlertCircle className='w-4 h-4' />
												{String(formState.validationErrors.telefono)}
											</p>
										)}
									</div>
									<div className='space-y-2'>
										<Label htmlFor='correo'>Correo Electrónico *</Label>
										<Input
											id='correo'
											type='email'
											{...register('correo')}
											className={`h-11 ${
												formState.validationErrors.correo
													? 'border-red-500'
													: ''
											}`}
											disabled={formState.isSubmitting || isRateLimited}
										/>
										{formState.validationErrors.correo && (
											<p className='text-sm text-red-600 flex items-center gap-1'>
												<AlertCircle className='w-4 h-4' />
												{String(formState.validationErrors.correo)}
											</p>
										)}
									</div>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
										<div className='space-y-2'>
											<Label htmlFor='direccion'>Dirección *</Label>
											<Input
												id='direccion'
												{...register('direccion')}
												className={`h-11 ${
													formState.validationErrors.direccion
														? 'border-red-500'
														: ''
												}`}
												disabled={formState.isSubmitting || isRateLimited}
											/>
											{formState.validationErrors.direccion && (
												<p className='text-sm text-red-600 flex items-center gap-1'>
													<AlertCircle className='w-4 h-4' />
													{String(formState.validationErrors.direccion)}
												</p>
											)}
										</div>
										<div className='space-y-2'>
											<Label htmlFor='ciudad'>Ciudad *</Label>
											<Input
												id='ciudad'
												{...register('ciudad')}
												className={`h-11 ${
													formState.validationErrors.ciudad
														? 'border-red-500'
														: ''
												}`}
												disabled={formState.isSubmitting || isRateLimited}
											/>
											{formState.validationErrors.ciudad && (
												<p className='text-sm text-red-600 flex items-center gap-1'>
													<AlertCircle className='w-4 h-4' />
													{String(formState.validationErrors.ciudad)}
												</p>
											)}
										</div>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='comentario'>Comentario (Opcional)</Label>
										<Textarea
											id='comentario'
											{...register('comentario')}
											placeholder='Indica cualquier especificación adicional para tu pedido...'
											rows={3}
											className={`resize-none ${
												formState.validationErrors.comentario
													? 'border-red-500'
													: ''
											}`}
											disabled={formState.isSubmitting || isRateLimited}
										/>
										{formState.validationErrors.comentario && (
											<p className='text-sm text-red-600 flex items-center gap-1'>
												<AlertCircle className='w-4 h-4' />
												{String(formState.validationErrors.comentario)}
											</p>
										)}
									</div>

									{/* Rate Limiting Warning */}
									{isRateLimited && (
										<div className='p-4 border border-orange-200 bg-orange-50 rounded-md'>
											<div className='flex items-center gap-2'>
												<Clock className='h-4 w-4 text-orange-600' />
												<p className='text-orange-800'>
													Demasiados intentos. Intenta de nuevo en{' '}
													{timeUntilNextSubmit} segundos.
													<Button
														type='button'
														variant='link'
														size='sm'
														onClick={resetRateLimit}
														className='ml-2 p-0 h-auto text-orange-600 underline'
													>
														Resetear límite
													</Button>
												</p>
											</div>
										</div>
									)}

									<Button
										type='submit'
										className='w-full h-12 text-base'
										disabled={
											formState.isSubmitting ||
											isRateLimited ||
											!formState.isValid
										}
									>
										{formState.isSubmitting ? (
											<Loader2 className='mr-2 h-5 w-5 animate-spin' />
										) : isRateLimited ? (
											`Espera ${timeUntilNextSubmit}s`
										) : (
											'Enviar Orden de Trabajo'
										)}
									</Button>
								</form>
							</CardContent>
							<CardFooter className='border-t pt-6'>
								<div className='space-y-2'>
									<p className='text-sm text-muted-foreground'>
										* Campos obligatorios. Nos pondremos en contacto contigo
										para confirmar los detalles.
									</p>
									<div className='text-xs text-muted-foreground space-y-1'>
										<p className='flex items-center gap-1'>
											<Shield className='w-3 h-3' />
											Formulario protegido contra spam y ataques
										</p>
										<p className='flex items-center gap-1'>
											<Clock className='w-3 h-3' />
											Máximo 3 intentos por minuto
										</p>
									</div>
								</div>
							</CardFooter>
						</Card>
					</div>

					{/* Detalles del Producto - Contenedor más ancho */}
					<div className='lg:col-span-1'>
						<Card className='shadow-soft h-full'>
							<CardHeader className='pb-6'>
								<CardTitle className='text-2xl'>Resumen del Pedido</CardTitle>
								<p className='text-muted-foreground text-sm'>
									Revisa los detalles del producto seleccionado
								</p>
							</CardHeader>
							<CardContent className='pb-6'>
								<div className='flex flex-col md:flex-row gap-6'>
									{/* Imagen más grande y destacada */}
									<div className='flex-shrink-0 w-full md:w-2/5'>
										<div className='aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800'>
											<img
												src={product.image}
												alt={product.title}
												className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
											/>
										</div>
									</div>

									{/* Información del producto */}
									<div className='flex-1 space-y-4'>
										<div>
											<h3 className='font-bold text-xl mb-1'>
												{product.title}
											</h3>
											<div className='inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full'>
												{product.category}
											</div>
										</div>

										{/* Descripción del producto */}
										<div className='space-y-3'>
											<h4 className='font-semibold text-lg'>Descripción</h4>
											<div className='text-muted-foreground leading-relaxed'>
												{product.description ? (
													<div className='space-y-2'>
														{product.description
															.split('\n')
															.map((line, index) => (
																<p
																	key={index}
																	className={line.trim() ? '' : 'h-4'}
																>
																	{line.trim() || ''}
																</p>
															))}
													</div>
												) : (
													<p className='italic text-gray-500'>
														Este producto no cuenta con una descripción
														detallada.
													</p>
												)}
											</div>
										</div>
									</div>
								</div>

								{/* Especificaciones en grid 2x2 - Alineada con la imagen */}
								{(product.dimensions ||
									product.material ||
									product.color ||
									product.warranty ||
									product.details) && (
									<div className='space-y-3 mt-6'>
										<h4 className='font-semibold text-lg'>Especificaciones</h4>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
											{/* Dimensiones */}
											{product.dimensions && (
												<div className='bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg'>
													<div className='flex items-start gap-3'>
														<Ruler className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
														<div className='flex-1 min-w-0'>
															<p className='font-medium text-foreground'>
																Dimensiones
															</p>
															<p className='text-sm text-muted-foreground'>
																{product.dimensions}
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Material */}
											{product.material && (
												<div className='bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg'>
													<div className='flex items-start gap-3'>
														<Package className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
														<div className='flex-1 min-w-0'>
															<p className='font-medium text-foreground'>
																Material
															</p>
															<p className='text-sm text-muted-foreground'>
																{product.material}
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Color */}
											{product.color && (
												<div className='bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg'>
													<div className='flex items-start gap-3'>
														<Palette className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
														<div className='flex-1 min-w-0'>
															<p className='font-medium text-foreground'>
																Color
															</p>
															<p className='text-sm text-muted-foreground'>
																{product.color}
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Garantía */}
											{product.warranty && (
												<div className='bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg'>
													<div className='flex items-start gap-3'>
														<Shield className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
														<div className='flex-1 min-w-0'>
															<p className='font-medium text-foreground'>
																Garantía
															</p>
															<p className='text-sm text-muted-foreground'>
																{product.warranty}
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Detalles adicionales - Ocupa 2 columnas si está solo */}
											{product.details &&
												!(
													product.dimensions ||
													product.material ||
													product.color ||
													product.warranty
												) && (
													<div className='bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg sm:col-span-2'>
														<div className='flex items-start gap-3'>
															<div className='h-5 w-5 rounded-full border-2 border-primary mt-0.5 flex items-center justify-center flex-shrink-0'>
																<span className='text-xs font-bold'>i</span>
															</div>
															<div className='flex-1 min-w-0'>
																<p className='font-medium text-foreground'>
																	Detalles
																</p>
																<p className='text-sm text-muted-foreground'>
																	{product.details}
																</p>
															</div>
														</div>
													</div>
												)}

											{/* Detalles adicionales - En grid normal si hay otros */}
											{product.details &&
												(product.dimensions ||
													product.material ||
													product.color ||
													product.warranty) && (
													<div className='bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg'>
														<div className='flex items-start gap-3'>
															<div className='h-5 w-5 rounded-full border-2 border-primary mt-0.5 flex items-center justify-center flex-shrink-0'>
																<span className='text-xs font-bold'>i</span>
															</div>
															<div className='flex-1 min-w-0'>
																<p className='font-medium text-foreground'>
																	Detalles
																</p>
																<p className='text-sm text-muted-foreground'>
																	{product.details}
																</p>
															</div>
														</div>
													</div>
												)}
										</div>
									</div>
								)}
							</CardContent>
							<CardFooter className='border-t pt-6'>
								<div className='flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4'>
									<div>
										<p className='text-sm text-muted-foreground mb-1'>
											Total a pagar
										</p>
										<p className='text-4xl font-bold text-primary'>
											${product.price}
										</p>
									</div>
									<Button
										variant='outline'
										onClick={() => navigate('/catalogo-clasico')}
										className='h-11'
									>
										<ArrowLeft className='mr-2 h-4 w-4' />
										Cambiar Producto
									</Button>
								</div>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};
