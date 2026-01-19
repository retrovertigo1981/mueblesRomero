// src/workers/imageProcessor.worker.ts
import type { Colores } from '@/types/colors';

// Conversion functions (same as in component)
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

const processMaskWithPalette = (
	imageData: ImageData,
	colorTela: Colores,
	materialType: 'fabric' | 'wood',
): ImageData => {
	// TEMP: Return original imageData to test if worker works
	console.log('Processing mask with color:', colorTela.nombre, 'material:', materialType);
	return imageData;
};

// Worker message handler
self.onmessage = (e: MessageEvent) => {
	const { imageData, color, materialType } = e.data;

	try {
		const processedData = processMaskWithPalette(imageData, color, materialType);
		self.postMessage({ success: true, imageData: processedData }, [
			processedData.data.buffer,
		]);
	} catch (error) {
		self.postMessage({ success: false, error: error.message });
	}
};

export {};