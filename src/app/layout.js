import "./globals.css";
import ClientLayout from "../components/ClientLayout"; // Import file yang baru dibuat tadi

// Metadata (Hanya bisa jalan di Server Component/Tanpa 'use client')
export const metadata = {
  title: "The Wedding Plan of Adam & [Nama Pasangan]", 
  description: "Our journey to forever starts here.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Font Premium */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className="antialiased text-slate-800 bg-[#f8f9fa] selection:bg-black selection:text-white">
        
        {/* Panggil ClientLayout di sini */}
        <ClientLayout>
            {children}
        </ClientLayout>
        
      </body>
    </html>
  );
}