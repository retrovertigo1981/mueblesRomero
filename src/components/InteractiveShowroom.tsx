import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface InteractiveShowroomProps {
	baseImageUrl: string;
	maskImageUrl: string;
	woodMaskImageUrl: string;
	defaultColor?: string;
	defaultWoodColor?: string;
	width?: number;
	height?: number;
	onColorChange?: (color: string) => void;
	onWoodColorChange?: (color: string) => void;
	className?: string;
}

interface ImageAdjustments {
	brightness: number;
	contrast: number;
	saturation: number;
}

export const InteractiveShowroom: React.FC<InteractiveShowroomProps> = ({
	baseImageUrl,
	maskImageUrl,
	woodMaskImageUrl,
	defaultColor = '#8B4513',
	defaultWoodColor = '#8B4513',
	width = 600,
	height = 450,
	onColorChange,
	onWoodColorChange,
	className = '',
}) => {
	const [color, setColor] = useState(defaultColor);
	const [woodColor, setWoodColor] = useState(defaultWoodColor);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processedMask, setProcessedMask] = useState<HTMLCanvasElement | null>(
		null
	);
	const [processedWoodMask, setProcessedWoodMask] =
		useState<HTMLCanvasElement | null>(null);
	const [adjustments, setAdjustments] = useState<ImageAdjustments>({
		brightness: 0,
		contrast: 0.1,
		saturation: 0,
	});

	const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
	const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
	const [woodImg, setWoodImg] = useState<HTMLImageElement | null>(null);
	const timeoutRef = useRef<number | null>(null);
	const woodTimeoutRef = useRef<number | null>(null);

	// Cargar imágenes
	useEffect(() => {
		const loadImages = async () => {
			try {
				setLoading(true);
				setError(null);
				console.log(
					'Starting to load images:',
					baseImageUrl,
					maskImageUrl,
					woodMaskImageUrl
				);

				const baseImgLoaded = await loadImage(baseImageUrl);
				const maskImgLoaded = await loadImage(maskImageUrl);
				const woodImgLoaded = await loadImage(woodMaskImageUrl);

				setBaseImg(baseImgLoaded);
				setMaskImg(maskImgLoaded);
				setWoodImg(woodImgLoaded);
				console.log('Images loaded and set in state');

				setLoading(false);
			} catch (err) {
				console.error('Error loading images:', err);
				setError('Error al cargar las imágenes. Verifica las URLs.');
				setLoading(false);
			}
		};

		loadImages();
	}, [baseImageUrl, maskImageUrl, woodMaskImageUrl]);

	const loadImage = (url: string): Promise<HTMLImageElement> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			if (!url.startsWith('/')) {
				img.crossOrigin = 'anonymous';
			}
			img.onload = () => {
				console.log(
					'Image loaded successfully:',
					url,
					'size:',
					img.width,
					'x',
					img.height
				);
				resolve(img);
			};
			img.onerror = (e) => {
				console.error('Image failed to load:', url, e);
				reject(e);
			};
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

	// Procesar máscara con Canvas API
	const processMask = useCallback((): HTMLCanvasElement | null => {
		if (!maskImg) {
			console.log('Mask image not available');
			return null;
		}
		console.log('Processing mask');

		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = maskImg.width;
		tempCanvas.height = maskImg.height;
		const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return null;

		ctx.drawImage(maskImg, 0, 0);

		const imageData = ctx.getImageData(
			0,
			0,
			tempCanvas.width,
			tempCanvas.height
		);
		const pixels = imageData.data;
		const rgb = hexToRgb(color);

		// Aplicar color usando LAB space para mejor calidad
		const targetLab = rgbToLab(rgb.r, rgb.g, rgb.b);

		for (let i = 0; i < pixels.length; i += 4) {
			const alpha = pixels[i + 3]; // Usando canal alpha real para máscaras con transparencia

			if (alpha > 20) {
				// Obtener LAB del pixel original
				const originalLab = rgbToLab(pixels[i], pixels[i + 1], pixels[i + 2]);

				// Blend en LAB space: preservar luminosidad, ajustar croma
				const blendFactor = alpha / 255;
				const blendedA =
					originalLab.a + (targetLab.a - originalLab.a) * blendFactor;
				const blendedB =
					originalLab.b + (targetLab.b - originalLab.b) * blendFactor;

				// Convertir de vuelta a RGB
				const blendedRgb = labToRgb(originalLab.l, blendedA, blendedB);

				pixels[i] = blendedRgb.r;
				pixels[i + 1] = blendedRgb.g;
				pixels[i + 2] = blendedRgb.b;
				pixels[i + 3] = alpha * 0.95;
			} else {
				pixels[i + 3] = 0;
			}
		}

		// Aplicar ajustes de imagen (brillo, contraste, saturación)
		for (let i = 0; i < pixels.length; i += 4) {
			if (pixels[i + 3] === 0) continue;

			let r = pixels[i];
			let g = pixels[i + 1];
			let b = pixels[i + 2];

			// Brillo
			const brightnessFactor = adjustments.brightness * 255;
			r += brightnessFactor;
			g += brightnessFactor;
			b += brightnessFactor;

			// Contraste
			if (adjustments.contrast !== 0) {
				const contrastFactor =
					(259 * (adjustments.contrast * 255 + 255)) /
					(255 * (259 - adjustments.contrast * 255));
				r = contrastFactor * (r - 128) + 128;
				g = contrastFactor * (g - 128) + 128;
				b = contrastFactor * (b - 128) + 128;
			}

			// Saturación
			if (adjustments.saturation !== 0) {
				const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
				const satFactor = 1 + adjustments.saturation;
				r = gray + satFactor * (r - gray);
				g = gray + satFactor * (g - gray);
				b = gray + satFactor * (b - gray);
			}

			// Clamp valores entre 0-255
			pixels[i] = Math.max(0, Math.min(255, r));
			pixels[i + 1] = Math.max(0, Math.min(255, g));
			pixels[i + 2] = Math.max(0, Math.min(255, b));
		}

		ctx.putImageData(imageData, 0, 0);
		return tempCanvas;
	}, [maskImg, color, adjustments]);

	// Procesar máscara de madera
	const processWoodMask = useCallback((): HTMLCanvasElement | null => {
		if (!woodImg) {
			console.log('Wood mask image not available');
			return null;
		}
		console.log('Processing wood mask');

		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = woodImg.width;
		tempCanvas.height = woodImg.height;
		const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return null;

		ctx.drawImage(woodImg, 0, 0);

		const imageData = ctx.getImageData(
			0,
			0,
			tempCanvas.width,
			tempCanvas.height
		);
		const pixels = imageData.data;
		const rgb = hexToRgb(woodColor);

		// Aplicar color usando LAB space para mejor calidad en madera
		const targetLab = rgbToLab(rgb.r, rgb.g, rgb.b);

		for (let i = 0; i < pixels.length; i += 4) {
			const alpha = pixels[i + 3]; // Usando canal alpha real para máscaras con transparencia

			if (alpha > 20) {
				// Obtener LAB del pixel original
				const originalLab = rgbToLab(pixels[i], pixels[i + 1], pixels[i + 2]);

				// Para madera, blend más sutil: menos cambio en croma
				const blendFactor = (alpha / 255) * 0.7; // Factor más bajo para madera
				const blendedA =
					originalLab.a + (targetLab.a - originalLab.a) * blendFactor;
				const blendedB =
					originalLab.b + (targetLab.b - originalLab.b) * blendFactor;

				// Convertir de vuelta a RGB
				const blendedRgb = labToRgb(originalLab.l, blendedA, blendedB);

				pixels[i] = blendedRgb.r;
				pixels[i + 1] = blendedRgb.g;
				pixels[i + 2] = blendedRgb.b;
				pixels[i + 3] = alpha * 0.95;
			} else {
				pixels[i + 3] = 0;
			}
		}

		// Aplicar ajustes de imagen (brillo, contraste, saturación)
		for (let i = 0; i < pixels.length; i += 4) {
			if (pixels[i + 3] === 0) continue;

			let r = pixels[i];
			let g = pixels[i + 1];
			let b = pixels[i + 2];

			// Brillo
			const brightnessFactor = adjustments.brightness * 255;
			r += brightnessFactor;
			g += brightnessFactor;
			b += brightnessFactor;

			// Contraste
			if (adjustments.contrast !== 0) {
				const contrastFactor =
					(259 * (adjustments.contrast * 255 + 255)) /
					(255 * (259 - adjustments.contrast * 255));
				r = contrastFactor * (r - 128) + 128;
				g = contrastFactor * (g - 128) + 128;
				b = contrastFactor * (b - 128) + 128;
			}

			// Saturación
			if (adjustments.saturation !== 0) {
				const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
				const satFactor = 1 + adjustments.saturation;
				r = gray + satFactor * (r - gray);
				g = gray + satFactor * (g - gray);
				b = gray + satFactor * (b - gray);
			}

			// Clamp valores entre 0-255
			pixels[i] = Math.max(0, Math.min(255, r));
			pixels[i + 1] = Math.max(0, Math.min(255, g));
			pixels[i + 2] = Math.max(0, Math.min(255, b));
		}

		ctx.putImageData(imageData, 0, 0);
		return tempCanvas;
	}, [woodImg, woodColor, adjustments]);

	useEffect(() => {
		if (baseImg && maskImg) {
			setProcessedMask(processMask());
		}
	}, [baseImg, maskImg, color, adjustments, processMask]);

	useEffect(() => {
		if (baseImg && woodImg) {
			setProcessedWoodMask(processWoodMask());
		}
	}, [baseImg, woodImg, woodColor, adjustments, processWoodMask]);

	const handleColorChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newColor = e.target.value;
			setColor(newColor);
			onColorChange?.(newColor);

			// Debounce processing
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				// Processing is triggered by setColor
			}, 150);
		},
		[onColorChange]
	);

	const handleWoodColorChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newColor = e.target.value;
			setWoodColor(newColor);
			onWoodColorChange?.(newColor);

			// Debounce processing
			if (woodTimeoutRef.current) {
				clearTimeout(woodTimeoutRef.current);
			}
			woodTimeoutRef.current = setTimeout(() => {
				// Processing is triggered by setWoodColor
			}, 150);
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
												globalCompositeOperation='multiply'
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
											<>
												<KonvaImage
													image={processedMask}
													x={x}
													y={y}
													scaleX={scale}
													scaleY={scale}
													globalCompositeOperation='multiply'
												/>
												<KonvaImage
													image={processedMask}
													x={x}
													y={y}
													scaleX={scale}
													scaleY={scale}
													globalCompositeOperation='overlay'
													opacity={0.2}
												/>
											</>
										);
									})()}
							</Layer>
						</Stage>
					</div>
				</CardContent>
			</Card>

			{/* Controls */}
			<Card>
				<CardContent className='p-4 space-y-4'>
					{/* Color Pickers */}
					<div className='space-y-4'>
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
						<div className='flex items-center justify-between'>
							<Label htmlFor='color-picker' className='text-base font-semibold'>
								🎨 Color de la Tela
							</Label>
							<div className='flex items-center gap-3'>
								<input
									id='color-picker'
									type='color'
									value={color}
									onChange={handleColorChange}
									className='h-10 w-20 rounded-md border-2 border-input cursor-pointer transition-transform hover:scale-105'
								/>
								<code className='px-3 py-2 bg-muted rounded-md text-sm font-mono font-semibold'>
									{color.toUpperCase()}
								</code>
							</div>
						</div>
					</div>

					<div className='border-t pt-6'>
						<h3 className='text-base font-semibold mb-4'>
							⚙️ Ajustes de Realismo
						</h3>

						{/* Brightness Slider */}
						<div className='space-y-2 mb-4'>
							<div className='flex items-center justify-between'>
								<Label htmlFor='brightness-slider'>Brillo</Label>
								<span className='text-sm font-medium text-muted-foreground tabular-nums'>
									{adjustments.brightness.toFixed(2)}
								</span>
							</div>
							<Slider
								id='brightness-slider'
								min={-0.5}
								max={0.5}
								step={0.05}
								value={[adjustments.brightness]}
								onValueChange={(v) =>
									setAdjustments((prev) => ({ ...prev, brightness: v[0] }))
								}
								className='w-full'
							/>
						</div>

						{/* Contrast Slider */}
						<div className='space-y-2 mb-4'>
							<div className='flex items-center justify-between'>
								<Label htmlFor='contrast-slider'>Contraste</Label>
								<span className='text-sm font-medium text-muted-foreground tabular-nums'>
									{adjustments.contrast.toFixed(2)}
								</span>
							</div>
							<Slider
								id='contrast-slider'
								min={-0.5}
								max={0.5}
								step={0.05}
								value={[adjustments.contrast]}
								onValueChange={(v) =>
									setAdjustments((prev) => ({ ...prev, contrast: v[0] }))
								}
								className='w-full'
							/>
						</div>

						{/* Saturation Slider */}
						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<Label htmlFor='saturation-slider'>Saturación</Label>
								<span className='text-sm font-medium text-muted-foreground tabular-nums'>
									{adjustments.saturation.toFixed(2)}
								</span>
							</div>
							<Slider
								id='saturation-slider'
								min={-1}
								max={1}
								step={0.05}
								value={[adjustments.saturation]}
								onValueChange={(v) =>
									setAdjustments((prev) => ({ ...prev, saturation: v[0] }))
								}
								className='w-full'
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

