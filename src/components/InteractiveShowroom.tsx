import React, {
	useEffect,
	useState,
	useCallback,
	useMemo,
	useRef,
} from 'react';
import { useNavigate } from 'react-router';
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
import { COLORES_TELA } from '@/types/colors';
import { COLORES_MADERA } from '@/types/colors';
import type { Colores } from '@/types/colors';

interface ColorTelaWithLab extends Colores {
	lab: { l: number; a: number; b: number };
}

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
		baseImageUrl: 'src/assets/comedor_1_gemini_upscayl_4x.png',
		maskFabricImageUrl: 'src/assets/capa_tela_sillas_comedor_1.png',
		tableTopMaskImageUrl: 'src/assets/capa_cubierta_comedor_1.png',
		woodMaskImageUrl: 'src/assets/capa_madera_comerdor_1.png',
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
		baseImageUrl: 'src/assets/comedor_2_gemini_upscayl_4x.png',
		maskFabricImageUrl: 'src/assets/capa_tela_sillas_comedor_2.png',
		tableTopMaskImageUrl: 'src/assets/capa_cubierta_comedor_2.png',
		woodMaskImageUrl: 'src/assets/capa_madera_comerdor_2.png',
		defaultColorId: 'gris',
		defaultWoodColorId: 'natural',
		defaultTableTopColorId: 'natural',
	},
];

