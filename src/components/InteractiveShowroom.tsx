import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { COLORES_TELA } from '@/types/colors';
import { COLORES_MADERA } from '@/types/colors';
import type { Colores } from '@/types/colors';

interface ColorTelaWithLab extends Colores {
	lab: { l: number; a: number; b: number };
}

interface InteractiveShowroomProps {
	baseImageUrl: string;
	maskImageUrl: string;
	woodMaskImageUrl: string;
	defaultColorId?: string; // Ahora usa ID de paleta
	defaultWoodColorId?: string;
	width?: number;
	height?: number;
	onColorChange?: (colorId: string, hex: string) => void;
	onWoodColorChange?: (colorId: string, hex: string) => void;
	className?: string;
}

export const InteractiveShowroom: React.FC<InteractiveShowroomProps> = ({
	baseImageUrl,
	maskImageUrl,
	woodMaskImageUrl,
	defaultColorId = 'beige',
	defaultWoodColorId = 'natural',
	width = 600,
	height = 450,
	onColorChange,
	onWoodColorChange,
	className = '',
}) => {
	const [selectedColorId, setSelectedColorId] = useState(defaultColorId);
	const [selectedWoodColorId, setSelectedWoodColorId] =
		useState(defaultWoodColorId);
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
	const paletaConLab: ColorTelaWithLab[] = useMemo(() => {
		return COLORES_TELA.map((color) => ({
			...color,
			lab: rgbToLab(color.rgb.r, color.rgb.g, color.rgb.b),
		}));
	}, []);

	// Pre-calcular LAB para colores de madera
	const paletaMaderaConLab: ColorTelaWithLab[] = useMemo(() => {
		return COLORES_MADERA.map((color) => ({
			...color,
			lab: rgbToLab(color.rgb.r, color.rgb.g, color.rgb.b),
		}));
	}, []);

	// Obtener color seleccionado actual
	const selectedColor = useMemo(
		() => paletaConLab.find((c) => c.id === selectedColorId) || paletaConLab[0],
		[selectedColorId, paletaConLab]
	);

	// Obtener color de madera seleccionado actual
	const selectedWoodColor = useMemo(
		() =>
			paletaMaderaConLab.find((c) => c.id === selectedWoodColorId) ||
			paletaMaderaConLab[0],
		[selectedWoodColorId, paletaMaderaConLab]
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
			colorTela: ColorTelaWithLab,
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
			}

			if (materialType === 'wood') {
				// Paso 1: Realzar contraste de vetas (lo tienes bien)
				// Paso 2: Añadir brillo especular (esto falta)
				// Paso 3: Saturación cálida para madera

				for (let i = 0; i < pixels.length; i += 4) {
					if (pixels[i + 3] === 0) continue;

					// Realzar contraste (ya lo tienes)
					const r = pixels[i],
						g = pixels[i + 1],
						b = pixels[i + 2];
					const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
					const contrasted = (luminosity - 128) * 1.2 + 128; // Más contraste
					const delta = contrasted - luminosity;

					// Añadir brillo cálido (simula barniz)
					const warmth = 1.05; // Más rojizo
					const brightness = 1.08; // Ligeramente más brillante

					pixels[i] = Math.min(255, (r + delta) * warmth * brightness);
					pixels[i + 1] = Math.min(255, (g + delta) * brightness);
					pixels[i + 2] = Math.min(255, (b + delta) * warmth * 0.95);
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

	// Procesar máscara de madera con color de paleta
	const processWoodMask = useCallback(
		() => processMaskWithPalette(woodImg, selectedWoodColor, 'wood'),
		[woodImg, selectedWoodColor, processMaskWithPalette]
	);

	useEffect(() => {
		if (baseImg && maskImg) {
			setProcessedMask(processMask());
		}
	}, [baseImg, maskImg, selectedColorId, processMask]);

	useEffect(() => {
		if (baseImg && woodImg) {
			setProcessedWoodMask(processWoodMask());
		}
	}, [baseImg, woodImg, selectedWoodColorId, processWoodMask]);

	const handleColorSelect = (colorId: string) => {
		const color = paletaConLab.find((c) => c.id === colorId);
		if (!color) return;

		setSelectedColorId(colorId);
		onColorChange?.(colorId, color.hex);
	};

	const handleWoodColorSelect = (colorId: string) => {
		const color = paletaMaderaConLab.find((c) => c.id === colorId);
		if (!color) return;

		setSelectedWoodColorId(colorId);
		onWoodColorChange?.(colorId, color.hex);
	};

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
		<div className={`max-w-4xl mx-auto space-y-6 mt-32 mb-10 ${className}`}>
			<div className='text-center mb-12'>
				<h2 className='text-4xl font-serif-display font-bold mb-4 text-foreground mt-8'>
					Personalizador Interactivo
				</h2>
				<p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
					Visualiza tu mueble con diferentes colores
				</p>
			</div>
			{/* Canvas Preview */}
			<div className='flex gap-3'>
				<Card>
					<CardContent className='p-4'>
						<div className='relative w-full rounded-lg bg-background border'>
							<Stage
								width={width}
								height={height}
								className='flex justify-center'
							>
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
													// globalCompositeOperation='overlay'
													globalCompositeOperation='multiply'
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
						{/* Selector de Color de Tela */}
						<div>
							<Label className='text-base font-semibold mb-3 block'>
								🎨 Color de la Tela
							</Label>
							<Select value={selectedColorId} onValueChange={handleColorSelect}>
								<SelectTrigger className='w-full'>
									<SelectValue>
										{selectedColor && (
											<div className='flex items-center gap-2'>
												<div
													className='w-4 h-4 rounded border'
													style={{ backgroundColor: selectedColor.hex }}
												/>
												<span>{selectedColor.nombre}</span>
											</div>
										)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{paletaConLab.map((color) => (
										<SelectItem key={color.id} value={color.id}>
											<div className='flex items-center gap-2'>
												<div
													className='w-4 h-4 rounded border'
													style={{ backgroundColor: color.hex }}
												/>
												<span>{color.nombre}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className='text-sm text-muted-foreground mt-2 text-center'>
								Seleccionado:{' '}
								<span className='font-semibold'>{selectedColor.nombre}</span>
								<code className='ml-2 px-2 py-0.5 bg-muted rounded text-xs'>
									{selectedColor.hex}
								</code>
							</p>
						</div>

						{/* Selector de Color de Madera */}
						<div className='border-t pt-4'>
							<Label className='text-base font-semibold mb-3 block'>
								🪵 Color del Barniz de Madera
							</Label>
							<Select
								value={selectedWoodColorId}
								onValueChange={handleWoodColorSelect}
							>
								<SelectTrigger className='w-full'>
									<SelectValue>
										{selectedWoodColor && (
											<div className='flex items-center gap-2'>
												<div
													className='w-4 h-4 rounded border'
													style={{ backgroundColor: selectedWoodColor.hex }}
												/>
												<span>{selectedWoodColor.nombre}</span>
											</div>
										)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{paletaMaderaConLab.map((color) => (
										<SelectItem key={color.id} value={color.id}>
											<div className='flex items-center gap-2'>
												<div
													className='w-4 h-4 rounded border'
													style={{ backgroundColor: color.hex }}
												/>
												<span>{color.nombre}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className='text-sm text-muted-foreground mt-2 text-center'>
								Seleccionado:{' '}
								<span className='font-semibold'>
									{selectedWoodColor.nombre}
								</span>
								<code className='ml-2 px-2 py-0.5 bg-muted rounded text-xs'>
									{selectedWoodColor.hex}
								</code>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
