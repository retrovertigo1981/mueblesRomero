import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import heroClasico from '@/assets/portada_catalogo_clasico.webp';
import heroInteractivo from '@/assets/portada_catalogo_interactivo.webp';
import { useNavigate } from 'react-router-dom';

export const SelectCatalog = () => {
	const navigate = useNavigate();
	return (
		<section
			id='selector-catalogo'
			className='py-6 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 bg-background'
		>
			<div className='container mx-auto max-w-7xl'>
				<div className='text-center mb-4 sm:mb-10 md:mb-12'>
					<h2 className='text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-foreground font-serif-display'>
						Selecciona el Catálogo de tu Interés
					</h2>
					<p className='text-muted-foreground text-xs sm:text-base md:text-lg max-w-2xl mx-auto font-sans-romero px-4'>
						Explora nuestra colección de muebles cuidadosamente elaborados
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-3xl mx-auto'>
					<Card className='group hover:shadow-hover transition-all duration-300 overflow-hidden border-border bg-gradient-card'>
						<CardContent className='p-0'>
							{/* En mobile: altura fija compacta. En sm+: vuelve al aspect-square original */}
							<div className='h-36 sm:h-auto sm:aspect-square bg-muted overflow-hidden'>
								<img
									src={heroClasico}
									alt='Hero Catalogo Tradicional'
									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
								/>
							</div>
						</CardContent>
						<CardFooter className='flex flex-col items-start gap-2 p-3 sm:p-6'>
							<Button
								onClick={() => navigate('/catalogo-clasico')}
								className='w-full h-10 sm:h-14 shadow-soft hover:shadow-hover transition-all text-sm sm:text-lg py-2 sm:py-6'
							>
								Catálogo Clásico
							</Button>
						</CardFooter>
					</Card>

					<Card className='group hover:shadow-hover transition-all duration-300 overflow-hidden border-border bg-gradient-card'>
						<CardContent className='p-0'>
							<div className='h-36 sm:h-auto sm:aspect-square bg-muted overflow-hidden'>
								<img
									src={heroInteractivo}
									alt='Hero Catalogo Interactivo'
									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
								/>
							</div>
						</CardContent>
						<CardFooter className='flex flex-col items-start gap-2 p-3 sm:p-6'>
							<Button
								onClick={() => navigate('/catalogo-interactivo')}
								className='w-full h-10 sm:h-14 shadow-soft hover:shadow-hover transition-all text-sm sm:text-lg py-2 sm:py-6'
							>
								Catálogo Interactivo
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</section>
	);
};




// import { Card, CardContent, CardFooter } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import heroClasico from '@/assets/catalogo_tradicional_hero.png';
// import heroInteractivo from '@/assets/product-desk.jpg';
// import { useNavigate } from 'react-router-dom';

// export const SelectCatalog = () => {
// 	const navigate = useNavigate();
// 	return (
// 		<section
// 			id='selector-catalogo'
// 			className='py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 bg-background'
// 		>
// 			<div className='container mx-auto max-w-7xl'>
// 				<div className='text-center mb-8 sm:mb-10 md:mb-12'>
// 					<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground font-serif-display'>
// 						Selecciona el Catálogo de tu Interés
// 					</h2>
// 					<p className='text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-sans-romero px-4'>
// 						Explora nuestra colección de muebles cuidadosamente elaborados
// 					</p>
// 				</div>

// 				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto'>
// 					<Card className='group hover:shadow-hover transition-all duration-300 overflow-hidden border-border bg-gradient-card'>
// 						<CardContent className='p-0'>
// 							<div className='aspect-square bg-muted overflow-hidden'>
// 								<img
// 									src={heroClasico}
// 									alt='Hero Catalogo Tradicional'
// 									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
// 								/>
// 							</div>
// 						</CardContent>
// 						<CardFooter className='flex flex-col items-start gap-3 p-4 sm:p-6'>
// 							<Button
// 								onClick={() => navigate('/catalogo-clasico')}
// 								className='w-full h-14 shadow-soft hover:shadow-hover transition-all text-sm sm:text-lg py-5 sm:py-6'
// 							>
// 								Catálogo Clásico
// 							</Button>
// 						</CardFooter>
// 					</Card>
// 					<Card className='group hover:shadow-hover transition-all duration-300 overflow-hidden border-border bg-gradient-card'>
// 						<CardContent className='p-0'>
// 							<div className='aspect-square bg-muted overflow-hidden'>
// 								<img
// 									src={heroInteractivo}
// 									alt='Hero Catalogo Interactivo'
// 									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
// 								/>
// 							</div>
// 						</CardContent>
// 						<CardFooter className='flex flex-col items-start gap-3 p-4 sm:p-6'>
// 							<Button
// 								onClick={() => navigate('/catalogo-interactivo')}
// 								className='w-full h-14 shadow-soft hover:shadow-hover transition-all text-sm sm:text-lg py-5 sm:py-6'
// 							>
// 								Catálogo Interactivo
// 							</Button>
// 						</CardFooter>
// 					</Card>
// 				</div>
// 			</div>
// 		</section>
// 	);
// };
