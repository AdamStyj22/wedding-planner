'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Wallet, Heart, Users, LogOut, User } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAppTheme } from '../hooks/useAppTheme'
import { THEMES } from '../lib/themes'
import Avatar from './Avatar'

const MENU_ITEMS = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Nabung', path: '/savings', icon: Wallet },
  { name: 'Ceklis', path: '/items', icon: CheckSquare },
  { name: 'Vendor', path: '/vendors', icon: Users },
  { name: 'Profil', path: '/profile', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useUser()
  const colors = useAppTheme()

  // --- LOGIKA WARNA TEMA ---
  let themeStyle = {
      bubble: 'bg-stone-800',
      shadow: 'shadow-stone-500/30'
  }

  if (user?.theme === 'baya') {
      themeStyle = {
          bubble: 'bg-gradient-to-br from-emerald-400 to-teal-600',
          shadow: 'shadow-[0_15px_30px_-5px_rgba(16,185,129,0.5)]'
      }
  } else if (user?.theme === 'buya') {
      themeStyle = {
          bubble: 'bg-gradient-to-br from-rose-400 to-pink-600',
          shadow: 'shadow-[0_15px_30px_-5px_rgba(244,63,94,0.5)]'
      }
  }

  return (
    <>
      {/* === DESKTOP SIDEBAR (Tetap Standar) === */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 hidden md:flex flex-col z-50">
        <div className="h-28 flex items-center px-8">
          <div className="flex items-center gap-4">
             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors.primary} text-white shadow-xl shadow-gray-200/50`}>
                <Heart size={20} fill="currentColor"/>
             </div>
             <div>
                <h1 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">DAMATA</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Planner</p>
             </div>
          </div>
        </div>
        <nav className="flex-1 px-6 space-y-2 mt-4">
          {MENU_ITEMS.map((menu) => {
            const isActive = pathname === menu.path
            return (
              <Link key={menu.path} href={menu.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-500 group relative overflow-hidden
                  ${isActive ? `${colors.softBg} ${colors.textMain} font-bold shadow-sm` : 'text-gray-500 hover:bg-gray-50'}`}>
                <menu.icon size={22} className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="relative z-10">{menu.name}</span>
                {isActive && <div className={`absolute left-0 top-0 h-full w-1 ${colors.primary}`}></div>}
              </Link>
            )
          })}
        </nav>
        <div className="p-6">
           <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><LogOut size={20}/> Keluar</button>
        </div>
      </aside>


      {/* === MOBILE NAV: "THE FLOATING BUBBLE" === */}
      <nav className="fixed bottom-0 left-0 w-full bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:hidden z-50 px-2 pb-safe border-t border-gray-50 h-[80px]">
        
        <div className="flex justify-between items-center h-full w-full relative">
            {MENU_ITEMS.map((menu) => {
              const isActive = pathname === menu.path
              
              return (
                <Link 
                    key={menu.path} 
                    href={menu.path} 
                    className="relative w-1/5 h-full flex flex-col items-center justify-center group"
                >
                  {/* BACKGROUND BUBBLE (Hanya muncul saat aktif & naik ke atas) */}
                  <div 
                    className={`
                        absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                        flex items-center justify-center
                        ${isActive 
                            ? `-top-6 w-14 h-14 rounded-full ${themeStyle.bubble} ${themeStyle.shadow} scale-100` // Aktif: Naik, Besar, Berwarna
                            : 'top-1/2 -translate-y-1/2 w-0 h-0 rounded-full bg-transparent scale-0' // Pasif: Hilang
                        }
                    `}
                  >
                      {/* IKON AKTIF (Putih) */}
                      <menu.icon 
                        size={24} 
                        strokeWidth={2.5} 
                        className={`text-white transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0 absolute'}`} 
                      />
                  </div>


                  {/* IKON PASIF (Abu-abu, diam di bawah) */}
                  <div className={`transition-all duration-300 ${isActive ? 'opacity-0 scale-0 translate-y-4' : 'opacity-100 scale-100 translate-y-0 text-gray-300 group-hover:text-gray-500'}`}>
                      <menu.icon size={24} strokeWidth={2} />
                  </div>

                  {/* LABEL (Opsional: Muncul kecil di bawah bubble aktif) */}
                  <span className={`
                      absolute bottom-3 text-[9px] font-bold uppercase tracking-wider transition-all duration-500
                      ${isActive ? 'opacity-100 translate-y-0 text-gray-800' : 'opacity-0 translate-y-2'}
                  `}>
                      {isActive ? menu.name : ''}
                  </span>

                </Link>
              )
            })}
        </div>
      </nav>
    </>
  )
}