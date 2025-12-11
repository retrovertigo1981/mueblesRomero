import { Link } from "react-router-dom";
// import { Sofa } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              {/* <Sofa className='w-6 h-6 text-primary' /> */}
              <img
                className="w-6 h-6"
                src="/muebles_romero_logo-removebg.png"
                alt="Muebles El Romero Logo"
              />
            </div>
            <span className="text-xl font-semibold text-foreground font-serif-display">
              Muebles El Romero
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors font-medium font-sans-romero"
            >
              Inicio
            </Link>
            <Link
              to="/contacto"
              className="text-foreground hover:text-primary transition-colors font-medium font-sans-romero"
            >
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
