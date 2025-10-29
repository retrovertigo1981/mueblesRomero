import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Contact = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		message: '',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		toast.success('¡Mensaje enviado! Nos pondremos en contacto pronto.');
		setFormData({ name: '', email: '', phone: '', message: '' });
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

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
											name='name'
											value={formData.name}
											onChange={handleChange}
											placeholder='Juan Pérez'
											required
											className='mt-2'
										/>
									</div>

									<div>
										<Label htmlFor='email'>Email</Label>
										<Input
											id='email'
											name='email'
											type='email'
											value={formData.email}
											onChange={handleChange}
											placeholder='juan@ejemplo.com'
											required
											className='mt-2'
										/>
									</div>

									<div>
										<Label htmlFor='phone'>Teléfono</Label>
										<Input
											id='phone'
											name='phone'
											type='tel'
											value={formData.phone}
											onChange={handleChange}
											placeholder='+34 600 123 456'
											className='mt-2'
										/>
									</div>

									<div>
										<Label htmlFor='message'>Mensaje</Label>
										<Textarea
											id='message'
											name='message'
											value={formData.message}
											onChange={handleChange}
											placeholder='Cuéntanos qué necesitas...'
											required
											className='mt-2 min-h-32'
										/>
									</div>

									<Button
										type='submit'
										className='w-full shadow-hover'
										size='lg'
									>
										Enviar Mensaje
									</Button>
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
											<p className='text-muted-foreground'>
												contacto@mueblesmodernos.com
											</p>
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
											<p className='text-muted-foreground'>+34 600 123 456</p>
											<p className='text-sm text-muted-foreground mt-1'>
												Lun - Vie: 9:00 - 18:00
											</p>
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
												Av. Principal 123
												<br />
												28001 Madrid, España
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
											<span className='font-medium'>9:00 - 18:00</span>
										</div>
										<div className='flex justify-between'>
											<span>Sábado</span>
											<span className='font-medium'>10:00 - 14:00</span>
										</div>
										<div className='flex justify-between'>
											<span>Domingo</span>
											<span className='font-medium'>Cerrado</span>
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
