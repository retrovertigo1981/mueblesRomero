// src/workers/imageProcessor.worker.ts
import type { Colores } from '@/types/colors';

const processMaskWithPalette = (
	imageData: ImageData,
	colorTela: Colores,
	materialType: 'fabric' | 'wood',
): ImageData => {
	// TEMP: Return original imageData to test if worker works
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
		self.postMessage({ success: false, error: (error as Error).message });
	}
};

export {};