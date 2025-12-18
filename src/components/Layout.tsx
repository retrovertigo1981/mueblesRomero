import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppBubble } from "./WhatsAppBubble";

export const Layout = () => (
  <>
    <Toaster />
    <Navbar />
    <ScrollToTop />
    <WhatsAppBubble />
    <Outlet />
    <Footer />
  </>
);