// import React, { useEffect, useRef, useState } from 'react';
// import * as fabric from 'fabric'; // Asume instalada: yarn add fabric
// import { Slider } from '@/components/ui/slider';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Loader2 } from 'lucide-react';

// interface FurnitureCustomizerProps {
// 	baseImageUrl: string;
// 	maskImageUrl: string;
// 	defaultColor?: string;
// 	width?: number;
// 	onColorChange?: (color: string) => void;
// }

// const InteractiveShowroom: React.FC<FurnitureCustomizerProps> = ({
// 	baseImageUrl = 'https://i.imgur.com/1betuSZ.png',
// 	maskImageUrl = 'https://i.imgur.com/oH39Enw.png',
// 	defaultColor = '#8B4513',
// 	width = 800,
// 	onColorChange = null,
// }) => {
// 	const canvasRef = useRef<HTMLCanvasElement>(null);
// 	const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
// 	const [color, setColor] = useState(defaultColor);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState<string | null>(null);
// 	const [brightness, setBrightness] = useState(0); // Fabric usa -1 to 1
// 	const [contrast, setContrast] = useState(0); // -1 to 1
// 	const [saturation, setSaturation] = useState(0); // -1 to 1
// 	const imagesRef = useRef<{
// 		base: fabric.Image | null;
// 		mask: fabric.Image | null;
// 		loaded: number;
// 	}>({
// 		base: null,
// 		mask: null,
// 		loaded: 0,
// 	});

