import { Hero } from '@/components/Hero';

import { SelectCatalog } from '@/components/SelectCatalog';

const Index = () => {
	return (
		<>
			<div className='min-h-screen'>
				<Hero />
				<SelectCatalog />
			</div>
		</>
	);
};

export default Index;
