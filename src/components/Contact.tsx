import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, AlertCircle, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { useContactForm } from '@/hooks/useSecureForm';

export const Contact = () => {
	const {
		register,
		handleSubmit,
		formState,
		isRateLimited,
		timeUntilNextSubmit,
		resetRateLimit,
	} = useContactForm(async (data) => {
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
		toast.success('¡Mensaje enviado! Nos pondremos en contacto pronto.');
	});

	return (
		<div className='min-h-screen flex flex-col'>
			<main className='flex-1 pt-24 pb-20'>
				<div className='container mx-auto max-w-6xl'>
					<div className='text-center mb-12'>
						<h1 className='text-4xl md:text-5xl font-bold mb-4 text-foreground'>
							Contáctanos
						</h1>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							¿Tienes preguntas sobre nuestros muebles? Estamos aquí para
							ayudarte
						</p>
					</div>

					<div className='grid lg:grid-cols-2 gap-8'>
						{/* Contact Form */}
						<Card className='shadow-hover'>
							<CardHeader>
								<CardTitle className='text-2xl'>Envíanos un Mensaje</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className='space-y-6'>
									<div>
										<Label htmlFor='name'>Nombre Completo</Label>
										<Input
											id='name'
											{...register('name')}
											placeholder='Juan Pérez'
											className={`mt-2 ${
												formState.validationErrors.name ? 'border-red-500' : ''
											}`}
											disabled={formState.isSubmitting || isRateLimited}
										/>
										{formState.validationErrors.name && (
											<p className='text-sm text-red-600 flex items-center gap-1 mt-1'>
												<AlertCircle className='w-4 h-4' />
												{String(formState.validationErrors.name)}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor='email'>Email</Label>
										<Input
											id='email'
											type='email'
											{...register('email')}
											placeholder='juan@ejemplo.com'
											className={`mt-2 ${
												formState.validationErrors.email ? 'border-red-500' : ''
											}`}
											disabled={formState.isSubmitting || isRateLimited}
										/>
										{formState.validationErrors.email && (
											<p className='text-sm text-red-600 flex items-center gap-1 mt-1'>
												<AlertCircle className='w-4 h-4' />
												{String(formState.validationErrors.email)}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor='phone'>Teléfono</Label>
										<Input
											id='phone'
											type='tel'
											{...register('phone')}
											placeholder='+569 1234 5678'
											className={`mt-2 ${
												formState.validationErrors.phone ? 'border-red-500' : ''
											}`}
											disabled={formState.isSubmitting || isRateLimited}
										/>
										{formState.validationErrors.phone && (
											<p className='text-sm text-red-600 flex items-center gap-1 mt-1'>
												<AlertCircle className='w-4 h-4' />
												{String(formState.validationErrors.phone)}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor='message'>Mensaje</Label>
										<Textarea
											id='message'
											{...register('message')}
											placeholder='Cuéntanos qué necesitas...'
											className={`mt-2 min-h-32 ${
												formState.validationErrors.message
													? 'border-red-500'
													: ''
											}`}
											disabled={formState.isSubmitting || isRateLimited}
										/>
										{formState.validationErrors.message && (
											<p className='text-sm text-red-600 flex items-center gap-1 mt-1'>
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

									<Button
										type='submit'
										className='w-full shadow-hover'
										size='lg'
										disabled={
											formState.isSubmitting ||
											isRateLimited ||
											!formState.isValid
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

						{/* Contact Info */}
						<div className='space-y-6'>
							<Card className='shadow-soft'>
								<CardContent className='pt-6'>
									<div className='flex items-start gap-4'>
										<div className='p-3 rounded-lg bg-primary/10'>
											<Mail className='w-6 h-6 text-primary' />
										</div>
										<div>
											<h3 className='font-semibold text-lg mb-1'>Email</h3>
											<a
												href='mailto:contacto@muebleselromero.cl'
												className='text-muted-foreground hover:text-primary transition-colors'
											>
												{/* El span interior permite copiar el texto fácilmente sin arrastrar el enlace */}
												<span>contacto@muebleselromero.cl</span>
											</a>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className='shadow-soft'>
								<CardContent className='pt-6'>
									<div className='flex items-start gap-4'>
										<div className='p-3 rounded-lg bg-primary/10'>
											<Phone className='w-6 h-6 text-primary' />
										</div>
										<div>
											<h3 className='font-semibold text-lg mb-1'>Teléfono</h3>
											<a
												href='tel:+56983442725'
												className='text-muted-foreground hover:text-primary transition-colors'
											>
												+569 8344 2725
											</a>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className='shadow-soft'>
								<CardContent className='pt-6'>
									<div className='flex items-start gap-4'>
										<div className='p-3 rounded-lg bg-primary/10'>
											<MapPin className='w-6 h-6 text-primary' />
										</div>
										<div>
											<h3 className='font-semibold text-lg mb-1'>Ubicación</h3>
											<p className='text-muted-foreground'>
												Calle La Victoria #0477, La Granja.
												<br />
												Santiago, Chile
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className='shadow-soft bg-gradient-card'>
								<CardContent className='pt-6'>
									<h3 className='font-semibold text-lg mb-2'>
										Horario de Atención
									</h3>
									<div className='space-y-2 text-muted-foreground'>
										<div className='flex justify-between'>
											<span>Lunes - Viernes</span>
											<span className='font-medium'>10:00 - 19:30 Hrs</span>
										</div>
										<div className='flex justify-between'>
											<span>Sábado</span>
											<span className='font-medium'>10:00 - 15:00 Hrs</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};
