import { Helmet } from 'react-helmet-async';
import { Hero } from '@/components/Hero';
import { Marquesina } from '@/components/Marquesina';
import { SelectCatalog } from '@/components/SelectCatalog';
import { MediosPagos } from '@/components/MediosPagos';
import { CarruselFotos } from '@/components/CarruselFotos'
import { FloatingWhatsApp } from 'react-floating-whatsapp';
import mueble1 from '@/assets/carrusel_01.webp'
import mueble2 from '@/assets/carrusel_02.webp'
import mueble3 from '@/assets/carrusel_03.webp'
import mueble4 from '@/assets/carrusel_04.webp'

const images = [
	{ src: mueble1, alt: 'Comedor de Madera' },
	{ src: mueble2, alt: 'Comedor de Madera' },
	{ src: mueble3, alt: 'Comedor de Madera' },
	{ src: mueble4, alt: 'Comedor de Madera' }
]

const Index = () => {
	return (
		<>
			<Helmet>
				<title>Muebles El Romero - Muebles de Calidad en Santiago</title>
				<meta
					name='description'
					content='Muebles El Romero - Fabricantes de muebles de calidad en Santiago, Chile. Catálogo de muebles tradicionales y personalizados con diseño interactivo online.'
				/>
				<meta
					name='keywords'
					content='muebles, muebles santiago, muebles chile, muebles personalizados, catálogo muebles, muebles romero'
				/>
				<link rel='canonical' href='https://muebleselromero.cl/' />
			</Helmet>
			<div className='min-h-screen'>
				<Marquesina />
				<MediosPagos />
				<Hero />
				<CarruselFotos images={images} />
				<SelectCatalog />
				<FloatingWhatsApp
					phoneNumber='56983442725'
					accountName='Muebles El Romero'
					avatar='/muebles_romero_logo-removebg.png'
					statusMessage='En línea'
					chatMessage='¡Hola! 👋 ¿En qué podemos ayudarte?'
					placeholder='Escribe tu mensaje aquí...'
					darkMode={false}
					allowClickAway={true}
				/>
			</div>
		</>
	);
};

export default Index;
