import { InteractiveShowroom } from '@/components/InteractiveShowroom';
import mascaraTela from '@/assets/mascara_sillas_rango_completo.png';

const InteractiveCatalogPage = () => {
	return (
		<div className='min-h-screen'>
			<InteractiveShowroom
				baseImageUrl='https://i.imgur.com/1betuSZ.png'
				// maskImageUrl='https://i.imgur.com/oH39Enw.png'
				maskImageUrl={mascaraTela}
				woodMaskImageUrl='https://i.imgur.com/1jHvnWH.png'
				defaultColor='#8B4513'
				defaultWoodColor='#8B4513'
				width={600}
				height={450}
				onColorChange={(color) => console.log('Fabric Color:', color)}
				onWoodColorChange={(color) => console.log('Wood Color:', color)}
			/>
		</div>
	);
};

export default InteractiveCatalogPage;
