import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, Phone } from 'lucide-react';
// import { Sofa } from 'lucide-react';

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);
	const closeMenu = () => setIsOpen(false);

	return (
		<nav className='sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border'>
			<div className='container mx-auto px-4 py-4 relative'>
				<div className='flex items-center justify-between'>
					<Link
						to='/'
						className='flex items-center gap-2 group'
						onClick={closeMenu}
					>
						<div className='p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors'>
							<img
								className='w-6 h-6'
								src='/muebles_romero_logo-removebg.png'
								alt='Muebles Romero Logo'
							/>
						</div>
						<span className='text-xl font-semibold text-foreground font-serif-display'>
							Muebles El Romero
						</span>
					</Link>

					<div className='hidden sm:flex items-center flex-nowrap gap-2 absolute right-20'>
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

						<div className='flex gap-1 ml-3'>
							<span>
								<Phone />
							</span>
							<p>+56 9 8344 2725</p>
						</div>
					</div>

					{/* Mobile Menu Button */}
					<button
						className='p-2 rounded-lg hover:bg-muted transition-colors'
						onClick={toggleMenu}
						aria-label='Toggle menu'
					>
						{isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
					</button>
				</div>

				{/* Mobile Menu */}
				{isOpen && (
					<div className='absolute top-full left-0 right-0 z-40 bg-background backdrop-blur-md border-b border-border md:w-64 md:right-0 md:left-auto md:rounded-lg md:shadow-lg md:border'>
						<div className='container mx-auto px-4 py-4 md:px-0 md:py-0'>
							<div className='flex flex-col gap-4 md:p-4'>
								<Link
									to='/'
									className='text-foreground hover:text-primary transition-colors font-medium font-sans-romero'
									onClick={closeMenu}
								>
									Inicio
								</Link>
								<Link
									to='/catalogo-clasico'
									className='text-foreground hover:text-primary transition-colors font-medium font-sans-romero'
									onClick={closeMenu}
								>
									Catálogo Clásico
								</Link>
								<Link
									to='/catalogo-interactivo'
									className='text-foreground hover:text-primary transition-colors font-medium font-sans-romero'
									onClick={closeMenu}
								>
									Catálogo Interactivo
								</Link>
								<Link
									to='/contacto'
									className='text-foreground hover:text-primary transition-colors font-medium font-sans-romero'
									onClick={closeMenu}
								>
									Contacto
								</Link>
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};
