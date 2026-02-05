
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});


export const metadata: Metadata = {
  title: "Montañita Pulse | Vive la Vibra",
  description: "Conecta con la mejor oferta de Montañita: fiesta, surf y bienestar.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">

      <body className={`${inter.variable} font-sans antialiased bg-black`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>

    </html>
  );
}
