import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { CleanProductDetail } from "@/types";
import {
  ArrowLeft,
  Ruler,
  Package,
  Palette,
  Shield,
  Loader2,
} from "lucide-react";

interface LocationState {
  product: CleanProductDetail;
}

export const OrderForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const form = useRef<HTMLFormElement>(null);
  const { product } = (location.state as LocationState) || {};
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    direccion: "",
    ciudad: "",
    comentario: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current) return;
    setIsLoading(true);

    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceID || !templateID || !publicKey) {
      toast.error(
        "Error de configuración: las claves de EmailJS no están definidas."
      );
      console.error(
        "Error: Las variables de entorno de EmailJS no están configuradas en el archivo .env"
      );
      setIsLoading(false);
      return;
    }

    const templateParams = {
      nombre: formData.nombre || "",
      apellido: formData.apellido || "",
      telefono: formData.telefono || "",
      correo: formData.correo || "",
      direccion: formData.direccion || "",
      ciudad: formData.ciudad || "",
      comentario: formData.comentario || "",
      product_title: product.title || "",
      product_price: product.price?.toString() || "0",
      product_category: product.category || "",
      product_image: product.image || "",
      product_description: product.description || "No hay descripción.",
      product_dimensions: product.dimensions || "No especificado",
      product_material: product.material || "No especificado",
      product_color: product.color || "No especificado",
      product_warranty: product.warranty || "No especificado",
    };

    emailjs
      .send(serviceID, templateID, templateParams, publicKey)
      .then(() => {
        toast.success(
          "¡Pedido enviado con éxito! Nos pondremos en contacto contigo pronto."
        );
        form.current?.reset();
        // Opcional: Redirigir a otra página tras el éxito
        // navigate('/gracias');
      })
      .catch((err) => {
        console.error("Error al enviar el correo:", err);
        toast.error(
          "Hubo un error al enviar el pedido. Por favor, inténtalo de nuevo."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <p className="text-xl text-muted-foreground mb-4">
          No se ha seleccionado ningún producto.
        </p>
        <Button onClick={() => navigate("/catalogo-clasico")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 font-serif-display">
          Completa tu Pedido
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Formulario - Contenedor más ancho */}
          <div className="lg:col-span-1">
            <Card className="shadow-hover h-full">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Tus Datos</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Completa el formulario para procesar tu pedido
                </p>
              </CardHeader>
              <CardContent>
                <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        onChange={handleChange}
                        required
                        className="h-11"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido *</Label>
                      <Input
                        id="apellido"
                        name="apellido"
                        onChange={handleChange}
                        required
                        className="h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      onChange={handleChange}
                      required
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo Electrónico *</Label>
                    <Input
                      id="correo"
                      name="correo"
                      type="email"
                      onChange={handleChange}
                      required
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección *</Label>
                      <Input
                        id="direccion"
                        name="direccion"
                        onChange={handleChange}
                        required
                        className="h-11"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad *</Label>
                      <Input
                        id="ciudad"
                        name="ciudad"
                        onChange={handleChange}
                        required
                        className="h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comentario">Comentario (Opcional)</Label>
                    <Textarea
                      id="comentario"
                      name="comentario"
                      onChange={handleChange}
                      placeholder="Indica cualquier especificación adicional para tu pedido..."
                      rows={3}
                      className="resize-none"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Enviar Orden de Trabajo"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  * Campos obligatorios. Nos pondremos en contacto contigo para
                  confirmar los detalles.
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Detalles del Producto - Contenedor más ancho */}
          <div className="lg:col-span-1">
            <Card className="shadow-soft h-full">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Resumen del Pedido</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Revisa los detalles del producto seleccionado
                </p>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Imagen más grande y destacada */}
                  <div className="flex-shrink-0 w-full md:w-2/5">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-bold text-xl mb-1">
                        {product.title}
                      </h3>
                      <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                        {product.category}
                      </div>
                    </div>

                    {/* Descripción del producto */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Descripción</h4>
                      <div className="text-muted-foreground leading-relaxed">
                        {product.description ? (
                          <div className="space-y-2">
                            {product.description
                              .split("\n")
                              .map((line, index) => (
                                <p
                                  key={index}
                                  className={line.trim() ? "" : "h-4"}
                                >
                                  {line.trim() || ""}
                                </p>
                              ))}
                          </div>
                        ) : (
                          <p className="italic text-gray-500">
                            Este producto no cuenta con una descripción
                            detallada.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Especificaciones en grid 2x2 - Alineada con la imagen */}
                {(product.dimensions ||
                  product.material ||
                  product.color ||
                  product.warranty ||
                  product.details) && (
                  <div className="space-y-3 mt-6">
                    <h4 className="font-semibold text-lg">Especificaciones</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Dimensiones */}
                      {product.dimensions && (
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Ruler className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">
                                Dimensiones
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.dimensions}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Material */}
                      {product.material && (
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">
                                Material
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.material}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Color */}
                      {product.color && (
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Palette className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">
                                Color
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.color}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Garantía */}
                      {product.warranty && (
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">
                                Garantía
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.warranty}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detalles adicionales - Ocupa 2 columnas si está solo */}
                      {product.details &&
                        !(
                          product.dimensions ||
                          product.material ||
                          product.color ||
                          product.warranty
                        ) && (
                          <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg sm:col-span-2">
                            <div className="flex items-start gap-3">
                              <div className="h-5 w-5 rounded-full border-2 border-primary mt-0.5 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold">i</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">
                                  Detalles
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {product.details}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Detalles adicionales - En grid normal si hay otros */}
                      {product.details &&
                        (product.dimensions ||
                          product.material ||
                          product.color ||
                          product.warranty) && (
                          <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="h-5 w-5 rounded-full border-2 border-primary mt-0.5 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold">i</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">
                                  Detalles
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {product.details}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total a pagar
                    </p>
                    <p className="text-4xl font-bold text-primary">
                      ${product.price}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/catalogo-clasico")}
                    className="h-11"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cambiar Producto
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
