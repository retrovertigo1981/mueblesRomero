import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-furniture.jpg';

export const Hero = () => {
	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		element?.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<section className='relative pt-32 pb-20 px-4 overflow-hidden'>
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
			<div className='container mx-auto text-center max-w-4xl relative z-10'>
				<h1 className='text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight font-serif-display'>
					Transforma tu Hogar con
					<span className='text-primary block mt-2'>Muebles que Inspiran</span>
				</h1>
				<p className='text-xl text-foreground/80 mb-8 max-w-2xl mx-auto font-medium font-sans-romero'>
					Descubre nuestra colección de muebles modernos y personalízalos a tu
					gusto. Cambia colores, combina estilos y crea el espacio perfecto.
				</p>
				<div className='flex gap-4 justify-center flex-wrap'>
					<Button
						size='lg'
						className='gap-2 shadow-hover hover:shadow-soft transition-all font-sans-romero'
						onClick={() => scrollToSection('catalogo-clasico')}
					>
						Ver Catálogo
						<ArrowRight className='w-4 h-4' />
					</Button>
					<Button
						size='lg'
						variant='outline'
						className='bg-background/50 backdrop-blur-sm hover:bg-background/70 font-sans-romero'
						onClick={() => scrollToSection('catalogo-interactivo')}
					>
						Personalizar Muebles
					</Button>
				</div>
			</div>
		</section>
	);
};
