import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';

interface CarruselFotosProps {
    images: {
        src: string;
        alt: string;
    }[];
    autoPlayInterval?: number;
}

export const CarruselFotos = ({ images, autoPlayInterval = 3000 }: CarruselFotosProps) => {
    const [api, setApi] = useState<CarouselApi>();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startAutoPlay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!api) return;
            if (api.canScrollNext()) {
                api.scrollNext();
            } else {
                api.scrollTo(0);
            }
        }, autoPlayInterval);
    }, [api, autoPlayInterval]);

    const stopAutoPlay = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const resetAutoPlay = useCallback(() => {
        stopAutoPlay();
        startAutoPlay();
    }, [startAutoPlay, stopAutoPlay]);

    useEffect(() => {
        if (!api) return;

        // Start autoplay immediately once API is available
        startAutoPlay();

        // Reset timer on every slide selection (manual or auto)
        api.on('select', resetAutoPlay);

        // Cleanup
        return () => {
            api.off('select', resetAutoPlay);
            stopAutoPlay();
        };
    }, [api, startAutoPlay, stopAutoPlay, resetAutoPlay]);

    return (
        <div
            className="w-full px-4 py-12"
            onMouseEnter={stopAutoPlay}
            onMouseLeave={startAutoPlay}
        >
            <Carousel
                setApi={setApi}
                opts={{ align: 'start', loop: true }}
                className="w-full max-w-5xl mx-auto"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {images.map((image, index) => (
                        <CarouselItem
                            key={index}
                            className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                        >
                            <div className="relative overflow-hidden rounded-2xl shadow-md group h-64 md:h-80">
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-2xl" />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <CarouselPrevious
                    className="hidden sm:flex -left-5 bg-white/90 hover:bg-white shadow-lg border-none"
                />
                <CarouselNext
                    className="hidden sm:flex -right-5 bg-white/90 hover:bg-white shadow-lg border-none"
                />
            </Carousel>
        </div>
    );
};