import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

export const Layout = () => (
	<>
		<Toaster />
		<Navbar />
		<ScrollToTop />
		<Outlet />
		<Footer />
	</>
);
