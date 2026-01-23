import { Helmet } from 'react-helmet-async';
import { Hero } from '@/components/Hero';
import { SelectCatalog } from '@/components/SelectCatalog';

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
				<SelectCatalog />
			</div>
		</>
	);
};

export default Index;
