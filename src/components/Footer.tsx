import { Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
	return (
		<footer className='bg-foreground text-background py-12 px-4'>
			<div className='container mx-auto'>
				<div className='grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-y-8 md:gap-x-4 mb-8'>
					<div className='flex flex-col items-center md:items-start text-center md:text-left'>
						<div className='flex items-center gap-2 mb-4'>
							<img
								className='w-6 h-6'
								src='/muebles_romero_logo-removebg.png'
								alt='Muebles Romero Logo'
							/>
							<span className='text-xl font-semibold font-serif-display'>
								Muebles El Romero
							</span>
						</div>
						<p className='text-background/80 max-w-xs'>
							Transformando espacios con muebles de calidad y diseño excepcional
							desde 2020.
						</p>
					</div>

					<div className='flex flex-col items-center text-center'>
						<h3 className='font-semibold mb-4 text-lg'>Enlaces Rápidos</h3>
						<ul className='space-y-2 text-background/80'>
							<li>
								<Link to='/' className='hover:text-primary transition-colors'>
									Inicio
								</Link>
							</li>
							<li>
								<Link
									to='/catalogo-clasico'
									className='hover:text-primary transition-colors'
								>
									Catálogo Clásico
								</Link>
							</li>
							<li>
								<Link
									to='/catalogo-interactivo'
									className='hover:text-primary transition-colors'
								>
									Catálogo Interactivo
								</Link>
							</li>
							<li>
								<Link
									to='/contacto'
									className='hover:text-primary transition-colors'
								>
									Contacto
								</Link>
							</li>
						</ul>
					</div>

					<div className='flex flex-col items-center md:items-end text-center md:text-right'>
						<h3 className='font-semibold mb-4 text-lg'>Síguenos</h3>
						<div className='flex gap-4'>
							<a
								href='https://www.facebook.com/MueblesRomero'
								className='hover:text-primary transition-colors'
								target='_blank'
								rel='noopener noreferrer'
							>
								<Facebook className='w-6 h-6' />
							</a>
							<a
								href='https://www.instagram.com/muebles.el.romero/'
								className='hover:text-primary transition-colors'
								target='_blank'
								rel='noopener noreferrer'
							>
								<Instagram className='w-6 h-6' />
							</a>
						</div>
					</div>
				</div>

				<div className='border-t border-background/20 pt-8 text-center text-background/70'>
					<p>&copy; 2025 Muebles El Romero. Todos los derechos reservados.</p>
				</div>
			</div>
		</footer>
	);
};
