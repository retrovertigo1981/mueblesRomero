import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { InteractiveShowroom } from '@/components/InteractiveShowroom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ show }: { show: boolean }) => {
	if (!show) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
			<Card className='w-full max-w-md'>
				<CardContent className='flex items-center justify-center h-96 p-6'>
					<div className='flex flex-col items-center gap-4'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
						<p className='text-muted-foreground'>Cargando personalizador...</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

const InteractiveCatalogPage = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	return (
		<>
			<Helmet>
				<title>Diseña tu Mueble Personalizado Online | Muebles El Romero</title>
				<meta
					name='description'
					content='Personaliza tus muebles online con nuestro diseñador interactivo. Elige colores, materiales y estilos para crear muebles únicos fabricados en Santiago, Chile.'
				/>
				<meta
					name='keywords'
					content='muebles personalizados, diseñador muebles online, muebles a medida, muebles santiago'
				/>
				<link
					rel='canonical'
					href='https://muebleselromero.cl/catalogo-interactivo'
				/>
			</Helmet>
			<div className='min-h-screen'>
				<LoadingOverlay show={loading} />
				{error ? (
					<div className='min-h-screen flex items-center justify-center'>
						<Card className='w-full max-w-md'>
							<CardContent className='flex items-center justify-center h-96 p-6'>
								<div className='text-center'>
									<p className='text-destructive font-semibold mb-2'>
										⚠️ {error}
									</p>
									<p className='text-sm text-muted-foreground'>
										Verifica que las imágenes existan en la carpeta assets
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				) : (
					<InteractiveShowroom
						onLoadingChange={setLoading}
						onErrorChange={setError}
					/>
				)}
			</div>
		</>
	);
};

export default InteractiveCatalogPage;
