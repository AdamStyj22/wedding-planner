'use client'
import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import { ArrowRight, ChevronLeft, Lock } from 'lucide-react'
import Avatar from './Avatar'

const fetcher = async () => {
  const { data } = await supabase.from('app_profiles').select('*').order('id', { ascending: true })
  return data || []
}

export default function LoginScreen() {
  const { login } = useUser()
  const { data: profiles = [], isLoading } = useSWR('app_profiles', fetcher)
  
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [inputPin, setInputPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isShake, setIsShake] = useState(false)

  useEffect(() => { setInputPin(''); setErrorMsg('') }, [selectedProfile])

  const handleLogin = (e) => {
    e.preventDefault()
    if (!selectedProfile) return
    if (inputPin === selectedProfile.pin) {
        login(selectedProfile)
    } else {
        setErrorMsg('PIN Salah'); setIsShake(true); setTimeout(() => setIsShake(false), 500); setInputPin('');
    }
  }

  if (isLoading) return null

  return (
    <div className="relative min-h-screen w-full bg-[#0c0a09] font-sans flex flex-col items-center justify-center overflow-hidden selection:bg-rose-500/30">
       
       {/* === 1. BACKGROUND LAYER (FULL SCREEN ANIMATION) === */}
       <div className="absolute inset-0 pointer-events-none">
           {/* Gradient Base */}
           <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-[#1c1917] to-stone-950"></div>
           
           {/* Animated Blobs (Lebih besar & lambat) */}
           <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-rose-900/20 blur-[150px] animate-blob-slow mix-blend-screen opacity-60"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-900/10 blur-[180px] animate-blob-slower mix-blend-screen opacity-60"></div>
           
           {/* Noise Texture (Agar tidak terlihat seperti plastik) */}
           <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
       </div>

       {/* === 2. MAIN CONTENT (FLOATING GLASS) === */}
       <div className="relative z-10 w-full max-w-lg px-6">
          
          {/* HEADER TEKS (Selalu Muncul) */}
          <div className={`text-center transition-all duration-700 ${selectedProfile ? 'mb-8' : 'mb-16'}`}>
              <div className="flex items-center justify-center gap-3 mb-4 opacity-50">
                  <div className="h-[1px] w-8 bg-white/50"></div>
                  <p className="text-[10px] uppercase tracking-[0.4em] font-medium text-stone-300">Wedding Planner</p>
                  <div className="h-[1px] w-8 bg-white/50"></div>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif text-white/90 leading-none tracking-tight">
                  Our Journey
              </h1>
          </div>

          {/* CARD CONTAINER (GLASSMORPHISM) */}
          <div className="relative backdrop-blur-2xl bg-white/[0.03] border border-white/10 shadow-2xl shadow-black/50 rounded-[3rem] p-8 md:p-12 overflow-hidden transition-all duration-500 hover:border-white/20">
              
              {/* Efek Kilauan (Sheen) */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {/* --- VIEW 1: PILIH PROFIL --- */}
              <div className={`transition-all duration-700 ease-in-out ${selectedProfile ? 'opacity-0 scale-95 pointer-events-none absolute inset-0 p-12' : 'opacity-100 scale-100'}`}>
                  <h2 className="text-center text-white/80 font-serif text-2xl mb-10">Pilih Profil Anda</h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                      {profiles.map((p) => (
                        <button 
                            key={p.id}
                            onClick={() => setSelectedProfile(p)}
                            className="group flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500"
                        >
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-all duration-700"></div>
                                <div className="relative p-1 rounded-full border border-white/10 group-hover:border-white/50 transition-colors duration-500">
                                    <Avatar value={p.img} size="w-16 h-16" fontSize="text-2xl" className="bg-stone-800 text-stone-300"/>
                                </div>
                            </div>
                            <span className="font-serif text-lg text-stone-300 group-hover:text-white transition-colors">{p.name}</span>
                        </button>
                      ))}
                  </div>
              </div>

              {/* --- VIEW 2: PIN INPUT --- */}
              <div className={`transition-all duration-700 ease-in-out ${selectedProfile ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none absolute inset-0 p-12'}`}>
                  {selectedProfile && (
                    <div className="flex flex-col items-center">
                        <div className="mb-8 relative">
                             <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full"></div>
                             <div className="relative p-1 rounded-full border border-white/20">
                                <Avatar value={selectedProfile.img} size="w-20 h-20" fontSize="text-3xl" className="bg-stone-900 text-stone-200"/>
                             </div>
                        </div>

                        <h2 className="text-2xl font-serif text-white mb-2">Halo, {selectedProfile.name}</h2>
                        <p className="text-stone-400 text-xs mb-8">Masukkan kode akses</p>

                        <form onSubmit={handleLogin} className="w-full max-w-[200px]">
                            <div className={`relative mb-8 ${isShake ? 'animate-shake' : ''}`}>
                               <input 
                                  autoFocus
                                  type="password" 
                                  maxLength={9}
                                  value={inputPin}
                                  onChange={(e) => setInputPin(e.target.value)}
                                  placeholder="· · · ·"
                                  className="w-full py-3 bg-transparent border-b border-white/20 text-3xl font-serif tracking-[0.5em] outline-none text-center text-white placeholder:text-white/10 focus:border-white/60 transition-colors"
                               />
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <button type="submit" disabled={!inputPin} className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${inputPin ? 'bg-white text-black hover:scale-105 shadow-lg shadow-white/10' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
                                    Masuk <ArrowRight size={14} />
                                </button>
                                <button onClick={() => setSelectedProfile(null)} className="text-[10px] text-stone-500 hover:text-white transition uppercase tracking-widest py-2">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                  )}
              </div>

          </div>
          
          {/* FOOTER */}
          <div className="mt-8 text-center opacity-30">
              <p className="text-[10px] font-serif italic text-white">Private Wedding Journey</p>
          </div>

       </div>
    </div>
  )
}