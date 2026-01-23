import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
	const location = useLocation();

	useEffect(() => {
		console.error(
			'404 Error: User attempted to access non-existent route:',
			location.pathname,
		);
	}, [location.pathname]);

	return (
		<>
			<Helmet>
				<title>404 - Página no encontrada | Muebles El Romero</title>
				<meta
					name='description'
					content='La página que buscas no existe. Regresa al inicio de Muebles El Romero.'
				/>
				<meta name='robots' content='noindex, nofollow' />
			</Helmet>
			<div className='flex min-h-screen items-center justify-center bg-gray-100'>
				<div className='text-center'>
					<h1 className='mb-4 text-4xl font-bold'>404</h1>
					<p className='mb-4 text-xl text-gray-600'>
						Oops! Página no encontrada
					</p>
					<a href='/' className='text-blue-500 underline hover:text-blue-700'>
						Regresa a Inicio
					</a>
				</div>
			</div>
		</>
	);
};

export default NotFound;
