import mediosPagos from '@/assets/medios_de_pagos.webp';

export const MediosPagos = () => {
    return (


        <div className='container mx-auto max-w-7xl mt-16'>
            <div className='flex flex-col items-center'>
                <h3 className="text-xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-10 text-foreground font-serif-display text-center">
                    Aceptamos diferentes medios de pago
                </h3>
                <img
                    className='w-[500px]'
                    src={mediosPagos}
                    alt="Medios de pago"
                />
            </div>
        </div>


    );
};