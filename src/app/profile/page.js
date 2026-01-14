'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useUser } from '../../context/UserContext'
import { Save, Camera, UploadCloud, X, Check, ZoomIn, Palette, LogOut, ShieldCheck, Heart } from 'lucide-react'
import Avatar from '../../components/Avatar'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../lib/cropImage'
import { mutate } from 'swr'
import { THEMES } from '../../lib/themes'
import { useAppTheme } from '../../hooks/useAppTheme'

export default function ProfilePage() {
  const { user, login, logout, refreshUserData } = useUser()
  const colors = useAppTheme() // Hook untuk warna aktif
  
  // STATE DATA USER
  const [formData, setFormData] = useState({ name: '', role: '', img: '', theme: 'baya' })
  
  // STATE UI
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // STATE CROPPER
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  
  const fileInputRef = useRef(null)

  // Load data awal
  useEffect(() => {
    if (user) {
        setFormData({ 
            name: user.name, 
            role: user.role, 
            img: user.img, 
            theme: user.theme || 'baya' 
        })
    }
  }, [user])

  // --- 1. LOGIC PILIH FOTO (Buka Modal Crop) ---
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result)
        setIsCropModalOpen(true) 
      })
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  // --- 2. LOGIC SIMPAN FOTO (Upload ke Supabase) ---
  const handleSaveCrop = async () => {
    try {
      setIsCropModalOpen(false)
      setIsUploading(true)

      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const fileName = `${user.id}-${Date.now()}.jpg`
      
      const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, croppedImageBlob, {
             cacheControl: '3600',
             upsert: true
          })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const newImageUrl = data.publicUrl

      const { error: dbError } = await supabase
        .from('app_profiles')
        .update({ img: newImageUrl })
        .eq('id', user.id)
      
      if (dbError) throw dbError

      setFormData({ ...formData, img: newImageUrl })
      await refreshUserData(user.id)
      await mutate('dashboard-stats')
      await mutate('app_profiles')
      
      alert('Foto berhasil diganti!')
      
    } catch (e) {
      console.error(e)
      alert('Gagal: ' + e.message)
    } finally {
      setIsUploading(false)
      setImageSrc(null)
    }
  }

  // --- 3. LOGIC SIMPAN DATA LAIN (Nama, Role, Tema) ---
  async function handleSaveData(e) {
    if(e) e.preventDefault() // Opsional jika dipanggil manual
    setIsSaving(true)
    
    // Pastikan tema ada di list THEMES, kalau tidak default 'baya'
    const themeToSave = THEMES[formData.theme] ? formData.theme : 'baya'

    const { error } = await supabase
      .from('app_profiles')
      .update({ 
          name: formData.name, 
          role: formData.role,
          theme: themeToSave 
      })
      .eq('id', user.id)

    if (!error) {
      // Update local storage manual biar instan
      const updatedUser = { ...user, name: formData.name, role: formData.role, theme: themeToSave }
      localStorage.setItem('wedding_user', JSON.stringify(updatedUser))
      
      await refreshUserData(user.id) 
      await mutate('dashboard-stats')
      alert('Profil & Tema berhasil diperbarui!')
    } else {
      alert('Gagal menyimpan.')
    }
    setIsSaving(false)
  }

  // Fungsi Helper Ganti Tema Langsung
  const changeTheme = (themeId) => {
      setFormData(prev => ({ ...prev, theme: themeId }))
      // Opsional: Langsung save ke DB jika mau UX lebih cepat, 
      // tapi di sini user harus klik "Simpan Profil" dulu biar konsisten.
  }

  const currentThemeGradient = THEMES[formData.theme]?.gradient || THEMES['baya'].gradient

  return (
    <div className="font-sans pb-32 space-y-8 animate-fade-in max-w-xl mx-auto bg-[#FAFAFA] min-h-screen">
       
       {/* HEADER */}
       <div className="pt-12 px-6">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900">Edit Profil</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Personalisasi Akun</p>
       </div>

       <div className="px-4 space-y-6">
          
          {/* KARTU FORM UTAMA */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
             {/* Background Header Card (Berubah sesuai tema yg dipilih) */}
             <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-r ${currentThemeGradient} opacity-20 transition-all duration-500`}></div>

             <form onSubmit={handleSaveData} className="relative z-10 space-y-6 mt-4">
                 
                 {/* AREA FOTO */}
                 <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                       <Avatar 
                          value={formData.img} 
                          size="w-32 h-32" 
                          fontSize="text-6xl" 
                          className={`bg-gradient-to-tr ${currentThemeGradient} transition-all duration-500 shadow-lg`} 
                       />
                       
                       <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs">
                          <Camera size={24}/>
                       </div>

                       {isUploading && (
                         <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white">
                            <UploadCloud className="animate-bounce"/>
                         </div>
                       )}
                    </div>
                    
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange}/>
                    <p className="text-xs text-gray-400 mt-3 font-medium">Ketuk foto untuk mengganti</p>
                 </div>

                 {/* INPUT FORM */}
                 <div className="space-y-4">
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nama Panggilan</label>
                       <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-serif text-xl font-bold text-gray-900 focus:ring-2 focus:ring-black transition placeholder:text-gray-300"/>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Role / Julukan</label>
                       <input type="text" required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-medium text-gray-700 focus:ring-2 focus:ring-black transition placeholder:text-gray-300"/>
                    </div>

                    {/* PILIHAN TEMA */}
                    <div className="pt-4">
                       <div className="flex items-center gap-2 mb-3">
                          <Palette size={16} className="text-gray-400"/>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tema Aplikasi</label>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          {Object.values(THEMES).map((theme) => (
                             <div 
                                key={theme.id}
                                onClick={() => changeTheme(theme.id)}
                                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col items-center gap-2 ${formData.theme === theme.id ? 'border-black bg-gray-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                             >
                                <div className={`w-8 h-8 rounded-full ${theme.colors.primary} shadow-sm`}></div>
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${formData.theme === theme.id ? 'text-black' : 'text-gray-400'}`}>{theme.label}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button type="submit" disabled={isSaving || isUploading} className={`w-full text-white font-bold py-4 rounded-2xl mt-4 hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2 ${THEMES[formData.theme]?.colors?.primary || 'bg-black'}`}>
                    {isSaving ? 'Menyimpan...' : <><Save size={18}/> Simpan Perubahan</>}
                 </button>
             </form>
          </div>

          {/* INFO APLIKASI */}
          <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-full flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><ShieldCheck size={18}/></div>
                      <span className="text-sm font-bold text-gray-700">Versi Aplikasi</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">v2.0 (PWA Ready)</span>
              </div>
          </div>

          {/* TOMBOL LOGOUT */}
          <button 
            onClick={logout}
            className="w-full bg-white border border-red-100 p-5 rounded-[2rem] shadow-sm flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 active:scale-95 transition-all mt-8 group"
          >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
              <span className="font-bold">Keluar Aplikasi</span>
          </button>
          
          <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest pt-4 flex items-center justify-center gap-1">
              Made with <Heart size={10} fill="currentColor" className="text-red-300"/> for Adam & Partner
          </p>

       </div>

       {/* --- MODAL CROPPER --- */}
       {isCropModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
           
           {/* Header Modal */}
           <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center text-white bg-gradient-to-b from-black/80 to-transparent">
              <button onClick={() => { setIsCropModalOpen(false); setImageSrc(null) }} className="p-2"><X/></button>
              <span className="font-bold text-sm">Sesuaikan Foto</span>
              <button onClick={handleSaveCrop} className="p-2 text-rose-400 font-bold"><Check/></button>
           </div>

           {/* Area Crop */}
           <div className="relative flex-1 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
           </div>

           {/* Footer Modal */}
           <div className="p-6 pb-10 bg-gray-900 text-white flex flex-col gap-4">
              <div className="flex items-center gap-4">
                 <ZoomIn size={16} className="text-gray-400"/>
                 <input 
                    type="range" 
                    value={zoom} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                 />
              </div>
              <button onClick={handleSaveCrop} className="w-full bg-white text-black font-bold py-4 rounded-2xl">Selesai & Pakai</button>
           </div>
        </div>
       )}
    </div>
  )
}