import { Helmet } from 'react-helmet-async';
import { Contact } from '@/components/Contact';

const ContactPage = () => {
	return (
		<>
			<Helmet>
				<title>Contáctanos | Muebles El Romero</title>
				<meta
					name='description'
					content='Ponte en contacto con Muebles El Romero. Estamos ubicados en La Granja, Santiago, Chile. Teléfono: +569 8344 2725. Email: contacto@muebleselromero.cl'
				/>
				<meta
					name='keywords'
					content='contacto muebles, muebles santiago, muebles romero, teléfono muebles'
				/>
				<link rel='canonical' href='https://muebleselromero.cl/contacto' />
			</Helmet>
			<div className='min-h-screen'>
				<Contact />
			</div>
		</>
	);
};

export default ContactPage;
