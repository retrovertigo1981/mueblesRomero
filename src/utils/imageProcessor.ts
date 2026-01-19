// src/utils/imageProcessor.ts
import type { Colores } from '@/types/colors';

// Create worker instance
let worker: Worker | null = null;

const getWorker = (): Worker => {
	if (!worker) {
		worker = new Worker(new URL('../workers/imageProcessor.worker.ts', import.meta.url), {
			type: 'module',
		});
	}
	return worker;
};

export const processMaskWithWorker = async (
	imageData: ImageData,
	color: Colores,
	materialType: 'fabric' | 'wood',
): Promise<ImageData> => {
	return new Promise((resolve, reject) => {
		const worker = getWorker();

		const handleMessage = (e: MessageEvent) => {
			worker.removeEventListener('message', handleMessage);
			worker.removeEventListener('error', handleError);

			if (e.data.success) {
				// Reconstruct ImageData from transferred buffer
				const processedImageData = new ImageData(
					new Uint8ClampedArray(e.data.imageData.data),
					e.data.imageData.width,
					e.data.imageData.height
				);
				resolve(processedImageData);
			} else {
				reject(new Error(e.data.error));
			}
		};

		const handleError = (error: ErrorEvent) => {
			worker.removeEventListener('message', handleMessage);
			worker.removeEventListener('error', handleError);
			reject(error);
		};

		worker.addEventListener('message', handleMessage);
		worker.addEventListener('error', handleError);

		// Send data to worker (transfer the buffer for performance)
		worker.postMessage(
			{
				imageData: {
					data: imageData.data.buffer,
					width: imageData.width,
					height: imageData.height,
				},
				color,
				materialType,
			},
			[imageData.data.buffer] // Transfer the buffer
		);
	});
};

// Cleanup function
export const terminateWorker = () => {
	if (worker) {
		worker.terminate();
		worker = null;
	}
};