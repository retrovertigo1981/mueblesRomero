import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { InteractiveShowroom } from '@/components/InteractiveShowroom';

function App() {
	return (
		<>
			<div className='min-h-screen'>
				<Navbar />
				<Hero />
				<ProductGrid />
				<InteractiveShowroom />
				<Footer />
			</div>
		</>
	);
}

export default App;
