import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import roomScene from '@/assets/room-scene.jpg';

const colorPresets = [
	{ name: 'Roble', value: '#8B4513' },
	{ name: 'Cerezo', value: '#CD5C5C' },
	{ name: 'Nogal', value: '#654321' },
	{ name: 'Blanco', value: '#F5F5F5' },
	{ name: 'Negro', value: '#2C2C2C' },
	{ name: 'Gris', value: '#808080' },
	{ name: 'Verde', value: '#4A7C59' },
	{ name: 'Azul', value: '#4A6FA5' },
];

const wallColorPresets = [
	{ name: 'Beige Original', value: '#D4C4B0' },
	{ name: 'Blanco', value: '#F5F5F5' },
	{ name: 'Gris', value: '#A0A0A0' },
	{ name: 'Azul Claro', value: '#B8C5D6' },
	{ name: 'Verde Suave', value: '#C4D4C0' },
	{ name: 'Rosa Pastel', value: '#E8D4D0' },
];

export const InteractiveShowroom = () => {
	const [wallColor, setWallColor] = useState('#D4C4B0');
	const [tableColor, setTableColor] = useState('#8B4513');
	const [chairColor, setChairColor] = useState('#6B7C60');

	return (
		<section id='catalogo-interactivo' className='py-20 px-4 bg-muted/30'>
			<div className='container mx-auto'>
				<div className='text-center mb-12'>
					<h2 className='text-4xl font-bold mb-4 text-foreground'>
						Catálogo Interactivo
					</h2>
					<p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
						Personaliza los colores de la pared, mesa y silla de forma
						independiente
					</p>
				</div>

				<div className='grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
					{/* Preview Area */}
					<Card className='lg:sticky lg:top-24 h-fit shadow-hover'>
						<CardContent className='p-8'>
							<div className='aspect-[4/3] rounded-lg relative overflow-hidden'>
								{/* Base Image */}
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

							<div className='mt-6 p-4 bg-muted rounded-lg space-y-2'>
								<h3 className='font-semibold text-foreground'>
									Colores Actuales:
								</h3>
								<div className='grid grid-cols-3 gap-2 text-xs'>
									<div className='flex items-center gap-2'>
										<div
											className='w-4 h-4 rounded border'
											style={{ backgroundColor: wallColor }}
										/>
										<span className='text-muted-foreground'>Pared</span>
									</div>
									<div className='flex items-center gap-2'>
										<div
											className='w-4 h-4 rounded border'
											style={{ backgroundColor: tableColor }}
										/>
										<span className='text-muted-foreground'>Mesa</span>
									</div>
									<div className='flex items-center gap-2'>
										<div
											className='w-4 h-4 rounded border'
											style={{ backgroundColor: chairColor }}
										/>
										<span className='text-muted-foreground'>Silla</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Controls Area */}
					<div className='space-y-6'>
						<div className='space-y-6'>
							{/* Wall Color */}
							<div>
								<Label className='text-base mb-3 block font-semibold'>
									Color de Pared
								</Label>
								<div className='grid grid-cols-3 gap-3 mb-3'>
									{wallColorPresets.map((color) => (
										<button
											key={color.name}
											onClick={() => setWallColor(color.value)}
											className={`h-12 rounded-lg border-2 transition-all hover:scale-105 ${
												wallColor === color.value
													? 'border-primary ring-2 ring-primary/20'
													: 'border-border'
											}`}
											style={{ backgroundColor: color.value }}
											title={color.name}
										/>
									))}
								</div>
								<div className='flex items-center gap-3'>
									<Label className='text-sm min-w-fit'>
										Color personalizado:
									</Label>
									<input
										type='color'
										value={wallColor}
										onChange={(e) => setWallColor(e.target.value)}
										className='h-10 w-full rounded-lg border border-border cursor-pointer'
									/>
								</div>
							</div>

							{/* Table Color */}
							<div>
								<Label className='text-base mb-3 block font-semibold'>
									Color de Mesa
								</Label>
								<div className='grid grid-cols-4 gap-3 mb-3'>
									{colorPresets.map((color) => (
										<button
											key={color.name}
											onClick={() => setTableColor(color.value)}
											className={`h-12 rounded-lg border-2 transition-all hover:scale-105 ${
												tableColor === color.value
													? 'border-primary ring-2 ring-primary/20'
													: 'border-border'
											}`}
											style={{ backgroundColor: color.value }}
											title={color.name}
										/>
									))}
								</div>
								<div className='flex items-center gap-3'>
									<Label className='text-sm min-w-fit'>
										Color personalizado:
									</Label>
									<input
										type='color'
										value={tableColor}
										onChange={(e) => setTableColor(e.target.value)}
										className='h-10 w-full rounded-lg border border-border cursor-pointer'
									/>
								</div>
							</div>

							{/* Chair Color */}
							<div>
								<Label className='text-base mb-3 block font-semibold'>
									Color de Silla
								</Label>
								<div className='grid grid-cols-4 gap-3 mb-3'>
									{colorPresets.map((color) => (
										<button
											key={color.name}
											onClick={() => setChairColor(color.value)}
											className={`h-12 rounded-lg border-2 transition-all hover:scale-105 ${
												chairColor === color.value
													? 'border-primary ring-2 ring-primary/20'
													: 'border-border'
											}`}
											style={{ backgroundColor: color.value }}
											title={color.name}
										/>
									))}
								</div>
								<div className='flex items-center gap-3'>
									<Label className='text-sm min-w-fit'>
										Color personalizado:
									</Label>
									<input
										type='color'
										value={chairColor}
										onChange={(e) => setChairColor(e.target.value)}
										className='h-10 w-full rounded-lg border border-border cursor-pointer'
									/>
								</div>
							</div>
						</div>

						<Button className='w-full shadow-hover' size='lg'>
							Guardar Configuración
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
};
