import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Index from '@/pages/Index';
import ClassicCatalogPage from '@/pages/classicCatalogPage';
import InteractiveCatalogPage from '@/pages/interactiveCatalogPage';

const App = () => (
	<BrowserRouter>
		<Navbar />
		<ScrollToTop />
		<Routes>
			<Route path='/' element={<Index />} />
			<Route path='/catalogo-clasico' element={<ClassicCatalogPage />} />
			<Route
				path='/catalogo-interactivo'
				element={<InteractiveCatalogPage />}
			/>
		</Routes>
		<Footer />
	</BrowserRouter>
);

export default App;
