import { InteractiveShowroom } from '@/components/InteractiveShowroom';
import mascaraTela from '@/assets/mascara_sillas_rango_completo_2.png';
import mascaraMadera from '@/assets/mascara_madera_rango_completo.png';
import baseNeutra from '@/assets/base_neutra.png';

const InteractiveCatalogPage = () => {
	return (
		<div className='min-h-screen'>
			<InteractiveShowroom
				// baseImageUrl='https://i.imgur.com/1betuSZ.png'
				baseImageUrl={baseNeutra}
				// maskImageUrl='https://i.imgur.com/oH39Enw.png'
				maskImageUrl={mascaraTela}
				woodMaskImageUrl={mascaraMadera}
				defaultColorId='beige'
				defaultWoodColorId='natural'
				width={500}
				height={500}
				onColorChange={(colorId, hex) =>
					console.log('Fabric Color:', colorId, hex)
				}
				onWoodColorChange={(colorId, hex) =>
					console.log('Wood Color:', colorId, hex)
				}
			/>
		</div>
	);
};

export default InteractiveCatalogPage;
