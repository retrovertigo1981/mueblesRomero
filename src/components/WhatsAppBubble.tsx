import { WhatsAppIcon } from "./WhatsAppIcon";

export const WhatsAppBubble = () => {
  // Es una buena práctica mover este número a variables de entorno
  const phoneNumber = "+56983442725";
  const message =
    "Hola, estoy interesado en sus muebles y me gustaría más información.";

  // Formateamos el número y el mensaje para la URL
  const whatsappLink = `https://wa.me/${phoneNumber.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 flex items-center justify-center transform hover:scale-110"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <WhatsAppIcon className="w-8 h-8" />
    </a>
  );
};
