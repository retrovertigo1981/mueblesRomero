import { useState, useEffect } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Interfaces (ajustadas para combinaciones)
interface Variant {
	mesaColor: string;
	sillaColor: string;
	imageUrl: string;
}

interface ProductApi {
	id: number;
	title: { rendered: string };
	acf: {
		category: string;
		thumbnail: string; // ACF para thumb
		variants: Variant[]; // Asumir ACF array de variants
	};
}

interface CleanProduct {
	id: number;
	title: string;
	thumbnail: string;
	variants: Variant[];
}

// Mocks temporales (reemplaza con WP fetch)
const productsMock: CleanProduct[] = [
	{
		id: 1,
		title: 'Comedor Aurora',
		thumbnail: '/images/comedor-aurora/thumb.jpg',
		variants: [
			{
				mesaColor: 'roble',
				sillaColor: 'beige',
				imageUrl: '/images/comedor-aurora/roble-beige.jpg',
			},
			{
				mesaColor: 'roble',
				sillaColor: 'gris',
				imageUrl: '/images/comedor-aurora/roble-gris.jpg',
			},
			{
				mesaColor: 'cerezo',
				sillaColor: 'beige',
				imageUrl: '/images/comedor-aurora/cerezo-beige.jpg',
			},
			{
				mesaColor: 'cerezo',
				sillaColor: 'gris',
				imageUrl: '/images/comedor-aurora/cerezo-gris.jpg',
			},
		],
	},
	{
		id: 2,
		title: 'Mesa Nórdica',
		thumbnail: '/images/mesa-nordica/thumb.jpg',
		variants: [
			{
				mesaColor: 'blanco',
				sillaColor: 'negro',
				imageUrl: '/images/mesa-nordica/blanco-negro.jpg',
			},
			{
				mesaColor: 'blanco',
				sillaColor: 'madera',
				imageUrl: '/images/mesa-nordica/blanco-madera.jpg',
			},
			{
				mesaColor: 'nogal',
				sillaColor: 'negro',
				imageUrl: '/images/mesa-nordica/nogal-negro.jpg',
			},
			{
				mesaColor: 'nogal',
				sillaColor: 'madera',
				imageUrl: '/images/mesa-nordica/nogal-madera.jpg',
			},
		],
	},
	// Agrega más...
];

const cleanDataProducts = (dataApi: ProductApi[]): CleanProduct[] => {
	return dataApi
		.filter((item) => item.acf.category === 'Personalizable') // Filtra solo personalizables
		.map((item) => ({
			id: item.id,
			title: item.title.rendered,
			thumbnail: item.acf.thumbnail,
			variants: item.acf.variants || [], // Asegura array
		}));
};

