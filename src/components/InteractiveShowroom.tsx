import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import Konva from 'konva';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Palette, Trees, Package, ShoppingCart } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { COLORES_TELA, COLORES_MADERA } from '@/types/colors';
import type { Colores } from '@/types/colors';
import { optimizeCanvasImage } from '@/utils/imageOptimizer';

// Conversion functions
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

interface CustomizableFurniture {
	id: string;
	name: string;
	description: string;
	dimensions: string;
	materials: string;
	warranty: string;
	baseImageUrl: string;
	maskFabricImageUrl: string;
	tableTopMaskImageUrl: string;
	woodMaskImageUrl: string;
	defaultColorId: string;
	defaultWoodColorId: string;
	defaultTableTopColorId?: string;
}

interface InteractiveShowroomProps {
	className?: string;
	onLoadingChange?: (loading: boolean) => void;
	onErrorChange?: (error: string | null) => void;
}

// 🪑 CATÁLOGO DE MUEBLES
const FURNITURE_CATALOG: CustomizableFurniture[] = [
	{
		id: 'comedor-1',
		name: 'Comedor 150 x 85 + 4 Sillas Italia + 1 Banqueta 120 cm',
		description:
			'Cubierta madera con vidrio. Madera pino seco en horno – tela lino. Incluye traslado en Santiago.',
		dimensions: '150 x 85 cm (mesa) + banqueta 120 cm',
		materials: 'Madera pino seco en horno, tela lino, vidrio',
		warranty: '1 año',
		baseImageUrl: '/assets/comedor_1_gemini_upscayl_4x.webp',
		maskFabricImageUrl: '/assets/capa_tela_sillas_comedor_1.webp',
		tableTopMaskImageUrl: '/assets/capa_cubierta_comedor_1.webp',
		woodMaskImageUrl: '/assets/capa_madera_comerdor_1.webp',
		defaultColorId: 'beige',
		defaultWoodColorId: 'natural',
		defaultTableTopColorId: 'natural',
	},
	{
		id: 'comedor-2',
		name: 'Comedor 150 x 85 + 4 Sillas Oporto + 1 Banqueta 120 cm',
		description:
			'Cubierta madera con vidrio. Madera pino seco en horno – tela lino. Incluye traslado en Santiago.',
		dimensions: '150 x 85 cm (mesa) + banqueta 120 cm',
		materials: 'Madera pino seco en horno, tela lino, vidrio',
		warranty: '1 año',
		baseImageUrl: '/assets/comedor_2_gemini_upscayl_4x.webp',
		maskFabricImageUrl: '/assets/capa_tela_sillas_comedor_2.webp',
		tableTopMaskImageUrl: '/assets/capa_cubierta_comedor_2.webp',
		woodMaskImageUrl: '/assets/capa_madera_comerdor_2.webp',
		defaultColorId: 'gris',
		defaultWoodColorId: 'natural',
		defaultTableTopColorId: 'natural',
	},
];

