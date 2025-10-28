import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Phone } from 'lucide-react';
import heroImage from '@/assets/hero-furniture.jpg';

export const Hero = () => {
	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		element?.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<section className='relative h-screen sm:h-auto sm:pt-28 sm:pb-24 md:pt-36 md:pb-32 lg:pt-56 lg:pb-56 px-4 overflow-hidden'>
			{/* Background Image with Overlay */}
			<div className='absolute inset-0 z-0'>
				<img
					src={heroImage}
					alt='Modern furniture showroom'
					className='w-full h-full object-cover'
				/>
				<div className='absolute inset-0 bg-background/70 backdrop-blur-sm' />
			</div>

			{/* Content */}
			<div className='container mx-auto text-center max-w-4xl relative z-10 h-full sm:h-auto flex flex-col justify-center'>
				<h1 className='text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-5 text-foreground leading-tight font-serif-display'>
					Transforma tu Hogar con
					<span className='text-primary block mt-1.5 sm:mt-2'>
						Muebles que Inspiran
					</span>
				</h1>
				<p className='text-sm sm:text-base md:text-lg lg:text-xl text-foreground/80 mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto font-medium font-sans-romero leading-relaxed px-1'>
					Descubre nuestra colección de muebles modernos y personalízalos a tu
					gusto. Cambia colores, combina estilos y crea el espacio perfecto.
				</p>
				<div className='flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto'>
					<Button
						size='lg'
						className='gap-2 shadow-hover hover:shadow-soft transition-all font-sans-romero w-full sm:w-auto text-base py-6 sm:py-3'
						onClick={() => scrollToSection('selector-catalogo')}
					>
						Ver Catálogos
						<ArrowRight className='w-4 h-4' />
					</Button>
					<Button
						size='lg'
						variant='outline'
						className='bg-background/50 backdrop-blur-sm hover:bg-background/70 font-sans-romero w-full sm:w-auto text-base py-6 sm:py-3'
						onClick={() => scrollToSection('catalogo-interactivo')}
					>
						Contáctanos
						<Phone className='w-4 h-4' />
					</Button>
				</div>
			</div>
		</section>
	);
};
