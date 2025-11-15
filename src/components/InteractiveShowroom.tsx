import React, {
	useEffect,
	useState,
	useCallback,
	useRef,
	useMemo,
} from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check } from 'lucide-react';

// Definición de colores de tela
interface ColorTela {
	id: string;
	nombre: string;
	hex: string;
	rgb: { r: number; g: number; b: number };
	lab?: { l: number; a: number; b: number }; // Pre-calculado
}

// Paleta de colores reales
const COLORES_TELA: ColorTela[] = [
	{
		id: 'crudo',
		nombre: 'Crudo',
		hex: '#E2D3BE',
		rgb: { r: 220, g: 205, b: 184 },
	},
	{
		id: 'beige',
		nombre: 'Beige',
		hex: '#D0BCA1',
		rgb: { r: 208, g: 188, b: 161 },
	},
	{
		id: 'gris-plata',
		nombre: 'Gris Plata',
		hex: '#928A7D',
		rgb: { r: 146, g: 138, b: 125 },
	},
	{
		id: 'gris',
		nombre: 'Gris',
		hex: '#9FA5A3',
		rgb: { r: 159, g: 165, b: 163 },
	},
	{
		id: 'camel',
		nombre: 'Camel',
		hex: '#906739',
		rgb: { r: 144, g: 103, b: 57 },
	},
	{
		id: 'ocre',
		nombre: 'Ocre',
		hex: '#D88E37',
		rgb: { r: 216, g: 142, b: 55 },
	},
	{
		id: 'marron',
		nombre: 'Marrón',
		hex: '#873720',
		rgb: { r: 135, g: 55, b: 32 },
	},
	{
		id: 'verde',
		nombre: 'Verde',
		hex: '#3E5646',
		rgb: { r: 62, g: 86, b: 70 },
	},
	{
		id: 'turquesa',
		nombre: 'Turquesa',
		hex: '#4C8F95',
		rgb: { r: 76, g: 143, b: 149 },
	},
	{
		id: 'azulino',
		nombre: 'Azulino',
		hex: '#306392',
		rgb: { r: 48, g: 99, b: 146 },
	},
	{
		id: 'rojo',
		nombre: 'Rojo',
		hex: '#B4172C',
		rgb: { r: 180, g: 23, b: 44 },
	},
	{
		id: 'chocolate',
		nombre: 'Chocolate',
		hex: '#4F4134',
		rgb: { r: 79, g: 65, b: 52 },
	},
	{
		id: 'gris-oscuro',
		nombre: 'Gris Oscuro',
		hex: '#5F5C55',
		rgb: { r: 95, g: 92, b: 85 },
	},
];

interface InteractiveShowroomProps {
	baseImageUrl: string;
	maskImageUrl: string;
	woodMaskImageUrl: string;
	defaultColorId?: string; // Ahora usa ID de paleta
	defaultWoodColor?: string;
	width?: number;
	height?: number;
	onColorChange?: (colorId: string, hex: string) => void;
	onWoodColorChange?: (color: string) => void;
	className?: string;
}