// 	useEffect(() => {
// 		const loadImages = async () => {
// 			setLoading(true);
// 			setError(null);

// 			try {
// 				const base = await new Promise<fabric.FabricImage>(
// 					(resolve, reject) => {
// 						fabric.FabricImage.fromURL(
// 							baseImageUrl,
// 							(img) => {
// 								if (img.getElement()) {
// 									resolve(img);
// 								} else {
// 									reject(new Error('Error cargando imagen base'));
// 								}
// 							},
// 							{ crossOrigin: 'anonymous' }
// 						);
// 					}
// 				);

// 				const mask = await new Promise<fabric.Image>((resolve, reject) => {
// 					fabric.FabricImage.fromURL(
// 						maskImageUrl,
// 						(img) => {
// 							if (img.getElement()) {
// 								resolve(img);
// 							} else {
// 								reject(new Error('Error cargando máscara'));
// 							}
// 						},
// 						{ crossOrigin: 'anonymous' }
// 					);
// 				});

// 				imagesRef.current = { base, mask, loaded: 2 };
// 				setLoading(false);
// 			} catch (err) {
// 				setError(err instanceof Error ? err.message : 'Error desconocido');
// 				setLoading(false);
// 			}
// 		};

// 		loadImages();

// 		return () => {
// 			if (fabricCanvasRef.current) {
// 				fabricCanvasRef.current.dispose();
// 			}
// 		};
// 	}, [baseImageUrl, maskImageUrl]);