export const InteractiveShowroom: React.FC<InteractiveShowroomProps> = ({
	className = '',
	onLoadingChange,
	onErrorChange,
}) => {
	const navigate = useNavigate();
	const maskCache = useRef<Map<string, HTMLCanvasElement>>(new Map());

	// Check for browser compatibility
	useEffect(() => {
		const isBrave = navigator.userAgent.includes('Brave');
		if (isBrave) {
			console.warn(
				'Brave browser detected. KonvaJS may be blocked by Brave shield. Please disable it.',
			);
		}
	}, []);

	const [selectedFurniture, setSelectedFurniture] =
		useState<CustomizableFurniture>(FURNITURE_CATALOG[0]);
	const [selectedColorId, setSelectedColorId] = useState(
		FURNITURE_CATALOG[0].defaultColorId,
	);
	const [selectedWoodColorId, setSelectedWoodColorId] = useState(
		FURNITURE_CATALOG[0].defaultWoodColorId,
	);
	const [selectedTableTopColorId, setSelectedTableTopColorId] = useState(
		FURNITURE_CATALOG[0].defaultTableTopColorId || 'natural',
	);

	const [processedMask, setProcessedMask] = useState<HTMLCanvasElement | null>(
		null,
	);
	const [processedWoodMask, setProcessedWoodMask] =
		useState<HTMLCanvasElement | null>(null);
	const [processedTableTopMask, setProcessedTableTopMask] =
		useState<HTMLCanvasElement | null>(null);

	// Loading states for color changes
	const [processingFabric, setProcessingFabric] = useState(false);
	const [processingWood, setProcessingWood] = useState(false);
	const [processingTableTop, setProcessingTableTop] = useState(false);

	const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
	const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
	const [woodImg, setWoodImg] = useState<HTMLImageElement | null>(null);
	const [tableTopImg, setTableTopImg] = useState<HTMLImageElement | null>(null);

	const isMounted = useRef(true);
	const stageRef = useRef<InstanceType<typeof Konva.Stage> | null>(null);

	const loadImage = useCallback(
		async (url: string): Promise<HTMLImageElement> => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					resolve(img);
				};
				img.onerror = (e) => {
					console.error('Failed to load image:', url, e);
					reject(e);
				};
				img.src = url;
			});
		},
		[],
	);

	// ✅ COLORES SELECCIONADOS (DIRECTO DESDE LA PALETA)
	const selectedColor =
		COLORES_TELA.find((c) => c.id === selectedColorId) || COLORES_TELA[0];
	const selectedWoodColor =
		COLORES_MADERA.find((c) => c.id === selectedWoodColorId) ||
		COLORES_MADERA[0];
	const selectedTableTopColor =
		COLORES_MADERA.find((c) => c.id === selectedTableTopColorId) ||
		COLORES_MADERA[0];

	// 🪵 PROCESAMIENTO DE MÁSCARAS CON CACHE
	const processMaskWithPalette = useCallback(
		async (
			maskImage: HTMLImageElement | null,
			colorTela: Colores,
			materialType: 'fabric' | 'wood',
		): Promise<HTMLCanvasElement | null> => {
			if (!maskImage) return null;

			// Check cache first
			const cacheKey = `${maskImage.src}-${colorTela.id}-${materialType}`;
			const cached = maskCache.current.get(cacheKey);
			if (cached) {
				return cached;
			}

			// Create canvas optimized to canvas size for better performance
			const canvas = document.createElement('canvas');
			canvas.width = canvasSize.width;
			canvas.height = canvasSize.height;
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			if (!ctx) return null;

			// Draw mask image scaled to canvas size
			ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const pixels = imageData.data;

			// Full color processing logic
			const targetLab = colorTela.lab;

			// Parameters optimized for higher color intensity
			const colorIntensity = materialType === 'wood' ? 0.99 : 0.95;
			const contrastBoost = materialType === 'wood' ? 1.25 : 1.0;
			const saturationFactor = materialType === 'wood' ? 1.3 : 1.1;
			const colorBoost = materialType === 'wood' ? 1.2 : 1.0;

			// Phase 1: Base color application
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

				// Dynamic adjustment: Light colors need more range
				const isLightColor = targetLab.l > 60;
				const rangeFactor = isLightColor ? 1.3 : 1.0;

				const targetLMin = Math.max(0, targetLab.l - 20 * rangeFactor);
				const targetLMax = Math.min(100, targetLab.l + 15 * rangeFactor);
				const adjustedL =
					targetLMin + (maskL / 100) * (targetLMax - targetLMin);

				const blendFactor = (alpha / 255) * colorIntensity;

				// Apply color boost
				let finalL =
					adjustedL * blendFactor * colorBoost + maskL * (1 - blendFactor);
				let finalA = targetLab.a * blendFactor * colorBoost;
				let finalB = targetLab.b * blendFactor * colorBoost;

				// Darken for wood
				if (materialType === 'wood') {
					const darkeningFactor = 0.85;
					finalL *= darkeningFactor;
					finalA *= darkeningFactor;
					finalB *= darkeningFactor;
				}

				const { x, y, z } = labToXyz(finalL, finalA, finalB);
				const finalRgb = xyzToRgb(x, y, z);

				pixels[i] = finalRgb.r;
				pixels[i + 1] = finalRgb.g;
				pixels[i + 2] = finalRgb.b;
				pixels[i + 3] = Math.max(0, alpha - 4);
			}

			// Phase 2: Post-processing
			if (materialType === 'wood') {
				for (let i = 0; i < pixels.length; i += 4) {
					if (pixels[i + 3] === 0) continue;

					let r = pixels[i];
					let g = pixels[i + 1];
					let b = pixels[i + 2];

					const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
					const contrasted = (luminosity - 128) * contrastBoost + 128;
					const delta = contrasted - luminosity;

					const glossIntensity = 0.75 + (luminosity / 255) * 0.1;
					const warmth = 1.0;

					r = Math.min(255, (r + delta * 0.5) * glossIntensity * warmth);
					g = Math.min(255, (g + delta * 0.5) * glossIntensity);
					b = Math.min(255, (b + delta * 0.5) * glossIntensity * warmth * 0.96);

					const gray = 0.299 * r + 0.587 * g + 0.114 * b;
					pixels[i] = Math.min(255, gray + saturationFactor * (r - gray));
					pixels[i + 1] = Math.min(255, gray + saturationFactor * (g - gray));
					pixels[i + 2] = Math.min(255, gray + saturationFactor * (b - gray));
				}
			} else {
				for (let i = 0; i < pixels.length; i += 4) {
					if (pixels[i + 3] === 0) continue;
					const r = pixels[i];
					const g = pixels[i + 1];
					const b = pixels[i + 2];
					const gray = 0.299 * r + 0.587 * g + 0.114 * b;
					pixels[i] = Math.min(255, gray + saturationFactor * (r - gray));
					pixels[i + 1] = Math.min(255, gray + saturationFactor * (g - gray));
					pixels[i + 2] = Math.min(255, gray + saturationFactor * (b - gray));
				}
			}

			ctx.putImageData(imageData, 0, 0);

			// Cache the result
			maskCache.current.set(cacheKey, canvas);

			return canvas;
		},
		[],
	);

	// 📏 SISTEMA DE ESCALADO "COVER"
	const calculateCoverDimensions = useCallback(
		(
			imgWidth: number,
			imgHeight: number,
			containerWidth: number,
			containerHeight: number,
		) => {
			const imgAspect = imgWidth / imgHeight;
			const containerAspect = containerWidth / containerHeight;

			let width: number;
			let height: number;
			let x: number;
			let y: number;

			if (imgAspect > containerAspect) {
				height = containerHeight;
				width = height * imgAspect;
				x = (containerWidth - width) / 2;
				y = 0;
			} else {
				width = containerWidth;
				height = width / imgAspect;
				x = 0;
				y = (containerHeight - height) / 2;
			}

			return {
				width,
				height,
				x,
				y,
				scaleX: width / imgWidth,
				scaleY: height / imgHeight,
			};
		},
		[],
	);

	// 🔄 CARGA DE IMÁGENES
	useEffect(() => {
		isMounted.current = true;
		const loadAllImages = async () => {
			try {
				onLoadingChange?.(true);
				onErrorChange?.(null);

				const [base, mask, wood, tableTop] = await Promise.all([
					loadImage(selectedFurniture.baseImageUrl),
					loadImage(selectedFurniture.maskFabricImageUrl),
					loadImage(selectedFurniture.woodMaskImageUrl),
					loadImage(selectedFurniture.tableTopMaskImageUrl),
				]);

				if (!isMounted.current) return;

				setBaseImg(base);
				setMaskImg(mask);
				setWoodImg(wood);
				setTableTopImg(tableTop);

				// Process initial masks
				const [fabricMask, woodMaskCanvas, tableTopMaskCanvas] =
					await Promise.all([
						processMaskWithPalette(mask, selectedColor, 'fabric'),
						processMaskWithPalette(wood, selectedWoodColor, 'wood'),
						processMaskWithPalette(tableTop, selectedTableTopColor, 'wood'),
					]);

				if (!isMounted.current) return;

				setProcessedMask(fabricMask);
				setProcessedWoodMask(woodMaskCanvas);
				setProcessedTableTopMask(tableTopMaskCanvas);

				onLoadingChange?.(false);
			} catch (err) {
				if (!isMounted.current) return;
				console.error('Error loading images:', err);
				onErrorChange?.('Error al cargar las imágenes. Verifica las URLs.');
				onLoadingChange?.(false);
			}
		};

		setProcessedMask(null);
		setProcessedWoodMask(null);
		setProcessedTableTopMask(null);
		setBaseImg(null);
		setMaskImg(null);
		setWoodImg(null);
		setTableTopImg(null);
		loadAllImages();

		return () => {
			isMounted.current = false;
		};
	}, [
		selectedFurniture,
		loadImage,
		selectedColor,
		selectedWoodColor,
		selectedTableTopColor,
		processMaskWithPalette,
	]);

	const processMask = useCallback(async () => {
		setProcessingFabric(true);
		try {
			const result = await processMaskWithPalette(
				maskImg,
				selectedColor,
				'fabric',
			);
			setProcessedMask(result);
		} finally {
			setProcessingFabric(false);
		}
	}, [maskImg, selectedColor, processMaskWithPalette]);

	const processWoodMask = useCallback(async () => {
		setProcessingWood(true);
		try {
			const result = await processMaskWithPalette(
				woodImg,
				selectedWoodColor,
				'wood',
			);
			setProcessedWoodMask(result);
		} finally {
			setProcessingWood(false);
		}
	}, [woodImg, selectedWoodColor, processMaskWithPalette]);

	const processTableTopMask = useCallback(async () => {
		setProcessingTableTop(true);
		try {
			const result = await processMaskWithPalette(
				tableTopImg,
				selectedTableTopColor,
				'wood',
			);
			setProcessedTableTopMask(result);
		} finally {
			setProcessingTableTop(false);
		}
	}, [tableTopImg, selectedTableTopColor, processMaskWithPalette]);

	useEffect(() => {
		if (baseImg && maskImg) {
			processMask();
		}
	}, [baseImg, maskImg, selectedColorId, processMask]);

	useEffect(() => {
		if (baseImg && woodImg) {
			processWoodMask();
		}
	}, [baseImg, woodImg, selectedWoodColorId, processWoodMask]);

	useEffect(() => {
		if (baseImg && tableTopImg) {
			processTableTopMask();
		}
	}, [baseImg, tableTopImg, selectedTableTopColorId, processTableTopMask]);

	// 📱 DIMENSIONES RESPONSIVAS DEL CANVAS
	const canvasSize =
		typeof window !== 'undefined' && window.innerWidth < 768
			? { width: 350, height: 350 }
			: { width: 565, height: 565 };

	// 🎯 CÁLCULO DE DIMENSIONES DE LAS IMÁGENES
	const getImageDimensions = useCallback(() => {
		if (!baseImg) return null;
		return calculateCoverDimensions(
			baseImg.width,
			baseImg.height,
			canvasSize.width,
			canvasSize.height,
		);
	}, [baseImg, canvasSize.width, canvasSize.height, calculateCoverDimensions]);

	const dimensions = getImageDimensions();

	const handleFurnitureSelect = (furnitureId: string) => {
		const furniture = FURNITURE_CATALOG.find((f) => f.id === furnitureId);
		if (!furniture) return;
		onLoadingChange?.(true); // Show loader immediately
		setSelectedFurniture(furniture);
		setSelectedColorId(furniture.defaultColorId);
		setSelectedWoodColorId(furniture.defaultWoodColorId);
		setSelectedTableTopColorId(furniture.defaultTableTopColorId || 'natural');
	};

	// Debounced color selection handlers
	const debounceTimeoutRef = useRef<number | null>(null);

	const handleColorSelect = useCallback((colorId: string) => {
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}
		debounceTimeoutRef.current = setTimeout(() => {
			setSelectedColorId(colorId);
		}, 200);
	}, []);

	const handleWoodColorSelect = useCallback((colorId: string) => {
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}
		debounceTimeoutRef.current = setTimeout(() => {
			setSelectedWoodColorId(colorId);
		}, 200);
	}, []);

	const handleTableTopColorSelect = useCallback((colorId: string) => {
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}
		debounceTimeoutRef.current = setTimeout(() => {
			setSelectedTableTopColorId(colorId);
		}, 200);
	}, []);

	const handleCreateOrder = () => {
		// 🔥 CAPTURAR IMAGEN OPTIMIZADA
		const optimizedImage = optimizeCanvasImage(stageRef.current, {
			maxWidth: 400,
			maxHeight: 400,
			quality: 0.7,
			format: 'jpeg',
		});

		// Crear configuración
		const configuracion = {
			muebleId: selectedFurniture.id,
			nombreMueble: selectedFurniture.name,
			colorTela: {
				id: selectedColorId,
				nombre: selectedColor.nombre,
				hex: selectedColor.hex,
			},
			colorMadera: {
				id: selectedWoodColorId,
				nombre: selectedWoodColor.nombre,
				hex: selectedWoodColor.hex,
			},
			colorSuperficie: {
				id: selectedTableTopColorId,
				nombre: selectedTableTopColor.nombre,
				hex: selectedTableTopColor.hex,
			},
		};

		const product = {
			title: selectedFurniture.name,
			price: 'Consultar precio personalizado',
			category: 'Muebles Personalizados',
			image: optimizedImage,
			isCustomized: true,
			customizationConfig: configuracion,
			description: selectedFurniture.description,
			dimensions: selectedFurniture.dimensions,
			material: selectedFurniture.materials,
			color: `Tela: ${selectedColor.nombre}, Madera: ${selectedWoodColor.nombre}, Superficie: ${selectedTableTopColor.nombre}`,
			warranty: selectedFurniture.warranty,
		};

		navigate('/order-form', { state: { product } });
	};

	return (
		<div
			className={`min-h-screen bg-background py-8 sm:py-12 md:py-16 ${className}`}
		>
			<div className='container mx-auto px-4 sm:px-6 md:px-8'>
				{/* TÍTULO */}
				<div className='text-center mb-8 sm:mb-10 md:mb-12'>
					<h2 className='text-3xl sm:text-4xl md:text-5xl font-serif-display font-bold mb-3 text-foreground'>
						Personaliza tu Mueble
					</h2>
					<p className='text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto'>
						Selecciona el mueble y juega con los colores hasta encontrar tu
						combinación perfecta
					</p>
				</div>

				{/* GRID PRINCIPAL */}
				<div className='grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start max-w-7xl mx-auto'>
					{/* CANVAS - IZQUIERDA */}
					<div className='order-1 lg:order-1'>
						<Card className='shadow-soft hover:shadow-hover transition-all duration-300'>
							<CardContent className='p-4 sm:p-6'>
								<div
									className='relative w-full rounded-lg bg-muted overflow-hidden'
									style={{
										aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
									}}
								>
									<Stage
										ref={stageRef}
										width={canvasSize.width}
										height={canvasSize.height}
										className='w-full h-full'
									>
										<Layer>
											{/* Imagen Base */}
											{dimensions && baseImg && (
												<KonvaImage
													image={baseImg}
													x={dimensions.x}
													y={dimensions.y}
													width={dimensions.width}
													height={dimensions.height}
												/>
											)}

											{/* Madera Barnizada */}
											{dimensions && processedWoodMask && woodImg && (
												<KonvaImage
													image={processedWoodMask}
													x={dimensions.x}
													y={dimensions.y}
													width={dimensions.width}
													height={dimensions.height}
													globalCompositeOperation='source-over'
													opacity={1}
												/>
											)}

											{/* Superficie de Mesa */}
											{dimensions && processedTableTopMask && tableTopImg && (
												<KonvaImage
													image={processedTableTopMask}
													x={dimensions.x}
													y={dimensions.y}
													width={dimensions.width}
													height={dimensions.height}
													globalCompositeOperation='source-over'
													opacity={1}
												/>
											)}

											{/* Tela */}
											{dimensions && processedMask && maskImg && (
												<KonvaImage
													image={processedMask}
													x={dimensions.x}
													y={dimensions.y}
													width={dimensions.width}
													height={dimensions.height}
													globalCompositeOperation='source-over'
													opacity={0.85}
												/>
											)}
										</Layer>
									</Stage>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* CONTROLES - DERECHA */}
					<div className='order-2 lg:order-2 space-y-6'>
						{/* SELECTOR DE MUEBLE */}
						<Card className='shadow-soft'>
							<CardHeader className='pb-3'>
								<CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
									<Package className='w-5 h-5 text-primary' />
									Selecciona el Mueble
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Select
									value={selectedFurniture.id}
									onValueChange={handleFurnitureSelect}
								>
									<SelectTrigger className='w-full'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{FURNITURE_CATALOG.map((furniture) => (
											<SelectItem key={furniture.id} value={furniture.id}>
												{furniture.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</CardContent>
						</Card>

						{/* SELECTORES DE COLOR */}
						<div className='grid grid-cols-1 gap-4'>
							{/* COLOR TELA */}
							<Card className='shadow-soft'>
								<CardHeader className='pb-3'>
									<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
										<Palette className='w-4 h-4 text-primary' />
										Tela
										{processingFabric && (
											<Loader2 className='w-4 h-4 animate-spin' />
										)}
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<Select
										value={selectedColorId}
										onValueChange={handleColorSelect}
										disabled={processingFabric}
									>
										<SelectTrigger className='w-full'>
											<SelectValue>
												<div className='flex items-center gap-2'>
													<div
														className='w-4 h-4 rounded-full border'
														style={{ backgroundColor: selectedColor.hex }}
													/>
													<span>{selectedColor.nombre}</span>
												</div>
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{COLORES_TELA.map((color) => (
												<SelectItem key={color.id} value={color.id}>
													<div className='flex items-center gap-2'>
														<div
															className='w-4 h-4 rounded-full border'
															style={{ backgroundColor: color.hex }}
														/>
														<span>{color.nombre}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className='text-center'>
										<span className='text-xs text-muted-foreground'>
											{selectedColor.hex}
										</span>
									</div>
								</CardContent>
							</Card>

							{/* COLOR MADERA */}
							<Card className='shadow-soft'>
								<CardHeader className='pb-3'>
									<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
										<Trees className='w-4 h-4 text-primary' />
										Barniz Madera
										{processingWood && (
											<Loader2 className='w-4 h-4 animate-spin' />
										)}
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<Select
										value={selectedWoodColorId}
										onValueChange={handleWoodColorSelect}
										disabled={processingWood}
									>
										<SelectTrigger className='w-full'>
											<SelectValue>
												<div className='flex items-center gap-2'>
													<div
														className='w-4 h-4 rounded-full border'
														style={{ backgroundColor: selectedWoodColor.hex }}
													/>
													<span>{selectedWoodColor.nombre}</span>
												</div>
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{COLORES_MADERA.map((color) => (
												<SelectItem key={color.id} value={color.id}>
													<div className='flex items-center gap-2'>
														<div
															className='w-4 h-4 rounded-full border'
															style={{ backgroundColor: color.hex }}
														/>
														<span>{color.nombre}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className='text-center'>
										<span className='text-xs text-muted-foreground'>
											{selectedWoodColor.hex}
										</span>
									</div>
								</CardContent>
							</Card>
							{/* COLOR SUPERFICIE MESA */}
							<Card className='shadow-soft'>
								<CardHeader className='pb-3'>
									<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
										<Trees className='w-4 h-4 text-primary' />
										Barniz Superficie
										{processingTableTop && (
											<Loader2 className='w-4 h-4 animate-spin' />
										)}
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<Select
										value={selectedTableTopColorId}
										onValueChange={handleTableTopColorSelect}
										disabled={processingTableTop}
									>
										<SelectTrigger className='w-full'>
											<SelectValue>
												<div className='flex items-center gap-2'>
													<div
														className='w-4 h-4 rounded-full border'
														style={{
															backgroundColor: selectedTableTopColor.hex,
														}}
													/>
													<span>{selectedTableTopColor.nombre}</span>
												</div>
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{COLORES_MADERA.map((color) => (
												<SelectItem key={color.id} value={color.id}>
													<div className='flex items-center gap-2'>
														<div
															className='w-4 h-4 rounded-full border'
															style={{ backgroundColor: color.hex }}
														/>
														<span>{color.nombre}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className='text-center'>
										<span className='text-xs text-muted-foreground'>
											{selectedTableTopColor.hex}
										</span>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* BOTÓN DE PEDIDO */}
						<Card className='shadow-soft'>
							<CardContent className='pt-6'>
								<button
									onClick={handleCreateOrder}
									className='w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-md py-4 px-4 sm:px-6 font-semibold shadow-hover hover:shadow-lg'
								>
									<ShoppingCart className='w-5 h-5' />
									<span className='text-base'>Hacer Pedido del Mueble</span>
								</button>
								<p className='text-xs text-muted-foreground text-center mt-3'>
									Guarda tu configuración para generar una cotización
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};
