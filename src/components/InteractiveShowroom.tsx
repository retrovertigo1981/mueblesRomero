import { useState, useEffect } from 'react';

/**
 * Ejemplo simplificado: reemplaza productsMock por tu fetch desde WP.
 * Reemplaza el <select> por el componente shadcn Combobox/Select cuando quieras.
 */

type Variant = {
	colorSlug: string;
	colorName: string;
	swatch?: string; // puede ser un hex o url pequeño
	imageUrl: string;
};

type Product = {
	id: string;
	title: string;
	thumbnail: string;
	variants: Variant[];
};

const productsMock: Product[] = [
	{
		id: 'mesa-01',
		title: 'Mesa Aurora',
		thumbnail: '/images/mesa-aurora/thumb.jpg',
		variants: [
			{
				colorSlug: 'roble',
				colorName: 'Roble',
				swatch: '#8B4513',
				imageUrl: '/images/mesa-aurora/aurora_roble.jpg',
			},
			{
				colorSlug: 'cerezo',
				colorName: 'Cerezo',
				swatch: '#CD5C5C',
				imageUrl: '/images/mesa-aurora/aurora_cerezo.jpg',
			},
		],
	},
	{
		id: 'comedor-01',
		title: 'Comedor Nórdico',
		thumbnail: '/images/comedor-nordico/thumb.jpg',
		variants: [
			{
				colorSlug: 'blanco',
				colorName: 'Blanco',
				swatch: '#F5F5F5',
				imageUrl: '/images/comedor-nordico/nordico_blanco.jpg',
			},
			{
				colorSlug: 'nogal',
				colorName: 'Nogal',
				swatch: '#654321',
				imageUrl: '/images/comedor-nordico/nordico_nogal.jpg',
			},
		],
	},
];