// 	useEffect(() => {
// 		if (loading || error || !canvasRef.current) return;

// 		const { base, mask } = imagesRef.current;
// 		if (!base || !mask) return;

// 		const canvas = new fabric.Canvas(canvasRef.current, {
// 			width,
// 			height: (width / base.width!) * base.height!,
// 			backgroundColor: 'transparent',
// 			preserveObjectStacking: true,
// 			selection: false,
// 		});

// 		fabricCanvasRef.current = canvas;

// 		// Añadir base
// 		canvas.add(
// 			base.set({
// 				left: 0,
// 				top: 0,
// 				selectable: false,
// 				evented: false,
// 			})
// 		);

// 		// Procesar máscara: Erosión alpha (usando canvas temp para compatibilidad)
// 		const tempCanvas = document.createElement('canvas');
// 		tempCanvas.width = mask.width!;
// 		tempCanvas.height = mask.height!;
// 		const tempCtx = tempCanvas.getContext('2d')!;
// 		mask.render(tempCtx);

// 		let maskData = tempCtx.getImageData(
// 			0,
// 			0,
// 			tempCanvas.width,
// 			tempCanvas.height
// 		);
// 		maskData = erodeAlpha(maskData, 2); // Función erosión (mantenida)
// 		tempCtx.putImageData(maskData, 0, 0);