export const InteractiveShowroom: React.FC<InteractiveShowroomProps> = ({
	baseImageUrl,
	maskImageUrl,
	woodMaskImageUrl,
	defaultColorId = 'beige',
	defaultWoodColor = '#8B4513',
	width = 600,
	height = 450,
	onColorChange,
	onWoodColorChange,
	className = '',
}) => {
	const [selectedColorId, setSelectedColorId] = useState(defaultColorId);
	const [woodColor, setWoodColor] = useState(defaultWoodColor);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processedMask, setProcessedMask] = useState<HTMLCanvasElement | null>(
		null
	);
	const [processedWoodMask, setProcessedWoodMask] =
		useState<HTMLCanvasElement | null>(null);

	const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
	const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
	const [woodImg, setWoodImg] = useState<HTMLImageElement | null>(null);
	const woodTimeoutRef = useRef<number | null>(null);

	const loadImage = (url: string): Promise<HTMLImageElement> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			if (!url.startsWith('/')) {
				img.crossOrigin = 'anonymous';
			}
			img.onload = () => resolve(img);
			img.onerror = (e) => reject(e);
			img.src = url;
		});
	};

	const hexToRgb = (hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
			  }
			: { r: 139, g: 69, b: 19 };
	};

	// RGB to XYZ
	const rgbToXyz = (r: number, g: number, b: number) => {
		r = r / 255;
		g = g / 255;
		b = b / 255;

		r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
		g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
		b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

		r *= 100;
		g *= 100;
		b *= 100;

		const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
		const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
		const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

		return { x, y, z };
	};

	// XYZ to LAB
	const xyzToLab = (x: number, y: number, z: number) => {
		x /= 95.047;
		y /= 100.0;
		z /= 108.883;

		x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
		y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
		z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

		const l = 116 * y - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return { l, a, b };
	};

	// LAB to XYZ
	const labToXyz = (l: number, a: number, b: number) => {
		let y = (l + 16) / 116;
		let x = a / 500 + y;
		let z = y - b / 200;

		x = x > 0.206897 ? Math.pow(x, 3) : (x - 16 / 116) / 7.787;
		y = y > 0.206897 ? Math.pow(y, 3) : (y - 16 / 116) / 7.787;
		z = z > 0.206897 ? Math.pow(z, 3) : (z - 16 / 116) / 7.787;

		x *= 95.047;
		y *= 100.0;
		z *= 108.883;

		return { x, y, z };
	};

	// XYZ to RGB
	const xyzToRgb = (x: number, y: number, z: number) => {
		x /= 100;
		y /= 100;
		z /= 100;

		let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
		let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
		let b = x * 0.0557 + y * -0.204 + z * 1.057;

		r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
		g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
		b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

		r = Math.max(0, Math.min(1, r)) * 255;
		g = Math.max(0, Math.min(1, g)) * 255;
		b = Math.max(0, Math.min(1, b)) * 255;

		return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
	};

	// RGB to LAB
	const rgbToLab = (r: number, g: number, b: number) => {
		const xyz = rgbToXyz(r, g, b);
		return xyzToLab(xyz.x, xyz.y, xyz.z);
	};

	// LAB to RGB
	const labToRgb = (l: number, a: number, b: number) => {
		const xyz = labToXyz(l, a, b);
		return xyzToRgb(xyz.x, xyz.y, xyz.z);
	};

	// Pre-calcular LAB para todos los colores (solo una vez)
	const paletaConLab = useMemo(() => {
		return COLORES_TELA.map((color) => ({
			...color,
			lab: rgbToLab(color.rgb.r, color.rgb.g, color.rgb.b),
		}));
	}, []);

	// Obtener color seleccionado actual
	const selectedColor = useMemo(
		() => paletaConLab.find((c) => c.id === selectedColorId) || paletaConLab[0],
		[selectedColorId, paletaConLab]
	);

	// Cargar imágenes
	useEffect(() => {
		const loadImages = async () => {
			try {
				setLoading(true);
				setError(null);

				const baseImgLoaded = await loadImage(baseImageUrl);
				const maskImgLoaded = await loadImage(maskImageUrl);
				const woodImgLoaded = await loadImage(woodMaskImageUrl);

				setBaseImg(baseImgLoaded);
				setMaskImg(maskImgLoaded);
				setWoodImg(woodImgLoaded);

				setLoading(false);
			} catch (err) {
				console.error('Error loading images:', err);
				setError('Error al cargar las imágenes. Verifica las URLs.');
				setLoading(false);
			}
		};

		loadImages();
	}, [baseImageUrl, maskImageUrl, woodMaskImageUrl]);

	// Función optimizada para aplicar colores de paleta
	const processMaskWithPalette = useCallback(
		(
			maskImage: HTMLImageElement | null,
			colorTela: ColorTela,
			materialType: 'fabric' | 'wood'
		): HTMLCanvasElement | null => {
			if (!maskImage || !colorTela.lab) return null;

			const canvas = document.createElement('canvas');
			canvas.width = maskImage.width;
			canvas.height = maskImage.height;
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			if (!ctx) return null;

			ctx.drawImage(maskImage, 0, 0);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const pixels = imageData.data;

			const targetLab = colorTela.lab;
			const colorIntensity = materialType === 'wood' ? 0.65 : 0.9;

			// Primera pasada: aplicar color preservando textura
			for (let i = 0; i < pixels.length; i += 4) {
				const alpha = pixels[i + 3];

				if (alpha < 30) {
					pixels[i + 3] = 0;
					continue;
				}

				const r = pixels[i];
				const g = pixels[i + 1];
				const b = pixels[i + 2];

				// Extraer luminosidad de la textura de la máscara
				const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
				const maskL = (luminosity / 255) * 100;

				// Mapear luminosidad de máscara al rango del color target
				// Esto preserva variaciones de textura en el rango correcto
				const targetLMin = Math.max(0, targetLab.l - 20);
				const targetLMax = Math.min(100, targetLab.l + 20);
				const adjustedL =
					targetLMin + (maskL / 100) * (targetLMax - targetLMin);

				const blendFactor = (alpha / 255) * colorIntensity;

				// Aplicar cromaticidad del color target
				const finalL = adjustedL;
				const finalA = targetLab.a * blendFactor;
				const finalB = targetLab.b * blendFactor;

				const finalRgb = labToRgb(finalL, finalA, finalB);

				pixels[i] = finalRgb.r;
				pixels[i + 1] = finalRgb.g;
				pixels[i + 2] = finalRgb.b;
				pixels[i + 3] = Math.max(0, alpha - 8);
			}

			// Segunda pasada: post-procesamiento según material
			if (materialType === 'fabric') {
				// Tela: ligero aumento de saturación para realismo
				for (let i = 0; i < pixels.length; i += 4) {
					if (pixels[i + 3] === 0) continue;

					const r = pixels[i];
					const g = pixels[i + 1];
					const b = pixels[i + 2];
					const gray = 0.299 * r + 0.587 * g + 0.114 * b;

					const satFactor = 1.1;
					pixels[i] = Math.max(0, Math.min(255, gray + satFactor * (r - gray)));
					pixels[i + 1] = Math.max(
						0,
						Math.min(255, gray + satFactor * (g - gray))
					);
					pixels[i + 2] = Math.max(
						0,
						Math.min(255, gray + satFactor * (b - gray))
					);
				}
			} else {
				// Madera: aumentar contraste de vetas
				for (let i = 0; i < pixels.length; i += 4) {
					if (pixels[i + 3] === 0) continue;

					const r = pixels[i];
					const g = pixels[i + 1];
					const b = pixels[i + 2];
					const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;

					const contrastFactor = 1.18;
					const adjusted = (luminosity - 128) * contrastFactor + 128;
					const delta = adjusted - luminosity;

					pixels[i] = Math.max(0, Math.min(255, r + delta));
					pixels[i + 1] = Math.max(0, Math.min(255, g + delta));
					pixels[i + 2] = Math.max(0, Math.min(255, b + delta));
				}
			}

			ctx.putImageData(imageData, 0, 0);
			return canvas;
		},
		[]
	);

	// Procesar máscara de tela con color de paleta
	const processMask = useCallback(
		() => processMaskWithPalette(maskImg, selectedColor, 'fabric'),
		[maskImg, selectedColor, processMaskWithPalette]
	);

	// Procesar máscara de madera (aún usa selector libre por ahora)
	const processWoodMask = useCallback((): HTMLCanvasElement | null => {
		if (!woodImg) return null;

		const canvas = document.createElement('canvas');
		canvas.width = woodImg.width;
		canvas.height = woodImg.height;
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return null;

		ctx.drawImage(woodImg, 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const pixels = imageData.data;

		const targetRgb = hexToRgb(woodColor);
		const targetLab = rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b);
		const colorIntensity = 0.65;

		for (let i = 0; i < pixels.length; i += 4) {
			const alpha = pixels[i + 3];

			if (alpha < 30) {
				pixels[i + 3] = 0;
				continue;
			}

			const r = pixels[i];
			const g = pixels[i + 1];
			const b = pixels[i + 2];

			const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
			const maskL = (luminosity / 255) * 100;

			const targetLMin = Math.max(0, targetLab.l - 20);
			const targetLMax = Math.min(100, targetLab.l + 20);
			const adjustedL = targetLMin + (maskL / 100) * (targetLMax - targetLMin);

			const blendFactor = (alpha / 255) * colorIntensity;

			const finalL = adjustedL;
			const finalA = targetLab.a * blendFactor;
			const finalB = targetLab.b * blendFactor;

			const finalRgb = labToRgb(finalL, finalA, finalB);

			pixels[i] = finalRgb.r;
			pixels[i + 1] = finalRgb.g;
			pixels[i + 2] = finalRgb.b;
			pixels[i + 3] = Math.max(0, alpha - 8);
		}

		// Post-procesamiento para madera
		for (let i = 0; i < pixels.length; i += 4) {
			if (pixels[i + 3] === 0) continue;

			const r = pixels[i];
			const g = pixels[i + 1];
			const b = pixels[i + 2];
			const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;

			const contrastFactor = 1.18;
			const adjusted = (luminosity - 128) * contrastFactor + 128;
			const delta = adjusted - luminosity;

			pixels[i] = Math.max(0, Math.min(255, r + delta));
			pixels[i + 1] = Math.max(0, Math.min(255, g + delta));
			pixels[i + 2] = Math.max(0, Math.min(255, b + delta));
		}

		ctx.putImageData(imageData, 0, 0);
		return canvas;
	}, [woodImg, woodColor]);

	useEffect(() => {
		if (baseImg && maskImg) {
			setProcessedMask(processMask());
		}
	}, [baseImg, maskImg, selectedColorId, processMask]);

	useEffect(() => {
		if (baseImg && woodImg) {
			setProcessedWoodMask(processWoodMask());
		}
	}, [baseImg, woodImg, woodColor, processWoodMask]);

	const handleColorSelect = (colorId: string) => {
		const color = paletaConLab.find((c) => c.id === colorId);
		if (!color) return;

		setSelectedColorId(colorId);
		onColorChange?.(colorId, color.hex);
	};

	const handleWoodColorChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newColor = e.target.value;
			setWoodColor(newColor);
			onWoodColorChange?.(newColor);

			if (woodTimeoutRef.current) {
				clearTimeout(woodTimeoutRef.current);
			}
			woodTimeoutRef.current = setTimeout(() => {}, 150);
		},
		[onWoodColorChange]
	);

	if (loading) {
		return (
			<Card className={className}>
				<CardContent className='flex items-center justify-center h-96'>
					<div className='flex flex-col items-center gap-4'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
						<p className='text-muted-foreground'>Cargando showroom...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={className}>
				<CardContent className='flex items-center justify-center h-96'>
					<div className='text-center'>
						<p className='text-destructive font-semibold mb-2'>⚠️ {error}</p>
						<p className='text-sm text-muted-foreground'>
							Por favor, verifica las URLs de las imágenes
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
			{/* Canvas Preview */}
			<Card>
				<CardContent className='p-4'>
					<div className='relative w-full rounded-lg bg-background border'>
						<Stage width={width} height={height}>
							<Layer>
								{baseImg &&
									(() => {
										const scale = Math.min(
											width / baseImg.width,
											height / baseImg.height
										);
										const x = (width - baseImg.width * scale) / 2;
										const y = (height - baseImg.height * scale) / 2;
										return (
											<KonvaImage
												image={baseImg}
												x={x}
												y={y}
												scaleX={scale}
												scaleY={scale}
											/>
										);
									})()}
								{processedWoodMask &&
									woodImg &&
									(() => {
										const scale = Math.min(
											width / woodImg.width,
											height / woodImg.height
										);
										const x = (width - woodImg.width * scale) / 2;
										const y = (height - woodImg.height * scale) / 2;
										return (
											<KonvaImage
												image={processedWoodMask}
												x={x}
												y={y}
												scaleX={scale}
												scaleY={scale}
												globalCompositeOperation='source-over'
												opacity={0.92}
											/>
										);
									})()}
								{processedMask &&
									maskImg &&
									(() => {
										const scale = Math.min(
											width / maskImg.width,
											height / maskImg.height
										);
										const x = (width - maskImg.width * scale) / 2;
										const y = (height - maskImg.height * scale) / 2;
										return (
											<KonvaImage
												image={processedMask}
												x={x}
												y={y}
												scaleX={scale}
												scaleY={scale}
												globalCompositeOperation='source-over'
												opacity={0.95}
											/>
										);
									})()}
							</Layer>
						</Stage>
					</div>
				</CardContent>
			</Card>

			{/* Controls */}
			<Card>
				<CardContent className='p-6 space-y-6'>
					{/* Selector de Color de Tela - Paleta Visual */}
					<div>
						<Label className='text-base font-semibold mb-3 block'>
							🎨 Color de la Tela
						</Label>
						<div className='grid grid-cols-7 gap-2'>
							{paletaConLab.map((color) => (
								<button
									key={color.id}
									onClick={() => handleColorSelect(color.id)}
									className={`
										relative aspect-square rounded-lg overflow-hidden border-2 transition-all
										${
											selectedColorId === color.id
												? 'border-primary ring-2 ring-primary ring-offset-2 scale-105'
												: 'border-muted hover:border-primary/50'
										}
									`}
									title={color.nombre}
								>
									<div
										style={{ backgroundColor: color.hex }}
										className='w-full h-full'
									/>
									{selectedColorId === color.id && (
										<div className='absolute inset-0 flex items-center justify-center bg-black/20'>
											<Check className='w-5 h-5 text-white drop-shadow' />
										</div>
									)}
								</button>
							))}
						</div>
						<p className='text-sm text-muted-foreground mt-2 text-center'>
							Seleccionado:{' '}
							<span className='font-semibold'>{selectedColor.nombre}</span>
							<code className='ml-2 px-2 py-0.5 bg-muted rounded text-xs'>
								{selectedColor.hex}
							</code>
						</p>
					</div>

					{/* Selector de Color de Madera (temporal, hasta que optimices la máscara) */}
					<div className='border-t pt-4'>
						<div className='flex items-center justify-between'>
							<Label
								htmlFor='wood-color-picker'
								className='text-base font-semibold'
							>
								🪵 Color del Barniz de Madera
							</Label>
							<div className='flex items-center gap-3'>
								<input
									id='wood-color-picker'
									type='color'
									value={woodColor}
									onChange={handleWoodColorChange}
									className='h-10 w-20 rounded-md border-2 border-input cursor-pointer transition-transform hover:scale-105'
								/>
								<code className='px-3 py-2 bg-muted rounded-md text-sm font-mono font-semibold'>
									{woodColor.toUpperCase()}
								</code>
							</div>
						</div>
						<p className='text-xs text-amber-600 mt-2 flex items-center gap-1'>
							⚠️ Recuerda optimizar la máscara de madera con textura para
							mejores resultados
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { Stage, Layer, Image as KonvaImage } from 'react-konva';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent } from '@/components/ui/card';
// import { Loader2 } from 'lucide-react';

// interface InteractiveShowroomProps {
// 	baseImageUrl: string;
// 	maskImageUrl: string;
// 	woodMaskImageUrl: string;
// 	defaultColor?: string;
// 	defaultWoodColor?: string;
// 	width?: number;
// 	height?: number;
// 	onColorChange?: (color: string) => void;
// 	onWoodColorChange?: (color: string) => void;
// 	className?: string;
// }

// export const InteractiveShowroom: React.FC<InteractiveShowroomProps> = ({
// 	baseImageUrl,
// 	maskImageUrl,
// 	woodMaskImageUrl,
// 	defaultColor = '#8B4513',
// 	defaultWoodColor = '#8B4513',
// 	width = 600,
// 	height = 450,
// 	onColorChange,
// 	onWoodColorChange,
// 	className = '',
// }) => {
// 	const [color, setColor] = useState(defaultColor);
// 	const [woodColor, setWoodColor] = useState(defaultWoodColor);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState<string | null>(null);
// 	const [processedMask, setProcessedMask] = useState<HTMLCanvasElement | null>(
// 		null
// 	);
// 	const [processedWoodMask, setProcessedWoodMask] =
// 		useState<HTMLCanvasElement | null>(null);

// 	const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
// 	const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
// 	const [woodImg, setWoodImg] = useState<HTMLImageElement | null>(null);
// 	const timeoutRef = useRef<number | null>(null);
// 	const woodTimeoutRef = useRef<number | null>(null);

// 	// Cargar imágenes
// 	useEffect(() => {
// 		const loadImages = async () => {
// 			try {
// 				setLoading(true);
// 				setError(null);

// 				const baseImgLoaded = await loadImage(baseImageUrl);
// 				const maskImgLoaded = await loadImage(maskImageUrl);
// 				const woodImgLoaded = await loadImage(woodMaskImageUrl);

// 				setBaseImg(baseImgLoaded);
// 				setMaskImg(maskImgLoaded);
// 				setWoodImg(woodImgLoaded);

// 				setLoading(false);
// 			} catch (err) {
// 				console.error('Error loading images:', err);
// 				setError('Error al cargar las imágenes. Verifica las URLs.');
// 				setLoading(false);
// 			}
// 		};

// 		loadImages();
// 	}, [baseImageUrl, maskImageUrl, woodMaskImageUrl]);

// 	const loadImage = (url: string): Promise<HTMLImageElement> => {
// 		return new Promise((resolve, reject) => {
// 			const img = new Image();
// 			if (!url.startsWith('/')) {
// 				img.crossOrigin = 'anonymous';
// 			}
// 			img.onload = () => resolve(img);
// 			img.onerror = (e) => reject(e);
// 			img.src = url;
// 		});
// 	};

// 	const hexToRgb = (hex: string) => {
// 		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
// 		return result
// 			? {
// 					r: parseInt(result[1], 16),
// 					g: parseInt(result[2], 16),
// 					b: parseInt(result[3], 16),
// 			  }
// 			: { r: 139, g: 69, b: 19 };
// 	};

// 	// RGB to XYZ
// 	const rgbToXyz = (r: number, g: number, b: number) => {
// 		r = r / 255;
// 		g = g / 255;
// 		b = b / 255;

// 		r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
// 		g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
// 		b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

// 		r *= 100;
// 		g *= 100;
// 		b *= 100;

// 		const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
// 		const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
// 		const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

// 		return { x, y, z };
// 	};

// 	// XYZ to LAB
// 	const xyzToLab = (x: number, y: number, z: number) => {
// 		x /= 95.047;
// 		y /= 100.0;
// 		z /= 108.883;

// 		x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
// 		y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
// 		z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

// 		const l = 116 * y - 16;
// 		const a = 500 * (x - y);
// 		const b = 200 * (y - z);

// 		return { l, a, b };
// 	};

// 	// LAB to XYZ
// 	const labToXyz = (l: number, a: number, b: number) => {
// 		let y = (l + 16) / 116;
// 		let x = a / 500 + y;
// 		let z = y - b / 200;

// 		x = x > 0.206897 ? Math.pow(x, 3) : (x - 16 / 116) / 7.787;
// 		y = y > 0.206897 ? Math.pow(y, 3) : (y - 16 / 116) / 7.787;
// 		z = z > 0.206897 ? Math.pow(z, 3) : (z - 16 / 116) / 7.787;

// 		x *= 95.047;
// 		y *= 100.0;
// 		z *= 108.883;

// 		return { x, y, z };
// 	};

// 	// XYZ to RGB
// 	const xyzToRgb = (x: number, y: number, z: number) => {
// 		x /= 100;
// 		y /= 100;
// 		z /= 100;

// 		let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
// 		let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
// 		let b = x * 0.0557 + y * -0.204 + z * 1.057;

// 		r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
// 		g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
// 		b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

// 		r = Math.max(0, Math.min(1, r)) * 255;
// 		g = Math.max(0, Math.min(1, g)) * 255;
// 		b = Math.max(0, Math.min(1, b)) * 255;

// 		return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
// 	};

// 	// RGB to LAB
// 	const rgbToLab = (r: number, g: number, b: number) => {
// 		const xyz = rgbToXyz(r, g, b);
// 		return xyzToLab(xyz.x, xyz.y, xyz.z);
// 	};

// 	// LAB to RGB
// 	const labToRgb = (l: number, a: number, b: number) => {
// 		const xyz = labToXyz(l, a, b);
// 		return xyzToRgb(xyz.x, xyz.y, xyz.z);
// 	};

// 	// Función optimizada de procesamiento de máscaras
// 	const processMaskOptimized = useCallback(
// 		(
// 			maskImage: HTMLImageElement | null,
// 			targetColor: string,
// 			materialType: 'fabric' | 'wood'
// 		): HTMLCanvasElement | null => {
// 			if (!maskImage) return null;

// 			const canvas = document.createElement('canvas');
// 			canvas.width = maskImage.width;
// 			canvas.height = maskImage.height;
// 			const ctx = canvas.getContext('2d', { willReadFrequently: true });
// 			if (!ctx) return null;

// 			ctx.drawImage(maskImage, 0, 0);
// 			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// 			const pixels = imageData.data;

// 			const targetRgb = hexToRgb(targetColor);
// 			const targetLab = rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b);

// 			// Intensidad de color según material
// 			const colorIntensity = materialType === 'wood' ? 0.65 : 0.88;

// 			// Primera pasada: aplicar color preservando luminosidad
// 			for (let i = 0; i < pixels.length; i += 4) {
// 				const alpha = pixels[i + 3];

// 				if (alpha < 30) {
// 					pixels[i + 3] = 0;
// 					continue;
// 				}

// 				const r = pixels[i];
// 				const g = pixels[i + 1];
// 				const b = pixels[i + 2];

// 				// Extraer SOLO luminosidad de la máscara (sin sesgo de color)
// 				const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;

// 				// Convertir a LAB L (0-100 scale)
// 				const maskL = (luminosity / 255) * 100;

// 				// Factor de blend basado en alpha
// 				const blendFactor = (alpha / 255) * colorIntensity;

// 				// Aplicar color: L de máscara, a/b del target
// 				const finalL = maskL;
// 				const finalA = targetLab.a * blendFactor;
// 				const finalB = targetLab.b * blendFactor;

// 				// Convertir de vuelta a RGB
// 				const finalRgb = labToRgb(finalL, finalA, finalB);

// 				pixels[i] = finalRgb.r;
// 				pixels[i + 1] = finalRgb.g;
// 				pixels[i + 2] = finalRgb.b;

// 				// Reducir alpha ligeramente en bordes para anti-halo
// 				pixels[i + 3] = Math.max(0, alpha - 8);
// 			}

// 			// Segunda pasada: post-procesamiento según material
// 			if (materialType === 'wood') {
// 				// Madera: aumentar contraste de vetas
// 				for (let i = 0; i < pixels.length; i += 4) {
// 					if (pixels[i + 3] === 0) continue;

// 					const r = pixels[i];
// 					const g = pixels[i + 1];
// 					const b = pixels[i + 2];
// 					const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;

// 					const contrastFactor = 1.18;
// 					const adjusted = (luminosity - 128) * contrastFactor + 128;
// 					const delta = adjusted - luminosity;

// 					pixels[i] = Math.max(0, Math.min(255, r + delta));
// 					pixels[i + 1] = Math.max(0, Math.min(255, g + delta));
// 					pixels[i + 2] = Math.max(0, Math.min(255, b + delta));
// 				}
// 			} else {
// 				// Tela: ligero aumento de saturación para colores vibrantes
// 				for (let i = 0; i < pixels.length; i += 4) {
// 					if (pixels[i + 3] === 0) continue;

// 					const r = pixels[i];
// 					const g = pixels[i + 1];
// 					const b = pixels[i + 2];
// 					const gray = 0.299 * r + 0.587 * g + 0.114 * b;

// 					const satFactor = 1.12;
// 					pixels[i] = Math.max(0, Math.min(255, gray + satFactor * (r - gray)));
// 					pixels[i + 1] = Math.max(
// 						0,
// 						Math.min(255, gray + satFactor * (g - gray))
// 					);
// 					pixels[i + 2] = Math.max(
// 						0,
// 						Math.min(255, gray + satFactor * (b - gray))
// 					);
// 				}
// 			}

// 			ctx.putImageData(imageData, 0, 0);
// 			return canvas;
// 		},
// 		[]
// 	);

// 	// Procesar máscara de tela
// 	const processMask = useCallback(
// 		() => processMaskOptimized(maskImg, color, 'fabric'),
// 		[maskImg, color, processMaskOptimized]
// 	);

// 	// Procesar máscara de madera
// 	const processWoodMask = useCallback(
// 		() => processMaskOptimized(woodImg, woodColor, 'wood'),
// 		[woodImg, woodColor, processMaskOptimized]
// 	);

// 	useEffect(() => {
// 		if (baseImg && maskImg) {
// 			setProcessedMask(processMask());
// 		}
// 	}, [baseImg, maskImg, color, processMask]);

// 	useEffect(() => {
// 		if (baseImg && woodImg) {
// 			setProcessedWoodMask(processWoodMask());
// 		}
// 	}, [baseImg, woodImg, woodColor, processWoodMask]);

// 	const handleColorChange = useCallback(
// 		(e: React.ChangeEvent<HTMLInputElement>) => {
// 			const newColor = e.target.value;
// 			setColor(newColor);
// 			onColorChange?.(newColor);

// 			if (timeoutRef.current) {
// 				clearTimeout(timeoutRef.current);
// 			}
// 			timeoutRef.current = setTimeout(() => {}, 150);
// 		},
// 		[onColorChange]
// 	);

// 	const handleWoodColorChange = useCallback(
// 		(e: React.ChangeEvent<HTMLInputElement>) => {
// 			const newColor = e.target.value;
// 			setWoodColor(newColor);
// 			onWoodColorChange?.(newColor);

// 			if (woodTimeoutRef.current) {
// 				clearTimeout(woodTimeoutRef.current);
// 			}
// 			woodTimeoutRef.current = setTimeout(() => {}, 150);
// 		},
// 		[onWoodColorChange]
// 	);

// 	if (loading) {
// 		return (
// 			<Card className={className}>
// 				<CardContent className='flex items-center justify-center h-96'>
// 					<div className='flex flex-col items-center gap-4'>
// 						<Loader2 className='h-8 w-8 animate-spin text-primary' />
// 						<p className='text-muted-foreground'>Cargando showroom...</p>
// 					</div>
// 				</CardContent>
// 			</Card>
// 		);
// 	}

// 	if (error) {
// 		return (
// 			<Card className={className}>
// 				<CardContent className='flex items-center justify-center h-96'>
// 					<div className='text-center'>
// 						<p className='text-destructive font-semibold mb-2'>⚠️ {error}</p>
// 						<p className='text-sm text-muted-foreground'>
// 							Por favor, verifica las URLs de las imágenes
// 						</p>
// 					</div>
// 				</CardContent>
// 			</Card>
// 		);
// 	}

// 	return (
// 		<div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
// 			{/* Canvas Preview */}
// 			<Card>
// 				<CardContent className='p-4'>
// 					<div className='relative w-full rounded-lg bg-background border'>
// 						<Stage width={width} height={height}>
// 							<Layer>
// 								{baseImg &&
// 									(() => {
// 										const scale = Math.min(
// 											width / baseImg.width,
// 											height / baseImg.height
// 										);
// 										const x = (width - baseImg.width * scale) / 2;
// 										const y = (height - baseImg.height * scale) / 2;
// 										return (
// 											<KonvaImage
// 												image={baseImg}
// 												x={x}
// 												y={y}
// 												scaleX={scale}
// 												scaleY={scale}
// 											/>
// 										);
// 									})()}
// 								{processedWoodMask &&
// 									woodImg &&
// 									(() => {
// 										const scale = Math.min(
// 											width / woodImg.width,
// 											height / woodImg.height
// 										);
// 										const x = (width - woodImg.width * scale) / 2;
// 										const y = (height - woodImg.height * scale) / 2;
// 										return (
// 											<KonvaImage
// 												image={processedWoodMask}
// 												x={x}
// 												y={y}
// 												scaleX={scale}
// 												scaleY={scale}
// 												globalCompositeOperation='source-over'
// 												opacity={0.92}
// 											/>
// 										);
// 									})()}
// 								{processedMask &&
// 									maskImg &&
// 									(() => {
// 										const scale = Math.min(
// 											width / maskImg.width,
// 											height / maskImg.height
// 										);
// 										const x = (width - maskImg.width * scale) / 2;
// 										const y = (height - maskImg.height * scale) / 2;
// 										return (
// 											<KonvaImage
// 												image={processedMask}
// 												x={x}
// 												y={y}
// 												scaleX={scale}
// 												scaleY={scale}
// 												globalCompositeOperation='source-over'
// 												opacity={0.95}
// 											/>
// 										);
// 									})()}
// 							</Layer>
// 						</Stage>
// 					</div>
// 				</CardContent>
// 			</Card>

// 			{/* Controls */}
// 			<Card>
// 				<CardContent className='p-4 space-y-4'>
// 					<div className='space-y-4'>
// 						<div className='flex items-center justify-between'>
// 							<Label
// 								htmlFor='wood-color-picker'
// 								className='text-base font-semibold'
// 							>
// 								🪵 Color del Barniz de Madera
// 							</Label>
// 							<div className='flex items-center gap-3'>
// 								<input
// 									id='wood-color-picker'
// 									type='color'
// 									value={woodColor}
// 									onChange={handleWoodColorChange}
// 									className='h-10 w-20 rounded-md border-2 border-input cursor-pointer transition-transform hover:scale-105'
// 								/>
// 								<code className='px-3 py-2 bg-muted rounded-md text-sm font-mono font-semibold'>
// 									{woodColor.toUpperCase()}
// 								</code>
// 							</div>
// 						</div>
// 						<div className='flex items-center justify-between'>
// 							<Label htmlFor='color-picker' className='text-base font-semibold'>
// 								🎨 Color de la Tela
// 							</Label>
// 							<div className='flex items-center gap-3'>
// 								<input
// 									id='color-picker'
// 									type='color'
// 									value={color}
// 									onChange={handleColorChange}
// 									className='h-10 w-20 rounded-md border-2 border-input cursor-pointer transition-transform hover:scale-105'
// 								/>
// 								<code className='px-3 py-2 bg-muted rounded-md text-sm font-mono font-semibold'>
// 									{color.toUpperCase()}
// 								</code>
// 							</div>
// 						</div>
// 					</div>
// 				</CardContent>
// 			</Card>
// 		</div>
// 	);
// };
