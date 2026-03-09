import mediosPagos from '@/assets/medios_de_pagos.webp';

export const MediosPagos = () => {
    return (


        <div className='container mx-auto max-w-7xl p-8'>
            <div className='flex justify-center items-center gap-8'>

                <h3 className="text-[12px] sm:text-lg md:text-2xl font-bold mb-6 sm:mb-10 text-foreground font-serif-display text-center">
                    Aceptamos diferentes medios de pago
                </h3>
                <img
                    className='w-[100px] sm:w-[200px]'
                    src={mediosPagos}
                    alt="Medios de pago"
                />
            </div>
        </div>


    );
};