// 		// Crear nueva fabric.Image de máscara procesada
// 		fabric.FabricImage.fromURL(
// 			tempCanvas.toDataURL(),
// 			(processedMask) => {
// 				applyColorToMask(processedMask, color);
// 				canvas.add(
// 					processedMask.set({
// 						left: 0,
// 						top: 0,
// 						selectable: false,
// 						evented: false,
// 					})
// 				);
// 				canvas.renderAll();
// 			},
// 			{ crossOrigin: 'anonymous' }
// 		);

// 		return () => {
// 			canvas.dispose();
// 		};
// 	}, [loading, error, width, color]);

// 	useEffect(() => {
// 		if (!fabricCanvasRef.current) return;

// 		const canvas = fabricCanvasRef.current;
// 		const maskObj = canvas.getObjects()[1]; // Asumiendo [0] base, [1] mask

// 		if (maskObj) {
// 			maskObj.filters = [
// 				new fabric.Image.filters.Brightness({ brightness }),
// 				new fabric.Image.filters.Contrast({ contrast }),
// 				new fabric.Image.filters.Saturation({ saturation }),
// 			];
// 			maskObj.applyFilters();
// 			canvas.renderAll();
// 		}
// 	}, [brightness, contrast, saturation]);

// 	const applyColorToMask = (maskObj: fabric.Image, hexColor: string) => {
// 		const rgb = hexToRgb(hexColor);
// 		maskObj.filters = maskObj.filters || [];
// 		maskObj.filters.push(
// 			new fabric.Image.filters.Tint({
// 				color: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
// 				opacity: 0.95,
// 			})
// 		);
// 		maskObj.globalCompositeOperation = 'multiply'; // Preserva texturas
// 		maskObj.applyFilters();
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

// 	// Función erosión (mantenida para bordes suaves)
// 	const erodeAlpha = (imageData: ImageData, radius = 2) => {
// 		const { width, height, data } = imageData;
// 		const output = new Uint8ClampedArray(data);

// 		for (let y = radius; y < height - radius; y++) {
// 			for (let x = radius; x < width - radius; x++) {
// 				const idx = (y * width + x) * 4;
// 				let minAlpha = 255;

// 				for (let dy = -radius; dy <= radius; dy++) {
// 					for (let dx = -radius; dx <= radius; dx++) {
// 						const nIdx = ((y + dy) * width + (x + dx)) * 4 + 3; // Solo alpha
// 						minAlpha = Math.min(minAlpha, data[nIdx]);
// 					}
// 				}

// 				output[idx + 3] = minAlpha;
// 			}
// 		}

// 		imageData.data.set(output);
// 		return imageData;
// 	};

// 	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const newColor = e.target.value;
// 		setColor(newColor);
// 		if (onColorChange) {
// 			onColorChange(newColor);
// 		}
// 	};

