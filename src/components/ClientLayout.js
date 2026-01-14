'use client' // Wajib di paling atas
import Sidebar from "./Sidebar";
import { UserProvider, useUser } from "../context/UserContext";
import LoginScreen from "./LoginScreen";

// Komponen pembungkus untuk cek login
function MainContent({ children }) {
  const { user, loading } = useUser()

  if (loading) return null
  if (!user) return <LoginScreen />

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen p-4 pb-32 md:p-8 transition-all">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

// Komponen utama yang akan dipanggil di layout server
export default function ClientLayout({ children }) {
  return (
    <UserProvider>
       <MainContent>
          {children}
       </MainContent>
    </UserProvider>
  )
}