export const InteractiveShowroom: React.FC<InteractiveShowroomProps> = ({
	className = '',
}) => {
	const navigate = useNavigate();

	// Check for browser compatibility
	useEffect(() => {
		const isBrave = navigator.userAgent.includes('Brave');
		if (isBrave) {
			console.warn(
				'Brave browser detected. KonvaJS may be blocked by Brave shield. Please disable it.'
			);
		}
		console.log('Browser:', navigator.userAgent);
	}, []);

	const [selectedFurniture, setSelectedFurniture] =
		useState<CustomizableFurniture>(FURNITURE_CATALOG[0]);
	const [selectedColorId, setSelectedColorId] = useState(
		FURNITURE_CATALOG[0].defaultColorId
	);
	const [selectedWoodColorId, setSelectedWoodColorId] = useState(
		FURNITURE_CATALOG[0].defaultWoodColorId
	);
	const [selectedTableTopColorId, setSelectedTableTopColorId] = useState(
		FURNITURE_CATALOG[0].defaultTableTopColorId || 'natural'
	);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processedMask, setProcessedMask] = useState<HTMLCanvasElement | null>(
		null
	);
	const [processedWoodMask, setProcessedWoodMask] =
		useState<HTMLCanvasElement | null>(null);
	const [processedTableTopMask, setProcessedTableTopMask] =
		useState<HTMLCanvasElement | null>(null);

	const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
	const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
	const [woodImg, setWoodImg] = useState<HTMLImageElement | null>(null);
	const [tableTopImg, setTableTopImg] = useState<HTMLImageElement | null>(null);

	const isMounted = useRef(true);
	const stageRef = useRef<any>(null);

	const loadImage = useCallback(
		async (url: string): Promise<HTMLImageElement> => {
			console.log('Loading image:', url);
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					console.log('Image loaded successfully:', url);
					resolve(img);
				};
				img.onerror = (e) => {
					console.error('Failed to load image:', url, e);
					reject(e);
				};
				img.src = url;
			});
		},
		[]
	);

	// 🔬 ALGORITMO LAB
	const rgbToXyz = useCallback((r: number, g: number, b: number) => {
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
	}, []);

	const xyzToLab = useCallback((x: number, y: number, z: number) => {
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
	}, []);

	const labToXyz = useCallback((l: number, a: number, b: number) => {
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
	}, []);

	const xyzToRgb = useCallback((x: number, y: number, z: number) => {
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
	}, []);

	const rgbToLab = useCallback(
		(r: number, g: number, b: number) => {
			const xyz = rgbToXyz(r, g, b);
			return xyzToLab(xyz.x, xyz.y, xyz.z);
		},
		[rgbToXyz, xyzToLab]
	);

	const paletaConLab: ColorTelaWithLab[] = useMemo(() => {
		return COLORES_TELA.map((color) => ({
			...color,
			lab: rgbToLab(color.rgb.r, color.rgb.g, color.rgb.b),
		}));
	}, [rgbToLab]);

	const paletaMaderaConLab: ColorTelaWithLab[] = useMemo(() => {
		return COLORES_MADERA.map((color) => ({
			...color,
			lab: rgbToLab(color.rgb.r, color.rgb.g, color.rgb.b),
		}));
	}, [rgbToLab]);

	const selectedColor = useMemo(
		() => paletaConLab.find((c) => c.id === selectedColorId) || paletaConLab[0],
		[selectedColorId, paletaConLab]
	);

	const selectedWoodColor = useMemo(
		() =>
			paletaMaderaConLab.find((c) => c.id === selectedWoodColorId) ||
			paletaMaderaConLab[0],
		[selectedWoodColorId, paletaMaderaConLab]
	);

	const selectedTableTopColor = useMemo(
		() =>
			paletaMaderaConLab.find((c) => c.id === selectedTableTopColorId) ||
			paletaMaderaConLab[0],
		[selectedTableTopColorId, paletaMaderaConLab]
	);

	// 🪵 PROCESAMIENTO DE MADERA OPTIMIZADO - OPCIÓN 2: BALANCEADA
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

			// ⭐ PARÁMETROS OPTIMIZADOS PARA MAYOR INTENSIDAD DE COLOR
			const colorIntensity = materialType === 'wood' ? 0.95 : 0.92;
			const contrastBoost = materialType === 'wood' ? 1.25 : 1.0;
			const saturationFactor = materialType === 'wood' ? 1.3 : 1.1;
			const colorBoost = materialType === 'wood' ? 1.2 : 1.0;

			// ============ FASE 1: APLICACIÓN DE COLOR BASE ============
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

				// 🆕 AJUSTE DINÁMICO: Colores claros necesitan más rango
				const isLightColor = targetLab.l > 60;
				const rangeFactor = isLightColor ? 1.3 : 1.0;

				const targetLMin = Math.max(0, targetLab.l - 20 * rangeFactor);
				const targetLMax = Math.min(100, targetLab.l + 15 * rangeFactor);
				const adjustedL =
					targetLMin + (maskL / 100) * (targetLMax - targetLMin);

				const blendFactor = (alpha / 255) * colorIntensity;

				// 🆕 APLICAR COLOR BOOST
				let finalL =
					adjustedL * blendFactor * colorBoost + maskL * (1 - blendFactor);
				let finalA = targetLab.a * blendFactor * colorBoost;
				let finalB = targetLab.b * blendFactor * colorBoost;

				// 🆕 OSCURECER PARA MADERA
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

			// ============ FASE 2: POST-PROCESAMIENTO ============
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
			return canvas;
		},
		[xyzToRgb, labToXyz]
	);

	// 📏 SISTEMA DE ESCALADO "COVER"
	const calculateCoverDimensions = useCallback(
		(
			imgWidth: number,
			imgHeight: number,
			containerWidth: number,
			containerHeight: number
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
		[]
	);

	// 🔄 CARGA DE IMÁGENES
	useEffect(() => {
		isMounted.current = true;
		const loadAllImages = async () => {
			try {
				setLoading(true);
				setError(null);

				console.log('Loading furniture:', selectedFurniture.name);
				console.log('Base URL:', selectedFurniture.baseImageUrl);
				console.log('Mask URL:', selectedFurniture.maskFabricImageUrl);
				console.log('Wood URL:', selectedFurniture.woodMaskImageUrl);
				console.log('Table Top URL:', selectedFurniture.tableTopMaskImageUrl);

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
				setLoading(false);
			} catch (err) {
				if (!isMounted.current) return;
				console.error('Error loading images:', err);
				setError('Error al cargar las imágenes. Verifica las URLs.');
				setLoading(false);
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
	}, [selectedFurniture, loadImage]);

	const processMask = useCallback(
		() => processMaskWithPalette(maskImg, selectedColor, 'fabric'),
		[maskImg, selectedColor, processMaskWithPalette]
	);

	const processWoodMask = useCallback(
		() => processMaskWithPalette(woodImg, selectedWoodColor, 'wood'),
		[woodImg, selectedWoodColor, processMaskWithPalette]
	);

	const processTableTopMask = useCallback(
		() => processMaskWithPalette(tableTopImg, selectedTableTopColor, 'wood'),
		[tableTopImg, selectedTableTopColor, processMaskWithPalette]
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

	useEffect(() => {
		if (baseImg && tableTopImg) {
			setProcessedTableTopMask(processTableTopMask());
		}
	}, [baseImg, tableTopImg, selectedTableTopColorId, processTableTopMask]);

	// 📱 DIMENSIONES RESPONSIVAS DEL CANVAS
	const canvasSize =
		typeof window !== 'undefined' && window.innerWidth < 768
			? { width: 350, height: 350 }
			: { width: 600, height: 600 };

	// 🎯 CÁLCULO DE DIMENSIONES DE LAS IMÁGENES
	const getImageDimensions = useCallback(() => {
		if (!baseImg) return null;
		return calculateCoverDimensions(
			baseImg.width,
			baseImg.height,
			canvasSize.width,
			canvasSize.height
		);
	}, [baseImg, canvasSize.width, canvasSize.height, calculateCoverDimensions]);

	const dimensions = getImageDimensions();

	const handleFurnitureSelect = (furnitureId: string) => {
		const furniture = FURNITURE_CATALOG.find((f) => f.id === furnitureId);
		if (!furniture) return;
		setSelectedFurniture(furniture);
		setSelectedColorId(furniture.defaultColorId);
		setSelectedWoodColorId(furniture.defaultWoodColorId);
		setSelectedTableTopColorId(furniture.defaultTableTopColorId || 'natural');
	};

	const handleColorSelect = (colorId: string) => {
		setSelectedColorId(colorId);
	};

	const handleWoodColorSelect = (colorId: string) => {
		setSelectedWoodColorId(colorId);
	};

	const handleTableTopColorSelect = (colorId: string) => {
		setSelectedTableTopColorId(colorId);
	};

	const handleCreateOrder = () => {
		// Capture canvas image as compressed JPEG to stay under EmailJS 50KB limit
		const dataURL = stageRef.current?.toDataURL({
			width: 200,
			height: 200,
			mimeType: 'image/jpeg',
			quality: 0.6,
		});

		// Map furniture to product format for OrderForm
		const product = {
			title: selectedFurniture.name,
			price: 'Consultar precio personalizado',
			category: 'Muebles Personalizados',
			image: dataURL || '',
			description: selectedFurniture.description,
			dimensions: selectedFurniture.dimensions,
			material: selectedFurniture.materials,
			color: `Tela: ${selectedColor.nombre}, Madera: ${selectedWoodColor.nombre}, Superficie Mesa: ${selectedTableTopColor.nombre}`,
			warranty: selectedFurniture.warranty,
		};

		// Navigate to OrderForm with the product data
		navigate('/order-form', { state: { product } });
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Card className={className}>
					<CardContent className='flex items-center justify-center h-96 p-6'>
						<div className='flex flex-col items-center gap-4'>
							<Loader2 className='h-8 w-8 animate-spin text-primary' />
							<p className='text-muted-foreground'>
								Cargando personalizador...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Card className={className}>
					<CardContent className='flex items-center justify-center h-96 p-6'>
						<div className='text-center'>
							<p className='text-destructive font-semibold mb-2'>⚠️ {error}</p>
							<p className='text-sm text-muted-foreground'>
								Verifica que las imágenes existan en la carpeta assets
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen bg-background py-8 sm:py-12 md:py-16 ${className}`}
		>
			<div className='container mx-auto px-8 sm:px-6'>
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

											{/* Madera Barnizada - ⭐ OPACITY OPTIMIZADO 0.88 → 0.95 */}
											{dimensions && processedWoodMask && woodImg && (
												<KonvaImage
													image={processedWoodMask}
													x={dimensions.x}
													y={dimensions.y}
													width={dimensions.width}
													height={dimensions.height}
													globalCompositeOperation='source-over'
													opacity={0.95}
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
													opacity={0.95}
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
													opacity={0.95}
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
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{/* COLOR TELA */}
							<Card className='shadow-soft'>
								<CardHeader className='pb-3'>
									<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
										<Palette className='w-4 h-4 text-primary' />
										Tela
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<Select
										value={selectedColorId}
										onValueChange={handleColorSelect}
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
											{paletaConLab.map((color) => (
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
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<Select
										value={selectedWoodColorId}
										onValueChange={handleWoodColorSelect}
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
											{paletaMaderaConLab.map((color) => (
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
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<Select
										value={selectedTableTopColorId}
										onValueChange={handleTableTopColorSelect}
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
											{paletaMaderaConLab.map((color) => (
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
									className='w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-md py-4 px-6 font-semibold shadow-hover hover:shadow-lg'
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

// import React, {
// 	useEffect,
// 	useState,
// 	useCallback,
// 	useMemo,
// 	useRef,
// } from 'react';
// import { Stage, Layer, Image as KonvaImage } from 'react-konva';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Loader2, Palette, Trees, Package, ShoppingCart } from 'lucide-react';
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from '@/components/ui/select';
// import { COLORES_TELA } from '@/types/colors';
// import { COLORES_MADERA } from '@/types/colors';
// import type { Colores } from '@/types/colors';

// interface ColorTelaWithLab extends Colores {
// 	lab: { l: number; a: number; b: number };
// }

// interface CustomizableFurniture {
// 	id: string;
// 	name: string;
// 	baseImageUrl: string;
// 	maskImageUrl: string;
// 	woodMaskImageUrl: string;
// 	defaultColorId: string;
// 	defaultWoodColorId: string;
// }

// interface InteractiveShowroomProps {
// 	className?: string;
// }

// // 🪑 CATÁLOGO DE MUEBLES
// const FURNITURE_CATALOG: CustomizableFurniture[] = [
// 	{
// 		id: 'silla-dining',
// 		name: 'Silla Comedor',
// 		baseImageUrl: 'src/assets/base_neutra.png',
// 		maskImageUrl: 'src/assets/mascara_sillas_rango_completo_2.png',
// 		woodMaskImageUrl: 'src/assets/mascara_madera_rango_completo.png',
// 		defaultColorId: 'beige',
// 		defaultWoodColorId: 'natural',
// 	},
// 	// PLACEHOLDERS - REEMPLAZA CON TUS IMÁGENES REALES
// 	{
// 		id: 'comedor-2',
// 		name: 'Comedor 2',
// 		baseImageUrl: 'src/assets/base-neutra-comedor-2.png',
// 		maskImageUrl: 'src/assets/fabric-mask-comerdor-2.png',
// 		woodMaskImageUrl: 'src/assets/wood-mask-comedor-2.png',
// 		defaultColorId: 'gris',
// 		defaultWoodColorId: 'nogal',
// 	},
// 	// {
// 	// 	id: 'mesa-centro',
// 	// 	name: 'Mesa de Centro',
// 	// 	baseImageUrl: 'src/assets/mesa-base.jpg',
// 	// 	maskImageUrl: 'src/assets/mesa-fabric-mask.png',
// 	// 	woodMaskImageUrl: 'src/assets/mesa-wood-mask.png',
// 	// 	defaultColorId: 'crudo',
// 	// 	defaultWoodColorId: 'miel',
// 	// },
// 	// ... Agrega hasta 10 muebles
// ];

// export const InteractiveShowroom: React.FC<InteractiveShowroomProps> = ({
// 	className = '',
// }) => {
// 	// Check for browser compatibility
// 	useEffect(() => {
// 		const isBrave = navigator.userAgent.includes('Brave');
// 		if (isBrave) {
// 			console.warn(
// 				'Brave browser detected. KonvaJS may be blocked by Brave shield. Please disable it.'
// 			);
// 		}
// 		console.log('Browser:', navigator.userAgent);
// 	}, []);

// 	const [selectedFurniture, setSelectedFurniture] =
// 		useState<CustomizableFurniture>(FURNITURE_CATALOG[0]);
// 	const [selectedColorId, setSelectedColorId] = useState(
// 		FURNITURE_CATALOG[0].defaultColorId
// 	);
// 	const [selectedWoodColorId, setSelectedWoodColorId] = useState(
// 		FURNITURE_CATALOG[0].defaultWoodColorId
// 	);

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

// 	const isMounted = useRef(true);

// 	const loadImage = useCallback(
// 		async (url: string): Promise<HTMLImageElement> => {
// 			console.log('Loading image:', url);
// 			return new Promise((resolve, reject) => {
// 				const img = new Image();
// 				// Remove crossOrigin for local images
// 				img.onload = () => {
// 					console.log('Image loaded successfully:', url);
// 					resolve(img);
// 				};
// 				img.onerror = (e) => {
// 					console.error('Failed to load image:', url, e);
// 					reject(e);
// 				};
// 				img.src = url;
// 			});
// 		},
// 		[]
// 	);

// 	// 🔬 ALGORITMO LAB (igual que antes)
// 	const rgbToXyz = useCallback((r: number, g: number, b: number) => {
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
// 	}, []);

// 	const xyzToLab = useCallback((x: number, y: number, z: number) => {
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
// 	}, []);

// 	const labToXyz = useCallback((l: number, a: number, b: number) => {
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
// 	}, []);

// 	const xyzToRgb = useCallback((x: number, y: number, z: number) => {
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
// 	}, []);

// 	const rgbToLab = useCallback(
// 		(r: number, g: number, b: number) => {
// 			const xyz = rgbToXyz(r, g, b);
// 			return xyzToLab(xyz.x, xyz.y, xyz.z);
// 		},
// 		[rgbToXyz, xyzToLab]
// 	);

// 	const paletaConLab: ColorTelaWithLab[] = useMemo(() => {
// 		return COLORES_TELA.map((color) => ({
// 			...color,
// 			lab: rgbToLab(color.rgb.r, color.rgb.g, color.rgb.b),
// 		}));
// 	}, [rgbToLab]);

// 	const paletaMaderaConLab: ColorTelaWithLab[] = useMemo(() => {
// 		return COLORES_MADERA.map((color) => ({
// 			...color,
// 			lab: rgbToLab(color.rgb.r, color.rgb.g, color.rgb.b),
// 		}));
// 	}, [rgbToLab]);

// 	const selectedColor = useMemo(
// 		() => paletaConLab.find((c) => c.id === selectedColorId) || paletaConLab[0],
// 		[selectedColorId, paletaConLab]
// 	);

// 	const selectedWoodColor = useMemo(
// 		() =>
// 			paletaMaderaConLab.find((c) => c.id === selectedWoodColorId) ||
// 			paletaMaderaConLab[0],
// 		[selectedWoodColorId, paletaMaderaConLab]
// 	);

// 	// 🪵 PROCESAMIENTO DE BARNIZ REALISTA
// 	const processMaskWithPalette = useCallback(
// 		(
// 			maskImage: HTMLImageElement | null,
// 			colorTela: ColorTelaWithLab,
// 			materialType: 'fabric' | 'wood'
// 		): HTMLCanvasElement | null => {
// 			if (!maskImage || !colorTela.lab) return null;

// 			const canvas = document.createElement('canvas');
// 			canvas.width = maskImage.width;
// 			canvas.height = maskImage.height;
// 			const ctx = canvas.getContext('2d', { willReadFrequently: true });
// 			if (!ctx) return null;

// 			ctx.drawImage(maskImage, 0, 0);
// 			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// 			const pixels = imageData.data;

// 			const targetLab = colorTela.lab;
// 			const colorIntensity = materialType === 'wood' ? 0.68 : 0.92;
// 			const contrastBoost = materialType === 'wood' ? 1.25 : 1.0;
// 			const saturationFactor = materialType === 'wood' ? 1.15 : 1.1;

// 			for (let i = 0; i < pixels.length; i += 4) {
// 				const alpha = pixels[i + 3];
// 				if (alpha < 30) {
// 					pixels[i + 3] = 0;
// 					continue;
// 				}

// 				const r = pixels[i];
// 				const g = pixels[i + 1];
// 				const b = pixels[i + 2];

// 				const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
// 				const maskL = (luminosity / 255) * 100;

// 				const targetLMin = Math.max(0, targetLab.l - 18);
// 				const targetLMax = Math.min(100, targetLab.l + 22);
// 				const adjustedL =
// 					targetLMin + (maskL / 100) * (targetLMax - targetLMin);

// 				const blendFactor = (alpha / 255) * colorIntensity;
// 				const finalL = adjustedL * blendFactor + maskL * (1 - blendFactor);
// 				const finalA = targetLab.a * blendFactor;
// 				const finalB = targetLab.b * blendFactor;

// 				const { x, y, z } = labToXyz(finalL, finalA, finalB);
// 				const finalRgb = xyzToRgb(x, y, z);

// 				pixels[i] = finalRgb.r;
// 				pixels[i + 1] = finalRgb.g;
// 				pixels[i + 2] = finalRgb.b;
// 				pixels[i + 3] = Math.max(0, alpha - 6);
// 			}

// 			if (materialType === 'wood') {
// 				for (let i = 0; i < pixels.length; i += 4) {
// 					if (pixels[i + 3] === 0) continue;

// 					let r = pixels[i];
// 					let g = pixels[i + 1];
// 					let b = pixels[i + 2];

// 					const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
// 					const contrasted = (luminosity - 128) * contrastBoost + 128;
// 					const delta = contrasted - luminosity;

// 					const glossIntensity = 0.85 + (luminosity / 255) * 0.15;
// 					const warmth = 1.06;

// 					r = Math.min(255, (r + delta) * glossIntensity * warmth);
// 					g = Math.min(255, (g + delta) * glossIntensity);
// 					b = Math.min(255, (b + delta) * glossIntensity * warmth * 0.95);

// 					const gray = 0.299 * r + 0.587 * g + 0.114 * b;
// 					pixels[i] = Math.min(255, gray + saturationFactor * (r - gray));
// 					pixels[i + 1] = Math.min(255, gray + saturationFactor * (g - gray));
// 					pixels[i + 2] = Math.min(255, gray + saturationFactor * (b - gray));
// 				}
// 			} else {
// 				for (let i = 0; i < pixels.length; i += 4) {
// 					if (pixels[i + 3] === 0) continue;
// 					const r = pixels[i];
// 					const g = pixels[i + 1];
// 					const b = pixels[i + 2];
// 					const gray = 0.299 * r + 0.587 * g + 0.114 * b;
// 					pixels[i] = Math.min(255, gray + saturationFactor * (r - gray));
// 					pixels[i + 1] = Math.min(255, gray + saturationFactor * (g - gray));
// 					pixels[i + 2] = Math.min(255, gray + saturationFactor * (b - gray));
// 				}
// 			}

// 			ctx.putImageData(imageData, 0, 0);
// 			return canvas;
// 		},
// 		[xyzToRgb, labToXyz]
// 	);

// 	// 📏 SISTEMA DE ESCALADO "COVER" - ¡NUEVO!
// 	const calculateCoverDimensions = useCallback(
// 		(
// 			imgWidth: number,
// 			imgHeight: number,
// 			containerWidth: number,
// 			containerHeight: number
// 		) => {
// 			const imgAspect = imgWidth / imgHeight;
// 			const containerAspect = containerWidth / containerHeight;

// 			let width: number;
// 			let height: number;
// 			let x: number;
// 			let y: number;

// 			if (imgAspect > containerAspect) {
// 				// Imagen más ancha - escalar por altura
// 				height = containerHeight;
// 				width = height * imgAspect;
// 				x = (containerWidth - width) / 2;
// 				y = 0;
// 			} else {
// 				// Imagen más alta - escalar por ancho
// 				width = containerWidth;
// 				height = width / imgAspect;
// 				x = 0;
// 				y = (containerHeight - height) / 2;
// 			}

// 			return {
// 				width,
// 				height,
// 				x,
// 				y,
// 				scaleX: width / imgWidth,
// 				scaleY: height / imgHeight,
// 			};
// 		},
// 		[]
// 	);

// 	// 🔄 CARGA DE IMÁGENES
// 	useEffect(() => {
// 		isMounted.current = true;
// 		const loadAllImages = async () => {
// 			try {
// 				setLoading(true);
// 				setError(null);

// 				console.log('Loading furniture:', selectedFurniture.name);
// 				console.log('Base URL:', selectedFurniture.baseImageUrl);
// 				console.log('Mask URL:', selectedFurniture.maskImageUrl);
// 				console.log('Wood URL:', selectedFurniture.woodMaskImageUrl);

// 				const [base, mask, wood] = await Promise.all([
// 					loadImage(selectedFurniture.baseImageUrl),
// 					loadImage(selectedFurniture.maskImageUrl),
// 					loadImage(selectedFurniture.woodMaskImageUrl),
// 				]);

// 				if (!isMounted.current) return;

// 				setBaseImg(base);
// 				setMaskImg(mask);
// 				setWoodImg(wood);
// 				setLoading(false);
// 			} catch (err) {
// 				if (!isMounted.current) return;
// 				console.error('Error loading images:', err);
// 				setError('Error al cargar las imágenes. Verifica las URLs.');
// 				setLoading(false);
// 			}
// 		};

// 		setProcessedMask(null);
// 		setProcessedWoodMask(null);
// 		setBaseImg(null);
// 		setMaskImg(null);
// 		setWoodImg(null);
// 		loadAllImages();

// 		return () => {
// 			isMounted.current = false;
// 		};
// 	}, [selectedFurniture, loadImage]);

// 	const processMask = useCallback(
// 		() => processMaskWithPalette(maskImg, selectedColor, 'fabric'),
// 		[maskImg, selectedColor, processMaskWithPalette]
// 	);

// 	const processWoodMask = useCallback(
// 		() => processMaskWithPalette(woodImg, selectedWoodColor, 'wood'),
// 		[woodImg, selectedWoodColor, processMaskWithPalette]
// 	);

// 	useEffect(() => {
// 		if (baseImg && maskImg) {
// 			setProcessedMask(processMask());
// 		}
// 	}, [baseImg, maskImg, selectedColorId, processMask]);

// 	useEffect(() => {
// 		if (baseImg && woodImg) {
// 			setProcessedWoodMask(processWoodMask());
// 		}
// 	}, [baseImg, woodImg, selectedWoodColorId, processWoodMask]);

// 	// 📱 DIMENSIONES RESPONSIVAS DEL CANVAS
// 	const canvasSize =
// 		typeof window !== 'undefined' && window.innerWidth < 768
// 			? { width: 350, height: 350 }
// 			: { width: 600, height: 600 };

// 	// 🎯 CÁLCULO DE DIMENSIONES DE LAS IMÁGENES (AHORA USANDO "COVER")
// 	const getImageDimensions = useCallback(() => {
// 		if (!baseImg) return null;
// 		return calculateCoverDimensions(
// 			baseImg.width,
// 			baseImg.height,
// 			canvasSize.width,
// 			canvasSize.height
// 		);
// 	}, [baseImg, canvasSize.width, canvasSize.height, calculateCoverDimensions]);

// 	const dimensions = getImageDimensions();

// 	const handleFurnitureSelect = (furnitureId: string) => {
// 		const furniture = FURNITURE_CATALOG.find((f) => f.id === furnitureId);
// 		if (!furniture) return;
// 		setSelectedFurniture(furniture);
// 		setSelectedColorId(furniture.defaultColorId);
// 		setSelectedWoodColorId(furniture.defaultWoodColorId);
// 	};

// 	const handleColorSelect = (colorId: string) => {
// 		setSelectedColorId(colorId);
// 	};

// 	const handleWoodColorSelect = (colorId: string) => {
// 		setSelectedWoodColorId(colorId);
// 	};

// 	const handleCreateOrder = () => {
// 		const orderData = {
// 			furniture: selectedFurniture.name,
// 			fabricColor: selectedColor.nombre,
// 			woodColor: selectedWoodColor.nombre,
// 			timestamp: new Date().toISOString(),
// 		};
// 		console.log('🛒 Orden generada:', orderData);
// 		alert(
// 			`Orden generada para: ${selectedFurniture.name}\nTela: ${selectedColor.nombre}\nMadera: ${selectedWoodColor.nombre}`
// 		);
// 	};

// 	if (loading) {
// 		return (
// 			<div className='min-h-screen flex items-center justify-center'>
// 				<Card className={className}>
// 					<CardContent className='flex items-center justify-center h-96 p-6'>
// 						<div className='flex flex-col items-center gap-4'>
// 							<Loader2 className='h-8 w-8 animate-spin text-primary' />
// 							<p className='text-muted-foreground'>
// 								Cargando personalizador...
// 							</p>
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>
// 		);
// 	}

// 	if (error) {
// 		return (
// 			<div className='min-h-screen flex items-center justify-center'>
// 				<Card className={className}>
// 					<CardContent className='flex items-center justify-center h-96 p-6'>
// 						<div className='text-center'>
// 							<p className='text-destructive font-semibold mb-2'>⚠️ {error}</p>
// 							<p className='text-sm text-muted-foreground'>
// 								Verifica que las imágenes existan en la carpeta assets
// 							</p>
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div
// 			className={`min-h-screen bg-background py-8 sm:py-12 md:py-16 ${className}`}
// 		>
// 			{' '}
// 			<div className='container mx-auto px-8 sm:px-6'>
// 				{/* TÍTULO */}
// 				<div className='text-center mb-8 sm:mb-10 md:mb-12'>
// 					<h2 className='text-3xl sm:text-4xl md:text-5xl font-serif-display font-bold mb-3 text-foreground'>
// 						Personaliza tu Mueble
// 					</h2>
// 					<p className='text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto'>
// 						Selecciona el mueble y juega con los colores hasta encontrar tu
// 						combinación perfecta
// 					</p>
// 				</div>

// 				{/* GRID PRINCIPAL */}
// 				<div className='grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start max-w-7xl mx-auto'>
// 					{/* CANVAS - IZQUIERDA */}
// 					<div className='order-1 lg:order-1'>
// 						<Card className='shadow-soft hover:shadow-hover transition-all duration-300'>
// 							<CardContent className='p-4 sm:p-6'>
// 								<div
// 									className='relative w-full rounded-lg bg-muted overflow-hidden'
// 									style={{
// 										aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
// 									}}
// 								>
// 									<Stage
// 										width={canvasSize.width}
// 										height={canvasSize.height}
// 										className='w-full h-full'
// 									>
// 										<Layer>
// 											{/* Imagen Base */}
// 											{dimensions && baseImg && (
// 												<KonvaImage
// 													image={baseImg}
// 													x={dimensions.x}
// 													y={dimensions.y}
// 													width={dimensions.width}
// 													height={dimensions.height}
// 												/>
// 											)}

// 											{/* Madera Barnizada */}
// 											{dimensions && processedWoodMask && woodImg && (
// 												<KonvaImage
// 													image={processedWoodMask}
// 													x={dimensions.x}
// 													y={dimensions.y}
// 													width={dimensions.width}
// 													height={dimensions.height}
// 													globalCompositeOperation='multiply'
// 													opacity={0.88}
// 												/>
// 											)}

// 											{/* Tela */}
// 											{dimensions && processedMask && maskImg && (
// 												<KonvaImage
// 													image={processedMask}
// 													x={dimensions.x}
// 													y={dimensions.y}
// 													width={dimensions.width}
// 													height={dimensions.height}
// 													globalCompositeOperation='source-over'
// 													opacity={0.95}
// 												/>
// 											)}
// 										</Layer>
// 									</Stage>
// 								</div>
// 							</CardContent>
// 						</Card>
// 					</div>

// 					{/* CONTROLES - DERECHA */}
// 					<div className='order-2 lg:order-2 space-y-6'>
// 						{/* SELECTOR DE MUEBLE */}
// 						<Card className='shadow-soft'>
// 							<CardHeader className='pb-3'>
// 								<CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
// 									<Package className='w-5 h-5 text-primary' />
// 									Selecciona el Mueble
// 								</CardTitle>
// 							</CardHeader>
// 							<CardContent>
// 								<Select
// 									value={selectedFurniture.id}
// 									onValueChange={handleFurnitureSelect}
// 								>
// 									<SelectTrigger className='w-full'>
// 										<SelectValue />
// 									</SelectTrigger>
// 									<SelectContent>
// 										{FURNITURE_CATALOG.map((furniture) => (
// 											<SelectItem key={furniture.id} value={furniture.id}>
// 												{furniture.name}
// 											</SelectItem>
// 										))}
// 									</SelectContent>
// 								</Select>
// 							</CardContent>
// 						</Card>

// 						{/* SELECTORES DE COLOR */}
// 						<div className='grid sm:grid-cols-2 gap-4'>
// 							{/* COLOR TELA */}
// 							<Card className='shadow-soft'>
// 								<CardHeader className='pb-3'>
// 									<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
// 										<Palette className='w-4 h-4 text-primary' />
// 										Tela
// 									</CardTitle>
// 								</CardHeader>
// 								<CardContent className='space-y-3'>
// 									<Select
// 										value={selectedColorId}
// 										onValueChange={handleColorSelect}
// 									>
// 										<SelectTrigger className='w-full'>
// 											<SelectValue>
// 												<div className='flex items-center gap-2'>
// 													<div
// 														className='w-4 h-4 rounded-full border'
// 														style={{ backgroundColor: selectedColor.hex }}
// 													/>
// 													<span>{selectedColor.nombre}</span>
// 												</div>
// 											</SelectValue>
// 										</SelectTrigger>
// 										<SelectContent>
// 											{paletaConLab.map((color) => (
// 												<SelectItem key={color.id} value={color.id}>
// 													<div className='flex items-center gap-2'>
// 														<div
// 															className='w-4 h-4 rounded-full border'
// 															style={{ backgroundColor: color.hex }}
// 														/>
// 														<span>{color.nombre}</span>
// 													</div>
// 												</SelectItem>
// 											))}
// 										</SelectContent>
// 									</Select>
// 									<div className='text-center'>
// 										<span className='text-xs text-muted-foreground'>
// 											{selectedColor.hex}
// 										</span>
// 									</div>
// 								</CardContent>
// 							</Card>

// 							{/* COLOR MADERA */}
// 							<Card className='shadow-soft'>
// 								<CardHeader className='pb-3'>
// 									<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
// 										<Trees className='w-4 h-4 text-primary' />
// 										Barniz Madera
// 									</CardTitle>
// 								</CardHeader>
// 								<CardContent className='space-y-3'>
// 									<Select
// 										value={selectedWoodColorId}
// 										onValueChange={handleWoodColorSelect}
// 									>
// 										<SelectTrigger className='w-full'>
// 											<SelectValue>
// 												<div className='flex items-center gap-2'>
// 													<div
// 														className='w-4 h-4 rounded-full border'
// 														style={{ backgroundColor: selectedWoodColor.hex }}
// 													/>
// 													<span>{selectedWoodColor.nombre}</span>
// 												</div>
// 											</SelectValue>
// 										</SelectTrigger>
// 										<SelectContent>
// 											{paletaMaderaConLab.map((color) => (
// 												<SelectItem key={color.id} value={color.id}>
// 													<div className='flex items-center gap-2'>
// 														<div
// 															className='w-4 h-4 rounded-full border'
// 															style={{ backgroundColor: color.hex }}
// 														/>
// 														<span>{color.nombre}</span>
// 													</div>
// 												</SelectItem>
// 											))}
// 										</SelectContent>
// 									</Select>
// 									<div className='text-center'>
// 										<span className='text-xs text-muted-foreground'>
// 											{selectedWoodColor.hex}
// 										</span>
// 									</div>
// 								</CardContent>
// 							</Card>
// 						</div>

// 						{/* BOTÓN DE PEDIDO */}
// 						<Card className='shadow-soft'>
// 							<CardContent className='pt-6'>
// 								<button
// 									onClick={handleCreateOrder}
// 									className='w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-md py-4 px-6 font-semibold shadow-hover hover:shadow-lg'
// 								>
// 									<ShoppingCart className='w-5 h-5' />
// 									<span className='text-base'>Hacer Pedido del Mueble</span>
// 								</button>
// 								<p className='text-xs text-muted-foreground text-center mt-3'>
// 									Guarda tu configuración para generar una cotización
// 								</p>
// 							</CardContent>
// 						</Card>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