// 	return (
// 		<Card className='shadow-hover bg-card'>
// 			<CardHeader>
// 				<CardTitle className='text-foreground'>Customizador</CardTitle>
// 			</CardHeader>
// 			<CardContent className='space-y-6'>
// 				{loading && (
// 					<div className='flex justify-center items-center h-48'>
// 						<Loader2 className='h-8 w-8 animate-spin text-primary' />
// 					</div>
// 				)}
// 				{error && (
// 					<div className='text-destructive text-center p-4 bg-destructive/10 rounded-md'>
// 						{error}
// 					</div>
// 				)}
// 				{!loading && !error && (
// 					<canvas
// 						ref={canvasRef}
// 						className='w-full rounded-lg border border-border'
// 					/>
// 				)}
// 				<div className='space-y-4'>
// 					<div className='flex items-center gap-4'>
// 						<Label
// 							htmlFor='color-picker'
// 							className='text-foreground font-medium'
// 						>
// 							Color Principal
// 						</Label>
// 						<Input
// 							type='color'
// 							id='color-picker'
// 							value={color}
// 							onChange={handleColorChange}
// 							className='w-12 h-12 p-1 rounded-md border-2 border-border cursor-pointer'
// 						/>
// 					</div>
// 					<div>
// 						<Label className='text-foreground font-medium mb-2 block'>
// 							Brillo
// 						</Label>
// 						<Slider
// 							min={-1}
// 							max={1}
// 							step={0.05}
// 							value={[brightness]}
// 							onValueChange={([value]) => setBrightness(value)}
// 							className='w-full'
// 						/>
// 					</div>
// 					<div>
// 						<Label className='text-foreground font-medium mb-2 block'>
// 							Contraste
// 						</Label>
// 						<Slider
// 							min={-1}
// 							max={1}
// 							step={0.05}
// 							value={[contrast]}
// 							onValueChange={([value]) => setContrast(value)}
// 							className='w-full'
// 						/>
// 					</div>
// 					<div>
// 						<Label className='text-foreground font-medium mb-2 block'>
// 							Saturación
// 						</Label>
// 						<Slider
// 							min={-1}
// 							max={1}
// 							step={0.05}
// 							value={[saturation]}
// 							onValueChange={([value]) => setSaturation(value)}
// 							className='w-full'
// 						/>
// 					</div>
// 				</div>
// 			</CardContent>
// 		</Card>
// 	);
// };

// export default InteractiveShowroom;

// import { useState, useEffect } from 'react';
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from '@/components/ui/select';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';

// // Interfaces (ajustadas para combinaciones)
// interface Variant {
// 	mesaColor: string;
// 	sillaColor: string;
// 	imageUrl: string;
// }

// interface ProductApi {
// 	id: number;
// 	title: { rendered: string };
// 	acf: {
// 		category: string;
// 		thumbnail: string; // ACF para thumb
// 		variants: Variant[]; // Asumir ACF array de variants
// 	};
// }

// interface CleanProduct {
// 	id: number;
// 	title: string;
// 	thumbnail: string;
// 	variants: Variant[];
// }

// // Mocks temporales (reemplaza con WP fetch)
// const productsMock: CleanProduct[] = [
// 	{
// 		id: 1,
// 		title: 'Comedor Aurora',
// 		thumbnail: '/images/comedor-aurora/thumb.jpg',
// 		variants: [
// 			{
// 				mesaColor: 'roble',
// 				sillaColor: 'beige',
// 				imageUrl: '/images/comedor-aurora/roble-beige.jpg',
// 			},
// 			{
// 				mesaColor: 'roble',
// 				sillaColor: 'gris',
// 				imageUrl: '/images/comedor-aurora/roble-gris.jpg',
// 			},
// 			{
// 				mesaColor: 'cerezo',
// 				sillaColor: 'beige',
// 				imageUrl: '/images/comedor-aurora/cerezo-beige.jpg',
// 			},
// 			{
// 				mesaColor: 'cerezo',
// 				sillaColor: 'gris',
// 				imageUrl: '/images/comedor-aurora/cerezo-gris.jpg',
// 			},
// 		],
// 	},
// 	{
// 		id: 2,
// 		title: 'Mesa Nórdica',
// 		thumbnail: '/images/mesa-nordica/thumb.jpg',
// 		variants: [
// 			{
// 				mesaColor: 'blanco',
// 				sillaColor: 'negro',
// 				imageUrl: '/images/mesa-nordica/blanco-negro.jpg',
// 			},
// 			{
// 				mesaColor: 'blanco',
// 				sillaColor: 'madera',
// 				imageUrl: '/images/mesa-nordica/blanco-madera.jpg',
// 			},
// 			{
// 				mesaColor: 'nogal',
// 				sillaColor: 'negro',
// 				imageUrl: '/images/mesa-nordica/nogal-negro.jpg',
// 			},
// 			{
// 				mesaColor: 'nogal',
// 				sillaColor: 'madera',
// 				imageUrl: '/images/mesa-nordica/nogal-madera.jpg',
// 			},
// 		],
// 	},
// 	// Agrega más...
// ];