export const InteractiveShowroom = () => {
	const [products, setProducts] = useState<CleanProduct[]>(productsMock); // Cambia a [] y usa fetch
	const [selectedProduct, setSelectedProduct] = useState<CleanProduct | null>(
		products[0] ?? null
	);
	const [selectedMesaColor, setSelectedMesaColor] = useState<string>('');
	const [selectedSillaColor, setSelectedSillaColor] = useState<string>('');
	const [currentImage, setCurrentImage] = useState<string>('');
	const [isFading, setIsFading] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch real de WP (descomenta y quita mocks)
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					'http://localhost:8881/wp-json/wp/v2/productos'
				); // Cambia URL en prod
				if (!response.ok) throw new Error('Error fetching products');
				const rawData: ProductApi[] = await response.json();
				const cleanData = cleanDataProducts(rawData);
				setProducts(cleanData);
				if (cleanData.length > 0) setSelectedProduct(cleanData[0]);
			} catch (err) {
				if (err instanceof Error) {
					setError('Error al cargar los muebles personalizables.');
				}
			} finally {
				setLoading(false);
			}
		};
		fetchProducts(); // Descomenta para real
	}, []);

	// Actualiza colores defaults y imagen al cambiar producto
	useEffect(() => {
		if (selectedProduct && selectedProduct.variants.length > 0) {
			const defaultVariant = selectedProduct.variants[0];
			setSelectedMesaColor(defaultVariant.mesaColor);
			setSelectedSillaColor(defaultVariant.sillaColor);
			setCurrentImage(defaultVariant.imageUrl);
		}
	}, [selectedProduct]);

	// Actualiza imagen con fade al cambiar colores
	useEffect(() => {
		if (selectedProduct && selectedMesaColor && selectedSillaColor) {
			const matchingVariant = selectedProduct.variants.find(
				(v) =>
					v.mesaColor === selectedMesaColor &&
					v.sillaColor === selectedSillaColor
			);
			if (matchingVariant) {
				setIsFading(true);
				setTimeout(() => {
					setCurrentImage(matchingVariant.imageUrl);
					setIsFading(false);
				}, 200); // Duración fade
			}
		}
	}, [selectedMesaColor, selectedSillaColor, selectedProduct]);

	// Colores únicos para selects (extraídos de variants)
	const getUniqueMesaColors = () => {
		if (!selectedProduct) return [];
		return [...new Set(selectedProduct.variants.map((v) => v.mesaColor))];
	};

	const getUniqueSillaColors = () => {
		if (!selectedProduct) return [];
		return [...new Set(selectedProduct.variants.map((v) => v.sillaColor))];
	};

	if (loading)
		return (
			<div className='min-h-screen flex items-center justify-center'>
				Cargando...
			</div>
		);
	if (error)
		return (
			<div className='min-h-screen flex items-center justify-center text-destructive'>
				{error}
			</div>
		);

	return (
		<section
			id='catalogo-interactivo'
			className='min-h-screen py-8 px-4 bg-background'
		>
			<div className='max-w-5xl mx-auto'>
				{/* Header */}
				<div className='text-center mb-6'>
					<h2 className='text-3xl font-bold'>Catálogo Interactivo</h2>
					<p className='text-muted-foreground'>
						Elige un mueble y personaliza colores de mesa y silla.
					</p>
				</div>

				{/* Mobile: Lista horizontal de muebles */}
				<div className='md:hidden overflow-x-auto py-4 mb-6'>
					<div className='flex gap-4'>
						{products.map((p) => (
							<Card
								key={p.id}
								onClick={() => setSelectedProduct(p)}
								className={`cursor-pointer min-w-[150px] transition-shadow ${
									selectedProduct?.id === p.id ? 'ring-2 ring-primary' : ''
								}`}
							>
								<CardContent className='p-2'>
									<img
										src={p.thumbnail}
										alt={p.title}
										className='w-full h-32 object-cover rounded-md mb-2'
									/>
									<p className='text-sm font-medium text-center'>{p.title}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Layout Principal: Mobile stacked, Desktop grid */}
				<div className='grid md:grid-cols-[1fr_3fr_1fr] gap-6'>
					{/* Desktop: Lista vertical de muebles */}
					<div className='hidden md:block'>
						<h3 className='text-lg font-semibold mb-4'>Muebles Disponibles</h3>
						<div className='space-y-4'>
							{products.map((p) => (
								<Card
									key={p.id}
									onClick={() => setSelectedProduct(p)}
									className={`cursor-pointer transition-shadow ${
										selectedProduct?.id === p.id ? 'ring-2 ring-primary' : ''
									}`}
								>
									<CardContent className='p-4 flex items-center gap-4'>
										<img
											src={p.thumbnail}
											alt={p.title}
											className='w-16 h-16 object-cover rounded'
										/>
										<p className='font-medium'>{p.title}</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Preview Imagen */}
					<div className='col-span-1 md:col-span-1'>
						<div className='aspect-[4/3] rounded-xl overflow-hidden shadow-soft relative'>
							<img
								src={currentImage}
								alt={`${selectedProduct?.title} - ${selectedMesaColor}/${selectedSillaColor}`}
								className={`w-full h-full object-cover transition-opacity duration-300 ${
									isFading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
								}`}
								loading='lazy'
							/>
						</div>
					</div>

					{/* Controls: Selects para colores */}
					<div className='space-y-6'>
						<div>
							<label className='block text-sm font-medium mb-2'>
								Color de Mesa
							</label>
							<Select
								value={selectedMesaColor}
								onValueChange={setSelectedMesaColor}
							>
								<SelectTrigger>
									<SelectValue placeholder='Elige color' />
								</SelectTrigger>
								<SelectContent>
									{getUniqueMesaColors().map((color) => (
										<SelectItem key={color} value={color}>
											{color.charAt(0).toUpperCase() + color.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className='block text-sm font-medium mb-2'>
								Color de Silla
							</label>
							<Select
								value={selectedSillaColor}
								onValueChange={setSelectedSillaColor}
							>
								<SelectTrigger>
									<SelectValue placeholder='Elige color' />
								</SelectTrigger>
								<SelectContent>
									{getUniqueSillaColors().map((color) => (
										<SelectItem key={color} value={color}>
											{color.charAt(0).toUpperCase() + color.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button className='w-full'>Añadir al Carrito</Button>
					</div>
				</div>
			</div>
		</section>
	);
};

// componente original

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import {
// 	Drawer,
// 	DrawerContent,
// 	DrawerHeader,
// 	DrawerTitle,
// 	DrawerTrigger,
// } from '@/components/ui/drawer';
// import { Palette, Check } from 'lucide-react';
// import roomScene from '@/assets/room-scene.jpg';

// const colorPresets = [
// 	{ name: 'Roble', value: '#8B4513' },
// 	{ name: 'Cerezo', value: '#CD5C5C' },
// 	{ name: 'Nogal', value: '#654321' },
// 	{ name: 'Blanco', value: '#F5F5F5' },
// 	{ name: 'Negro', value: '#2C2C2C' },
// 	{ name: 'Gris', value: '#808080' },
// ];

// const wallColorPresets = [
// 	{ name: 'Beige', value: '#D4C4B0' },
// 	{ name: 'Blanco', value: '#F5F5F5' },
// 	{ name: 'Gris', value: '#A0A0A0' },
// 	{ name: 'Azul', value: '#B8C5D6' },
// 	{ name: 'Verde', value: '#C4D4C0' },
// 	{ name: 'Rosa', value: '#E8D4D0' },
// ];

// type ColorSection = 'wall' | 'table' | 'chair';

// export const InteractiveShowroom = () => {
// 	const [wallColor, setWallColor] = useState('#D4C4B0');
// 	const [tableColor, setTableColor] = useState('#8B4513');
// 	const [chairColor, setChairColor] = useState('#6B7C60');
// 	const [activeSection, setActiveSection] = useState<ColorSection>('wall');

// 	const ColorSelector = ({
// 		section,
// 		color,
// 		setColor,
// 		presets,
// 	}: {
// 		section: string;
// 		color: string;
// 		setColor: (color: string) => void;
// 		presets: typeof colorPresets | typeof wallColorPresets;
// 	}) => (
// 		<div className='space-y-3'>
// 			<div className='flex items-center justify-between'>
// 				<h3 className='text-sm font-medium text-foreground'>{section}</h3>
// 				<div className='flex items-center gap-2'>
// 					<div
// 						className='w-6 h-6 rounded-full border-2 border-border shadow-sm'
// 						style={{ backgroundColor: color }}
// 					/>
// 				</div>
// 			</div>

// 			<div className='grid grid-cols-6 gap-2'>
// 				{presets.map((preset) => (
// 					<button
// 						key={preset.name}
// 						onClick={() => setColor(preset.value)}
// 						className='group relative aspect-square rounded-lg border-2 transition-all hover:scale-110 active:scale-95'
// 						style={{
// 							backgroundColor: preset.value,
// 							borderColor:
// 								color === preset.value
// 									? 'hsl(var(--primary))'
// 									: 'hsl(var(--border))',
// 						}}
// 						title={preset.name}
// 					>
// 						{color === preset.value && (
// 							<Check className='absolute inset-0 m-auto w-4 h-4 text-primary-foreground drop-shadow' />
// 						)}
// 					</button>
// 				))}
// 			</div>

// 			<input
// 				type='color'
// 				value={color}
// 				onChange={(e) => setColor(e.target.value)}
// 				className='w-full h-10 rounded-lg border-2 border-border cursor-pointer'
// 			/>
// 		</div>
// 	);

// 	return (
// 		<section
// 			id='catalogo-interactivo'
// 			className='min-h-screen py-8 px-4 md:py-16 bg-background'
// 		>
// 			<div className='container mx-auto max-w-7xl'>
// 				{/* Header */}
// 				<div className='text-center mb-8 md:mb-12'>
// 					<h2 className='text-3xl md:text-4xl font-bold mb-3 text-foreground'>
// 						Personalizador Interactivo
// 					</h2>
// 					<p className='text-muted-foreground text-sm md:text-base max-w-2xl mx-auto'>
// 						Visualiza tu espacio con diferentes colores
// 					</p>
// 				</div>

// 				{/* Mobile Layout */}
// 				<div className='md:hidden space-y-4'>
// 					{/* Image Preview */}
// 					<div className='relative aspect-[4/3] rounded-xl overflow-hidden shadow-soft'>
// 						<img
// 							src={roomScene}
// 							alt='Room scene'
// 							className='w-full h-full object-cover'
// 						/>

// 						{/* Wall Color Overlay */}
// 						<div
// 							className='absolute inset-0 mix-blend-multiply opacity-40 transition-all duration-500'
// 							style={{
// 								backgroundColor: wallColor,
// 								clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 85%)',
// 							}}
// 						/>

// 						{/* Table Color Overlay */}
// 						<div
// 							className='absolute inset-0 mix-blend-color opacity-50 transition-all duration-500'
// 							style={{
// 								backgroundColor: tableColor,
// 								clipPath: 'polygon(8% 45%, 92% 45%, 92% 75%, 8% 75%)',
// 							}}
// 						/>

// 						{/* Chair Color Overlay */}
// 						<div
// 							className='absolute inset-0 mix-blend-color opacity-45 transition-all duration-500'
// 							style={{
// 								backgroundColor: chairColor,
// 								clipPath: 'polygon(72% 35%, 98% 35%, 98% 80%, 72% 80%)',
// 							}}
// 						/>
// 					</div>

// 					{/* Quick Color Indicators */}
// 					<div className='flex items-center justify-center gap-4 px-4'>
// 						<button
// 							onClick={() => setActiveSection('wall')}
// 							className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
// 								activeSection === 'wall'
// 									? 'border-primary bg-primary/10'
// 									: 'border-border bg-card'
// 							}`}
// 						>
// 							<div
// 								className='w-4 h-4 rounded-full border'
// 								style={{ backgroundColor: wallColor }}
// 							/>
// 							<span className='text-xs font-medium'>Pared</span>
// 						</button>
// 						<button
// 							onClick={() => setActiveSection('table')}
// 							className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
// 								activeSection === 'table'
// 									? 'border-primary bg-primary/10'
// 									: 'border-border bg-card'
// 							}`}
// 						>
// 							<div
// 								className='w-4 h-4 rounded-full border'
// 								style={{ backgroundColor: tableColor }}
// 							/>
// 							<span className='text-xs font-medium'>Mesa</span>
// 						</button>
// 						<button
// 							onClick={() => setActiveSection('chair')}
// 							className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
// 								activeSection === 'chair'
// 									? 'border-primary bg-primary/10'
// 									: 'border-border bg-card'
// 							}`}
// 						>
// 							<div
// 								className='w-4 h-4 rounded-full border'
// 								style={{ backgroundColor: chairColor }}
// 							/>
// 							<span className='text-xs font-medium'>Silla</span>
// 						</button>
// 					</div>

// 					{/* Color Controls Drawer */}
// 					<Drawer>
// 						<DrawerTrigger asChild>
// 							<Button className='w-full' size='lg'>
// 								<Palette className='w-5 h-5 mr-2' />
// 								Cambiar Colores
// 							</Button>
// 						</DrawerTrigger>
// 						<DrawerContent className='px-4 pb-8'>
// 							<DrawerHeader>
// 								<DrawerTitle>Seleccionar Colores</DrawerTitle>
// 							</DrawerHeader>
// 							<div className='space-y-6 mt-4'>
// 								{activeSection === 'wall' && (
// 									<ColorSelector
// 										section='Color de Pared'
// 										color={wallColor}
// 										setColor={setWallColor}
// 										presets={wallColorPresets}
// 									/>
// 								)}
// 								{activeSection === 'table' && (
// 									<ColorSelector
// 										section='Color de Mesa'
// 										color={tableColor}
// 										setColor={setTableColor}
// 										presets={colorPresets}
// 									/>
// 								)}
// 								{activeSection === 'chair' && (
// 									<ColorSelector
// 										section='Color de Silla'
// 										color={chairColor}
// 										setColor={setChairColor}
// 										presets={colorPresets}
// 									/>
// 								)}
// 							</div>
// 						</DrawerContent>
// 					</Drawer>
// 				</div>

// 				{/* Desktop Layout */}
// 				<div className='hidden md:grid md:grid-cols-2 gap-8 lg:gap-12'>
// 					{/* Preview */}
// 					<div className='space-y-4'>
// 						<div className='aspect-[4/3] rounded-xl overflow-hidden shadow-soft sticky top-8'>
// 							<img
// 								src={roomScene}
// 								alt='Room scene'
// 								className='w-full h-full object-cover'
// 							/>

// 							<div
// 								className='absolute inset-0 mix-blend-multiply opacity-40 transition-all duration-500'
// 								style={{
// 									backgroundColor: wallColor,
// 									clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 85%)',
// 								}}
// 							/>

// 							<div
// 								className='absolute inset-0 mix-blend-color opacity-50 transition-all duration-500'
// 								style={{
// 									backgroundColor: tableColor,
// 									clipPath: 'polygon(8% 45%, 92% 45%, 92% 75%, 8% 75%)',
// 								}}
// 							/>

// 							<div
// 								className='absolute inset-0 mix-blend-color opacity-45 transition-all duration-500'
// 								style={{
// 									backgroundColor: chairColor,
// 									clipPath: 'polygon(72% 35%, 98% 35%, 98% 80%, 72% 80%)',
// 								}}
// 							/>
// 						</div>
// 					</div>

// 					{/* Controls */}
// 					<div className='space-y-6'>
// 						<ColorSelector
// 							section='Color de Pared'
// 							color={wallColor}
// 							setColor={setWallColor}
// 							presets={wallColorPresets}
// 						/>

// 						<div className='border-t border-border my-6' />

// 						<ColorSelector
// 							section='Color de Mesa'
// 							color={tableColor}
// 							setColor={setTableColor}
// 							presets={colorPresets}
// 						/>

// 						<div className='border-t border-border my-6' />

// 						<ColorSelector
// 							section='Color de Silla'
// 							color={chairColor}
// 							setColor={setChairColor}
// 							presets={colorPresets}
// 						/>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	);
// };
