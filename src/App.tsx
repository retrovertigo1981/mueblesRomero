import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import ClassicCatalogPage from '@/pages/classicCatalogPage';
import InteractiveCatalogPage from '@/pages/interactiveCatalogPage';
import ContactPage from '@/pages/contactPage';
import DetailProductPage from '@/pages/DetailProductPage';
import NotFound from './pages/NotFoundPage';

const App = () => (
	<BrowserRouter>
		<Toaster />
		<Navbar />
		<ScrollToTop />
		<Routes>
			<Route path='/' element={<Index />} />
			<Route path='/catalogo-clasico' element={<ClassicCatalogPage />} />
			<Route
				path='/catalogo-interactivo'
				element={<InteractiveCatalogPage />}
			/>
			<Route path='/contacto' element={<ContactPage />} />
			<Route path='/producto/:id' element={<DetailProductPage />} />
			<Route path='*' element={<NotFound />} />
		</Routes>
		<Footer />
	</BrowserRouter>
);

export default App;
