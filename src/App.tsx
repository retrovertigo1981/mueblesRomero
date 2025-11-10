import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { appRoutes } from '@/routes'; // Importa rutas tipadas

// Crea router desde rutas
const router = createBrowserRouter(appRoutes);

const App = () => <RouterProvider router={router} />;

export default App;
