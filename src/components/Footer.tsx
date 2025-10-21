import { Sofa, Facebook, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sofa className="w-6 h-6 text-primary" />
              <span className="text-xl font-semibold">Muebles Modernos</span>
            </div>
            <p className="text-background/80">
              Transformando espacios con muebles de calidad y diseño excepcional desde 2020.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-primary transition-colors">Inicio</a></li>
              <li><a href="#catalogo-clasico" className="hover:text-primary transition-colors">Catálogo</a></li>
              <li><a href="#catalogo-interactivo" className="hover:text-primary transition-colors">Personalizar</a></li>
              <li><a href="/contacto" className="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">Síguenos</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-background/70">
          <p>&copy; 2024 Muebles Modernos. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
