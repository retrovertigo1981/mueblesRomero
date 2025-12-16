import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, Shield } from 'lucide-react';
import { useContactForm } from '@/hooks/useSecureForm';
import emailjs from '@emailjs/browser';

/**
 * Ejemplo de implementación del formulario de contacto
 * usando el hook useSecureForm con rate limiting y validación
 */
export const ContactFormExample: React.FC = () => {
	// Usar el hook específico para formularios de contacto
	const {
		register,
		handleSubmit,
		formState,
		isRateLimited,
		timeUntilNextSubmit,
		resetRateLimit,
	} = useContactForm(async (data) => {
		// Simular envío con EmailJS
		const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID2;
		const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID2;
		const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY2;

		if (!serviceId || !templateId || !publicKey) {
			throw new Error('Configuración de EmailJS no encontrada');
		}

		const templateParams = {
			from_name: data.name,
			from_email: data.email,
			from_phone: data.phone || '',
			message: data.message,
		};

		await emailjs.send(serviceId, templateId, templateParams, publicKey);
	});

	return (
		<div className='max-w-2xl mx-auto p-6'>
			<Card className='shadow-lg'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Shield className='w-6 h-6 text-green-600' />
						Formulario de Contacto Seguro
					</CardTitle>
					<p className='text-muted-foreground'>
						Formulario protegido con rate limiting y validación robusta
					</p>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Nombre */}
						<div className='space-y-2'>
							<Label htmlFor='name'>Nombre Completo *</Label>
							<Input
								id='name'
								{...register('name')}
								placeholder='Juan Pérez'
								className={
									formState.validationErrors.name ? 'border-red-500' : ''
								}
								disabled={formState.isSubmitting || isRateLimited}
							/>
							{formState.validationErrors.name && (
								<p className='text-sm text-red-600 flex items-center gap-1'>
									<AlertCircle className='w-4 h-4' />
									{String(formState.validationErrors.name)}
								</p>
							)}
						</div>

						{/* Email */}
						<div className='space-y-2'>
							<Label htmlFor='email'>Email *</Label>
							<Input
								id='email'
								type='email'
								{...register('email')}
								placeholder='juan@ejemplo.com'
								className={
									formState.validationErrors.email ? 'border-red-500' : ''
								}
								disabled={formState.isSubmitting || isRateLimited}
							/>
							{formState.validationErrors.email && (
								<p className='text-sm text-red-600 flex items-center gap-1'>
									<AlertCircle className='w-4 h-4' />
									{String(formState.validationErrors.email)}
								</p>
							)}
						</div>

						{/* Teléfono */}
						<div className='space-y-2'>
							<Label htmlFor='phone'>Teléfono</Label>
							<Input
								id='phone'
								type='tel'
								{...register('phone')}
								placeholder='+569 1234 5678'
								className={
									formState.validationErrors.phone ? 'border-red-500' : ''
								}
								disabled={formState.isSubmitting || isRateLimited}
							/>
							{formState.validationErrors.phone && (
								<p className='text-sm text-red-600 flex items-center gap-1'>
									<AlertCircle className='w-4 h-4' />
									{String(formState.validationErrors.phone)}
								</p>
							)}
						</div>

						{/* Mensaje */}
						<div className='space-y-2'>
							<Label htmlFor='message'>Mensaje *</Label>
							<Textarea
								id='message'
								{...register('message')}
								placeholder='Cuéntanos qué necesitas...'
								className={`min-h-32 ${
									formState.validationErrors.message ? 'border-red-500' : ''
								}`}
								disabled={formState.isSubmitting || isRateLimited}
							/>
							{formState.validationErrors.message && (
								<p className='text-sm text-red-600 flex items-center gap-1'>
									<AlertCircle className='w-4 h-4' />
									{String(formState.validationErrors.message)}
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
								? 'Enviando...'
								: isRateLimited
								? `Espera ${timeUntilNextSubmit}s`
								: 'Enviar Mensaje'}
						</Button>

						{/* Información de seguridad */}
						<div className='text-xs text-muted-foreground space-y-1'>
							<p className='flex items-center gap-1'>
								<Shield className='w-3 h-3' />
								Protegido contra spam y ataques de fuerza bruta
							</p>
							<p className='flex items-center gap-1'>
								<Clock className='w-3 h-3' />
								Máximo 3 intentos por minuto
							</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ContactFormExample;
