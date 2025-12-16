import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	AlertCircle,
	Clock,
	Shield,
	User,
	Phone,
	Mail,
	MapPin,
	MessageSquare,
} from 'lucide-react';
import { useOrderForm } from '@/hooks/useSecureForm';
import emailjs from '@emailjs/browser';

/**
 * Ejemplo de implementación del formulario de pedidos
 * usando el hook useSecureForm con rate limiting y validación
 */
export const OrderFormExample: React.FC = () => {
	// Simular producto seleccionado
	const mockProduct = {
		title: 'Mesa de Comedor Elegante',
		price: '$450.000',
		category: 'Comedor',
	};

	// Usar el hook específico para formularios de pedidos
	const {
		register,
		handleSubmit,
		formState,
		isRateLimited,
		timeUntilNextSubmit,
		resetRateLimit,
	} = useOrderForm(async (data) => {
		// Simular envío con EmailJS
		const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
		const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
		const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

		if (!serviceId || !templateId || !publicKey) {
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
			product_title: mockProduct.title,
			product_price: mockProduct.price,
			product_category: mockProduct.category,
		};

		await emailjs.send(serviceId, templateId, templateParams, publicKey);
	});

	return (
		<div className='max-w-4xl mx-auto p-6'>
			<div className='grid md:grid-cols-2 gap-8'>
				{/* Formulario */}
				<Card className='shadow-lg'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Shield className='w-6 h-6 text-blue-600' />
							Formulario de Pedido Seguro
						</CardTitle>
						<p className='text-muted-foreground'>
							Completa tus datos para procesar el pedido
						</p>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-6'>
							{/* Nombre y Apellido */}
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='nombre' className='flex items-center gap-1'>
										<User className='w-4 h-4' />
										Nombre *
									</Label>
									<Input
										id='nombre'
										{...register('nombre')}
										placeholder='Juan'
										className={
											formState.validationErrors.nombre ? 'border-red-500' : ''
										}
										disabled={formState.isSubmitting || isRateLimited}
									/>
									{formState.validationErrors.nombre && (
										<p className='text-sm text-red-600 flex items-center gap-1'>
											<AlertCircle className='w-3 h-3' />
											{String(formState.validationErrors.nombre)}
										</p>
									)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='apellido'>Apellido *</Label>
									<Input
										id='apellido'
										{...register('apellido')}
										placeholder='Pérez'
										className={
											formState.validationErrors.apellido
												? 'border-red-500'
												: ''
										}
										disabled={formState.isSubmitting || isRateLimited}
									/>
									{formState.validationErrors.apellido && (
										<p className='text-sm text-red-600 flex items-center gap-1'>
											<AlertCircle className='w-3 h-3' />
											{String(formState.validationErrors.apellido)}
										</p>
									)}
								</div>
							</div>

							{/* Teléfono */}
							<div className='space-y-2'>
								<Label htmlFor='telefono' className='flex items-center gap-1'>
									<Phone className='w-4 h-4' />
									Teléfono *
								</Label>
								<Input
									id='telefono'
									type='tel'
									{...register('telefono')}
									placeholder='+569 1234 5678'
									className={
										formState.validationErrors.telefono ? 'border-red-500' : ''
									}
									disabled={formState.isSubmitting || isRateLimited}
								/>
								{formState.validationErrors.telefono && (
									<p className='text-sm text-red-600 flex items-center gap-1'>
										<AlertCircle className='w-3 h-3' />
										{String(formState.validationErrors.telefono)}
									</p>
								)}
							</div>

							{/* Email */}
							<div className='space-y-2'>
								<Label htmlFor='correo' className='flex items-center gap-1'>
									<Mail className='w-4 h-4' />
									Email *
								</Label>
								<Input
									id='correo'
									type='email'
									{...register('correo')}
									placeholder='juan@ejemplo.com'
									className={
										formState.validationErrors.correo ? 'border-red-500' : ''
									}
									disabled={formState.isSubmitting || isRateLimited}
								/>
								{formState.validationErrors.correo && (
									<p className='text-sm text-red-600 flex items-center gap-1'>
										<AlertCircle className='w-3 h-3' />
										{String(formState.validationErrors.correo)}
									</p>
								)}
							</div>

							{/* Dirección y Ciudad */}
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label
										htmlFor='direccion'
										className='flex items-center gap-1'
									>
										<MapPin className='w-4 h-4' />
										Dirección *
									</Label>
									<Input
										id='direccion'
										{...register('direccion')}
										placeholder='Calle Principal 123'
										className={
											formState.validationErrors.direccion
												? 'border-red-500'
												: ''
										}
										disabled={formState.isSubmitting || isRateLimited}
									/>
									{formState.validationErrors.direccion && (
										<p className='text-sm text-red-600 flex items-center gap-1'>
											<AlertCircle className='w-3 h-3' />
											{String(formState.validationErrors.direccion)}
										</p>
									)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='ciudad'>Ciudad *</Label>
									<Input
										id='ciudad'
										{...register('ciudad')}
										placeholder='Santiago'
										className={
											formState.validationErrors.ciudad ? 'border-red-500' : ''
										}
										disabled={formState.isSubmitting || isRateLimited}
									/>
									{formState.validationErrors.ciudad && (
										<p className='text-sm text-red-600 flex items-center gap-1'>
											<AlertCircle className='w-3 h-3' />
											{String(formState.validationErrors.ciudad)}
										</p>
									)}
								</div>
							</div>

							{/* Comentario */}
							<div className='space-y-2'>
								<Label htmlFor='comentario' className='flex items-center gap-1'>
									<MessageSquare className='w-4 h-4' />
									Comentario (Opcional)
								</Label>
								<Textarea
									id='comentario'
									{...register('comentario')}
									placeholder='Especificaciones adicionales para tu pedido...'
									className={
										formState.validationErrors.comentario
											? 'border-red-500'
											: ''
									}
									disabled={formState.isSubmitting || isRateLimited}
									rows={3}
								/>
								{formState.validationErrors.comentario && (
									<p className='text-sm text-red-600 flex items-center gap-1'>
										<AlertCircle className='w-3 h-3' />
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

							{/* Botón de envío */}
							<Button
								type='submit'
								className='w-full'
								size='lg'
								disabled={
									formState.isSubmitting || isRateLimited || !formState.isValid
								}
							>
								{formState.isSubmitting
									? 'Procesando...'
									: isRateLimited
									? `Espera ${timeUntilNextSubmit}s`
									: 'Confirmar Pedido'}
							</Button>

							{/* Información de seguridad */}
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
						</form>
					</CardContent>
				</Card>

				{/* Resumen del pedido */}
				<Card className='shadow-lg'>
					<CardHeader>
						<CardTitle>Resumen del Pedido</CardTitle>
						<p className='text-muted-foreground'>
							Revisa los detalles antes de confirmar
						</p>
					</CardHeader>

					<CardContent>
						<div className='space-y-4'>
							{/* Producto */}
							<div className='p-4 bg-gray-50 rounded-lg'>
								<h3 className='font-semibold text-lg mb-2'>
									{mockProduct.title}
								</h3>
								<div className='flex justify-between items-center'>
									<span className='text-muted-foreground'>
										{mockProduct.category}
									</span>
									<span className='text-xl font-bold text-primary'>
										{mockProduct.price}
									</span>
								</div>
							</div>

							{/* Información adicional */}
							<div className='space-y-3'>
								<h4 className='font-medium'>¿Qué incluye este pedido?</h4>
								<ul className='space-y-2 text-sm text-muted-foreground'>
									<li className='flex items-center gap-2'>
										<Shield className='w-4 h-4 text-green-600' />
										Producto de alta calidad
									</li>
									<li className='flex items-center gap-2'>
										<Shield className='w-4 h-4 text-green-600' />
										Garantía extendida
									</li>
									<li className='flex items-center gap-2'>
										<Shield className='w-4 h-4 text-green-600' />
										Atención personalizada
									</li>
								</ul>
							</div>

							{/* Total */}
							<div className='border-t pt-4'>
								<div className='flex justify-between items-center'>
									<span className='text-lg font-medium'>Total a pagar:</span>
									<span className='text-2xl font-bold text-primary'>
										{mockProduct.price}
									</span>
								</div>
								<p className='text-xs text-muted-foreground mt-1'>
									*El precio puede variar según especificaciones adicionales
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default OrderFormExample;
