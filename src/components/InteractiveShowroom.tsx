import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { Palette, Check } from 'lucide-react';
import roomScene from '@/assets/room-scene.jpg';

const colorPresets = [
	{ name: 'Roble', value: '#8B4513' },
	{ name: 'Cerezo', value: '#CD5C5C' },
	{ name: 'Nogal', value: '#654321' },
	{ name: 'Blanco', value: '#F5F5F5' },
	{ name: 'Negro', value: '#2C2C2C' },
	{ name: 'Gris', value: '#808080' },
];

const wallColorPresets = [
	{ name: 'Beige', value: '#D4C4B0' },
	{ name: 'Blanco', value: '#F5F5F5' },
	{ name: 'Gris', value: '#A0A0A0' },
	{ name: 'Azul', value: '#B8C5D6' },
	{ name: 'Verde', value: '#C4D4C0' },
	{ name: 'Rosa', value: '#E8D4D0' },
];

type ColorSection = 'wall' | 'table' | 'chair';

export const InteractiveShowroom = () => {
	const [wallColor, setWallColor] = useState('#D4C4B0');
	const [tableColor, setTableColor] = useState('#8B4513');
	const [chairColor, setChairColor] = useState('#6B7C60');
	const [activeSection, setActiveSection] = useState<ColorSection>('wall');

	const ColorSelector = ({
		section,
		color,
		setColor,
		presets,
	}: {
		section: string;
		color: string;
		setColor: (color: string) => void;
		presets: typeof colorPresets | typeof wallColorPresets;
	}) => (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<h3 className='text-sm font-medium text-foreground'>{section}</h3>
				<div className='flex items-center gap-2'>
					<div
						className='w-6 h-6 rounded-full border-2 border-border shadow-sm'
						style={{ backgroundColor: color }}
					/>
				</div>
			</div>

			<div className='grid grid-cols-6 gap-2'>
				{presets.map((preset) => (
					<button
						key={preset.name}
						onClick={() => setColor(preset.value)}
						className='group relative aspect-square rounded-lg border-2 transition-all hover:scale-110 active:scale-95'
						style={{
							backgroundColor: preset.value,
							borderColor:
								color === preset.value
									? 'hsl(var(--primary))'
									: 'hsl(var(--border))',
						}}
						title={preset.name}
					>
						{color === preset.value && (
							<Check className='absolute inset-0 m-auto w-4 h-4 text-primary-foreground drop-shadow' />
						)}
					</button>
				))}
			</div>

			<input
				type='color'
				value={color}
				onChange={(e) => setColor(e.target.value)}
				className='w-full h-10 rounded-lg border-2 border-border cursor-pointer'
			/>
		</div>
	);

	return (
		<section
			id='catalogo-interactivo'
			className='min-h-screen py-8 px-4 md:py-16 bg-background'
		>
			<div className='container mx-auto max-w-7xl'>
				{/* Header */}
				<div className='text-center mb-8 md:mb-12'>
					<h2 className='text-3xl md:text-4xl font-bold mb-3 text-foreground'>
						Personalizador Interactivo
					</h2>
					<p className='text-muted-foreground text-sm md:text-base max-w-2xl mx-auto'>
						Visualiza tu espacio con diferentes colores
					</p>
				</div>

				{/* Mobile Layout */}
				<div className='md:hidden space-y-4'>
					{/* Image Preview */}
					<div className='relative aspect-[4/3] rounded-xl overflow-hidden shadow-soft'>
						<img
							src={roomScene}
							alt='Room scene'
							className='w-full h-full object-cover'
						/>

						{/* Wall Color Overlay */}
						<div
							className='absolute inset-0 mix-blend-multiply opacity-40 transition-all duration-500'
							style={{
								backgroundColor: wallColor,
								clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 85%)',
							}}
						/>

						{/* Table Color Overlay */}
						<div
							className='absolute inset-0 mix-blend-color opacity-50 transition-all duration-500'
							style={{
								backgroundColor: tableColor,
								clipPath: 'polygon(8% 45%, 92% 45%, 92% 75%, 8% 75%)',
							}}
						/>

						{/* Chair Color Overlay */}
						<div
							className='absolute inset-0 mix-blend-color opacity-45 transition-all duration-500'
							style={{
								backgroundColor: chairColor,
								clipPath: 'polygon(72% 35%, 98% 35%, 98% 80%, 72% 80%)',
							}}
						/>
					</div>

					{/* Quick Color Indicators */}
					<div className='flex items-center justify-center gap-4 px-4'>
						<button
							onClick={() => setActiveSection('wall')}
							className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
								activeSection === 'wall'
									? 'border-primary bg-primary/10'
									: 'border-border bg-card'
							}`}
						>
							<div
								className='w-4 h-4 rounded-full border'
								style={{ backgroundColor: wallColor }}
							/>
							<span className='text-xs font-medium'>Pared</span>
						</button>
						<button
							onClick={() => setActiveSection('table')}
							className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
								activeSection === 'table'
									? 'border-primary bg-primary/10'
									: 'border-border bg-card'
							}`}
						>
							<div
								className='w-4 h-4 rounded-full border'
								style={{ backgroundColor: tableColor }}
							/>
							<span className='text-xs font-medium'>Mesa</span>
						</button>
						<button
							onClick={() => setActiveSection('chair')}
							className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
								activeSection === 'chair'
									? 'border-primary bg-primary/10'
									: 'border-border bg-card'
							}`}
						>
							<div
								className='w-4 h-4 rounded-full border'
								style={{ backgroundColor: chairColor }}
							/>
							<span className='text-xs font-medium'>Silla</span>
						</button>
					</div>

					{/* Color Controls Drawer */}
					<Drawer>
						<DrawerTrigger asChild>
							<Button className='w-full' size='lg'>
								<Palette className='w-5 h-5 mr-2' />
								Cambiar Colores
							</Button>
						</DrawerTrigger>
						<DrawerContent className='px-4 pb-8'>
							<DrawerHeader>
								<DrawerTitle>Seleccionar Colores</DrawerTitle>
							</DrawerHeader>
							<div className='space-y-6 mt-4'>
								{activeSection === 'wall' && (
									<ColorSelector
										section='Color de Pared'
										color={wallColor}
										setColor={setWallColor}
										presets={wallColorPresets}
									/>
								)}
								{activeSection === 'table' && (
									<ColorSelector
										section='Color de Mesa'
										color={tableColor}
										setColor={setTableColor}
										presets={colorPresets}
									/>
								)}
								{activeSection === 'chair' && (
									<ColorSelector
										section='Color de Silla'
										color={chairColor}
										setColor={setChairColor}
										presets={colorPresets}
									/>
								)}
							</div>
						</DrawerContent>
					</Drawer>
				</div>

				{/* Desktop Layout */}
				<div className='hidden md:grid md:grid-cols-2 gap-8 lg:gap-12'>
					{/* Preview */}
					<div className='space-y-4'>
						<div className='aspect-[4/3] rounded-xl overflow-hidden shadow-soft sticky top-8'>
							<img
								src={roomScene}
								alt='Room scene'
								className='w-full h-full object-cover'
							/>

							<div
								className='absolute inset-0 mix-blend-multiply opacity-40 transition-all duration-500'
								style={{
									backgroundColor: wallColor,
									clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 85%)',
								}}
							/>

							<div
								className='absolute inset-0 mix-blend-color opacity-50 transition-all duration-500'
								style={{
									backgroundColor: tableColor,
									clipPath: 'polygon(8% 45%, 92% 45%, 92% 75%, 8% 75%)',
								}}
							/>

							<div
								className='absolute inset-0 mix-blend-color opacity-45 transition-all duration-500'
								style={{
									backgroundColor: chairColor,
									clipPath: 'polygon(72% 35%, 98% 35%, 98% 80%, 72% 80%)',
								}}
							/>
						</div>
					</div>

					{/* Controls */}
					<div className='space-y-6'>
						<ColorSelector
							section='Color de Pared'
							color={wallColor}
							setColor={setWallColor}
							presets={wallColorPresets}
						/>

						<div className='border-t border-border my-6' />

						<ColorSelector
							section='Color de Mesa'
							color={tableColor}
							setColor={setTableColor}
							presets={colorPresets}
						/>

						<div className='border-t border-border my-6' />

						<ColorSelector
							section='Color de Silla'
							color={chairColor}
							setColor={setChairColor}
							presets={colorPresets}
						/>
					</div>
				</div>
			</div>
		</section>
	);
};
