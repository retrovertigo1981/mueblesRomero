import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { appRoutes } from '@/routes'; // Importa rutas tipadas
import { ScrollToTop } from '@/components/ScrollToTop';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

// Crea router desde rutas
const router = createBrowserRouter(appRoutes);

const App = () => (
	<>
		<Toaster />
		<Navbar />
		<ScrollToTop />
		<RouterProvider router={router} />
		<Footer />
	</>
);

export default App;
