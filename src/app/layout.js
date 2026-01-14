import "./globals.css";
import ClientLayout from "../components/ClientLayout"; 

// --- 1. SETUP PWA & METADATA ---
export const metadata = {
  title: "The Wedding Plan of Adam & [Nama Pasangan]", 
  description: "Our journey to forever starts here.",
  // Link ke file manifest untuk Android/Chrome
  manifest: '/manifest.json', 
  icons: {
    icon: '/favicon.ico',
    // Ikon khusus untuk Apple (pastikan file icon-192.png ada di folder public)
    apple: '/icon-192.png', 
  },
  // Konfigurasi agar terlihat seperti App Native di iOS
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WeddingPlan',
  },
};

// --- 2. SETUP VIEWPORT (Agar tidak bisa di-zoom cubit seperti App asli) ---
export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Font Premium (Tetap dipertahankan) */}
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