import { Truck, MapPin, CreditCard } from 'lucide-react';

const marqueeItems = [
    { text: 'Trasladamos su mueble dentro de Santiago', icon: Truck },
    { text: 'Realizamos despacho a todo Chile', icon: MapPin },
    { text: 'Aceptamos diferentes medios de Pago', icon: CreditCard },
];

const allItems = [...marqueeItems, ...marqueeItems];

export const Marquesina = () => {
    return (
        <section className='bg-primary py-4 overflow-hidden'>
            <div className='relative flex'>
                <div className='flex items-center animate-marquee-track'>
                    {allItems.map((item, index) => (
                        <div
                            key={index}
                            className='flex items-center gap-2 sm:gap-3 text-primary-foreground font-medium font-sans-romero px-8 sm:px-16 whitespace-nowrap'
                        >
                            <item.icon className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' />
                            <span className='text-sm sm:text-base md:text-lg'>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes marquee-track {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-track {
                    animation: marquee-track 20s linear infinite;
                    will-change: transform;
                }
            `}</style>
        </section>
    );
};