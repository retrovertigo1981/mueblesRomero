import { Helmet } from 'react-helmet-async';
import { OrderForm } from '@/components/OrderForm';

const OrderFormPage = () => {
	return (
		<>
			<Helmet>
				<title>Solicitar Presupuesto de Muebles | Muebles El Romero</title>
				<meta
					name='description'
					content='Solicita presupuesto para tus muebles personalizados. Completa el formulario con tus requerimientos y nos pondremos en contacto contigo.'
				/>
				<meta
					name='keywords'
					content='presupuesto muebles, pedido muebles, muebles personalizados, formulario muebles'
				/>
				<link rel='canonical' href='https://muebleselromero.cl/pedido' />
			</Helmet>
			<OrderForm />
		</>
	);
};

export default OrderFormPage;