// const cleanDataProducts = (dataApi: ProductApi[]): CleanProduct[] => {
// 	return dataApi
// 		.filter((item) => item.acf.category === 'Personalizable') // Filtra solo personalizables
// 		.map((item) => ({
// 			id: item.id,
// 			title: item.title.rendered,
// 			thumbnail: item.acf.thumbnail,
// 			variants: item.acf.variants || [], // Asegura array
// 		}));
// };

// export const InteractiveShowroom = () => {
// 	const [products, setProducts] = useState<CleanProduct[]>(productsMock); // Cambia a [] y usa fetch
// 	const [selectedProduct, setSelectedProduct] = useState<CleanProduct | null>(
// 		products[0] ?? null
// 	);
// 	const [selectedMesaColor, setSelectedMesaColor] = useState<string>('');
// 	const [selectedSillaColor, setSelectedSillaColor] = useState<string>('');
// 	const [currentImage, setCurrentImage] = useState<string>('');
// 	const [isFading, setIsFading] = useState(false);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState<string | null>(null);

// 	// Fetch real de WP (descomenta y quita mocks)
// 	useEffect(() => {
// 		const fetchProducts = async () => {
// 			try {
// 				setLoading(true);
// 				const response = await fetch(
// 					'http://localhost:8881/wp-json/wp/v2/productos'
// 				); // Cambia URL en prod
// 				if (!response.ok) throw new Error('Error fetching products');
// 				const rawData: ProductApi[] = await response.json();
// 				const cleanData = cleanDataProducts(rawData);
// 				setProducts(cleanData);
// 				if (cleanData.length > 0) setSelectedProduct(cleanData[0]);
// 			} catch (err) {
// 				if (err instanceof Error) {
// 					setError('Error al cargar los muebles personalizables.');
// 				}
// 			} finally {
// 				setLoading(false);
// 			}
// 		};
// 		fetchProducts(); // Descomenta para real
// 	}, []);

// 	// Actualiza colores defaults y imagen al cambiar producto
// 	useEffect(() => {
// 		if (selectedProduct && selectedProduct.variants.length > 0) {
// 			const defaultVariant = selectedProduct.variants[0];
// 			setSelectedMesaColor(defaultVariant.mesaColor);
// 			setSelectedSillaColor(defaultVariant.sillaColor);
// 			setCurrentImage(defaultVariant.imageUrl);
// 		}
// 	}, [selectedProduct]);

// 	// Actualiza imagen con fade al cambiar colores
// 	useEffect(() => {
// 		if (selectedProduct && selectedMesaColor && selectedSillaColor) {
// 			const matchingVariant = selectedProduct.variants.find(
// 				(v) =>
// 					v.mesaColor === selectedMesaColor &&
// 					v.sillaColor === selectedSillaColor
// 			);
// 			if (matchingVariant) {
// 				setIsFading(true);
// 				setTimeout(() => {
// 					setCurrentImage(matchingVariant.imageUrl);
// 					setIsFading(false);
// 				}, 200); // Duración fade
// 			}
// 		}
// 	}, [selectedMesaColor, selectedSillaColor, selectedProduct]);

// 	// Colores únicos para selects (extraídos de variants)
// 	const getUniqueMesaColors = () => {
// 		if (!selectedProduct) return [];
// 		return [...new Set(selectedProduct.variants.map((v) => v.mesaColor))];
// 	};

// 	const getUniqueSillaColors = () => {
// 		if (!selectedProduct) return [];
// 		return [...new Set(selectedProduct.variants.map((v) => v.sillaColor))];
// 	};

// 	if (loading)
// 		return (
// 			<div className='min-h-screen flex items-center justify-center'>
// 				Cargando...
// 			</div>
// 		);
// 	if (error)
// 		return (
// 			<div className='min-h-screen flex items-center justify-center text-destructive'>
// 				{error}
// 			</div>
// 		);

