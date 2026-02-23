import { Helmet } from 'react-helmet-async';
import { Hero } from '@/components/Hero';
import { Marquesina } from '@/components/Marquesina';
import { SelectCatalog } from '@/components/SelectCatalog';
import { MediosPagos } from '@/components/MediosPagos';
import { FloatingWhatsApp } from 'react-floating-whatsapp';

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
				<Hero />
				<Marquesina />
				<MediosPagos />
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