export const InteractiveShowroom = () => {
	const [products] = useState<Product[]>(productsMock); // en tu app, hacer fetch desde WP y normalizar
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(
		products[0] ?? null
	);
	const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
		() => products[0]?.variants[0] ?? null
	);

	// crossfade state simple
	const [isFading, setIsFading] = useState(false);
	const [imageKey, setImageKey] = useState(0);

	useEffect(() => {
		// When product changes, set default variant
		if (selectedProduct) {
			setSelectedVariant(selectedProduct.variants[0] ?? null);
		}
	}, [selectedProduct]);

	const onSelectVariant = (variantSlug: string) => {
		if (!selectedProduct) return;
		const v = selectedProduct.variants.find((x) => x.colorSlug === variantSlug);
		if (!v) return;
		// Start fade
		setIsFading(true);
		// small timeout for animation duration
		setTimeout(() => {
			setSelectedVariant(v);
			setImageKey((k) => k + 1); // change key to force img reload + animation
			setIsFading(false);
		}, 200); // 200ms crossfade (ajusta según taste)
	};

	return (
		<section
			id='catalogo-interactivo'
			className='min-h-screen py-6 px-4 bg-background'
		>
			<div className='max-w-5xl mx-auto'>
				{/* Header */}
				<div className='text-center mb-4'>
					<h2 className='text-2xl font-bold'>
						Personalizador — Catálogo Interactivo
					</h2>
					<p className='text-sm text-muted-foreground'>
						Selecciona un mueble y cambia entre las variantes disponibles.
					</p>
				</div>

				{/* MOBILE: carousel de productos */}
				<div className='md:hidden'>
					<div className='overflow-x-auto py-2'>
						<ul className='flex gap-3 px-1'>
							{products.map((p) => (
								<li key={p.id} className='min-w-[140px]'>
									<button
										onClick={() => setSelectedProduct(p)}
										className={`w-full text-left rounded-lg p-2 border transition-shadow ${
											selectedProduct?.id === p.id
												? 'ring-2 ring-primary'
												: 'border-border bg-card'
										}`}
									>
										<img
											src={p.thumbnail}
											alt={p.title}
											className='w-full h-24 object-cover rounded-md mb-2'
										/>
										<div className='text-xs font-medium'>{p.title}</div>
									</button>
								</li>
							))}
						</ul>
					</div>

					{/* Preview */}
					<div className='mt-4'>
						<div className='aspect-[4/3] rounded-xl overflow-hidden shadow-soft relative'>
							{/* Imagen principal con crossfade */}
							<img
								key={imageKey} // cambiar key fuerza la transición natural de navegador para reemplazo
								src={selectedVariant?.imageUrl}
								alt={selectedProduct?.title}
								className={`w-full h-full object-cover transition-opacity duration-300 ${
									isFading ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
								}`}
								loading='lazy'
							/>
						</div>

						{/* Compact color selector (mobile) */}
						<div className='mt-3'>
							<label className='text-xs font-medium mb-1 block'>
								Variantes
							</label>

							{/* Native select — reemplaza por shadcn Select/Combobox */}
							<div className='relative'>
								<select
									value={selectedVariant?.colorSlug}
									onChange={(e) => onSelectVariant(e.target.value)}
									className='w-full rounded-lg border h-10 px-3 appearance-none'
								>
									{selectedProduct?.variants.map((v) => (
										<option key={v.colorSlug} value={v.colorSlug}>
											{v.colorName}
										</option>
									))}
								</select>

								{/* swatch a la derecha (puedes integrarlo en opciones del combobox shadcn) */}
								<div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
									<div
										className='w-5 h-5 rounded-full border'
										style={{ background: selectedVariant?.swatch ?? '#ccc' }}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* DESKTOP: grid con preview y panel derecho */}
				<div className='hidden md:grid md:grid-cols-2 gap-8 mt-6'>
					<div>
						<div className='aspect-[4/3] rounded-xl overflow-hidden shadow-soft sticky top-8'>
							<img
								key={imageKey}
								src={selectedVariant?.imageUrl}
								alt={selectedProduct?.title}
								className={`w-full h-full object-cover transition-opacity duration-300 ${
									isFading ? 'opacity-40' : 'opacity-100'
								}`}
								loading='lazy'
							/>
						</div>
					</div>

					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div>
								<h3 className='text-lg font-semibold'>
									{selectedProduct?.title}
								</h3>
								<p className='text-sm text-muted-foreground'>
									Elige la variante que prefieras
								</p>
							</div>
						</div>

						{/* Color selector (desktop) */}
						<div>
							<label className='text-sm font-medium mb-2 block'>
								Variantes
							</label>
							<div className='grid grid-cols-3 gap-3'>
								{selectedProduct?.variants.map((v) => (
									<button
										key={v.colorSlug}
										onClick={() => onSelectVariant(v.colorSlug)}
										className={`flex items-center gap-2 p-2 rounded-lg border transition-transform hover:scale-105 ${
											selectedVariant?.colorSlug === v.colorSlug
												? 'ring-2 ring-primary'
												: 'bg-card'
										}`}
									>
										<div
											className='w-8 h-8 rounded-sm border'
											style={{ background: v.swatch ?? '#eee' }}
										/>
										<div className='text-sm'>{v.colorName}</div>
									</button>
								))}
							</div>
							{/* Si quieres minificar aún más: sustituir el grid por un Select/Combobox shadcn */}
						</div>

						<div className='border-t border-border my-4' />

						{/* Lista de productos completa */}
						<div>
							<label className='text-sm font-medium mb-2 block'>
								Otros muebles
							</label>
							<ul className='grid grid-cols-1 gap-3'>
								{products.map((p) => (
									<li key={p.id}>
										<button
											onClick={() => setSelectedProduct(p)}
											className={`flex items-center gap-3 w-full p-2 rounded-lg border ${
												selectedProduct?.id === p.id
													? 'ring-2 ring-primary'
													: 'bg-card'
											}`}
										>
											<img
												src={p.thumbnail}
												alt={p.title}
												className='w-16 h-12 object-cover rounded'
											/>
											<div className='text-sm'>{p.title}</div>
										</button>
									</li>
								))}
							</ul>
						</div>

						<div className='mt-4'>
							<button className='btn btn-primary w-full'>
								Añadir al carrito
							</button>
						</div>
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