// 	return (
// 		<section
// 			id='catalogo-interactivo'
// 			className='min-h-screen py-8 px-4 bg-background'
// 		>
// 			<div className='max-w-5xl mx-auto'>
// 				{/* Header */}
// 				<div className='text-center mb-6'>
// 					<h2 className='text-3xl font-bold'>Catálogo Interactivo</h2>
// 					<p className='text-muted-foreground'>
// 						Elige un mueble y personaliza colores de mesa y silla.
// 					</p>
// 				</div>

// 				{/* Mobile: Lista horizontal de muebles */}
// 				<div className='md:hidden overflow-x-auto py-4 mb-6'>
// 					<div className='flex gap-4'>
// 						{products.map((p) => (
// 							<Card
// 								key={p.id}
// 								onClick={() => setSelectedProduct(p)}
// 								className={`cursor-pointer min-w-[150px] transition-shadow ${
// 									selectedProduct?.id === p.id ? 'ring-2 ring-primary' : ''
// 								}`}
// 							>
// 								<CardContent className='p-2'>
// 									<img
// 										src={p.thumbnail}
// 										alt={p.title}
// 										className='w-full h-32 object-cover rounded-md mb-2'
// 									/>
// 									<p className='text-sm font-medium text-center'>{p.title}</p>
// 								</CardContent>
// 							</Card>
// 						))}
// 					</div>
// 				</div>

// 				{/* Layout Principal: Mobile stacked, Desktop grid */}
// 				<div className='grid md:grid-cols-[1fr_3fr_1fr] gap-6'>
// 					{/* Desktop: Lista vertical de muebles */}
// 					<div className='hidden md:block'>
// 						<h3 className='text-lg font-semibold mb-4'>Muebles Disponibles</h3>
// 						<div className='space-y-4'>
// 							{products.map((p) => (
// 								<Card
// 									key={p.id}
// 									onClick={() => setSelectedProduct(p)}
// 									className={`cursor-pointer transition-shadow ${
// 										selectedProduct?.id === p.id ? 'ring-2 ring-primary' : ''
// 									}`}
// 								>
// 									<CardContent className='p-4 flex items-center gap-4'>
// 										<img
// 											src={p.thumbnail}
// 											alt={p.title}
// 											className='w-16 h-16 object-cover rounded'
// 										/>
// 										<p className='font-medium'>{p.title}</p>
// 									</CardContent>
// 								</Card>
// 							))}
// 						</div>
// 					</div>

// 					{/* Preview Imagen */}
// 					<div className='col-span-1 md:col-span-1'>
// 						<div className='aspect-[4/3] rounded-xl overflow-hidden shadow-soft relative'>
// 							<img
// 								src={currentImage}
// 								alt={`${selectedProduct?.title} - ${selectedMesaColor}/${selectedSillaColor}`}
// 								className={`w-full h-full object-cover transition-opacity duration-300 ${
// 									isFading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
// 								}`}
// 								loading='lazy'
// 							/>
// 						</div>
// 					</div>

// 					{/* Controls: Selects para colores */}
// 					<div className='space-y-6'>
// 						<div>
// 							<label className='block text-sm font-medium mb-2'>
// 								Color de Mesa
// 							</label>
// 							<Select
// 								value={selectedMesaColor}
// 								onValueChange={setSelectedMesaColor}
// 							>
// 								<SelectTrigger>
// 									<SelectValue placeholder='Elige color' />
// 								</SelectTrigger>
// 								<SelectContent>
// 									{getUniqueMesaColors().map((color) => (
// 										<SelectItem key={color} value={color}>
// 											{color.charAt(0).toUpperCase() + color.slice(1)}
// 										</SelectItem>
// 									))}
// 								</SelectContent>
// 							</Select>
// 						</div>
// 						<div>
// 							<label className='block text-sm font-medium mb-2'>
// 								Color de Silla
// 							</label>
// 							<Select
// 								value={selectedSillaColor}
// 								onValueChange={setSelectedSillaColor}
// 							>
// 								<SelectTrigger>
// 									<SelectValue placeholder='Elige color' />
// 								</SelectTrigger>
// 								<SelectContent>
// 									{getUniqueSillaColors().map((color) => (
// 										<SelectItem key={color} value={color}>
// 											{color.charAt(0).toUpperCase() + color.slice(1)}
// 										</SelectItem>
// 									))}
// 								</SelectContent>
// 							</Select>
// 						</div>
// 						<Button className='w-full'>Añadir al Carrito</Button>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	);
// };
