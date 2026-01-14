'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useUser } from '../../context/UserContext'
import { Save, Camera, UploadCloud, X, Check, ZoomIn, Palette } from 'lucide-react'
import Avatar from '../../components/Avatar'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../lib/cropImage'
import { mutate } from 'swr'
import { THEMES } from '../../lib/themes' // Import Tema

export default function ProfilePage() {
  const { user, login, refreshUserData } = useUser()
  
  // STATE DATA USER (Termasuk Theme)
  const [formData, setFormData] = useState({ name: '', role: '', img: '', theme: 'black' })
  
  // STATE UI
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // STATE CROPPER (Dikembalikan)
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
            theme: user.theme || 'black' 
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
        setIsCropModalOpen(true) // Buka modal crop
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

      // A. Potong Gambar
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      
      // B. Upload dengan nama unik (timestamp)
      const fileName = `${user.id}-${Date.now()}.jpg`
      
      const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, croppedImageBlob, {
             cacheControl: '3600',
             upsert: true
          })

      if (uploadError) throw uploadError

      // C. Ambil URL Publik
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const newImageUrl = data.publicUrl

      // D. Update Database (Hanya kolom IMG)
      const { error: dbError } = await supabase
        .from('app_profiles')
        .update({ img: newImageUrl })
        .eq('id', user.id)
      
      if (dbError) throw dbError

      // E. Update State Lokal & Global
      setFormData({ ...formData, img: newImageUrl })
      await refreshUserData(user.id)
      await mutate('dashboard-stats')
      await mutate('app_profiles') // Update login screen juga
      
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
    e.preventDefault()
    setIsSaving(true)
    
    const { error } = await supabase
      .from('app_profiles')
      .update({ 
          name: formData.name, 
          role: formData.role,
          theme: formData.theme // Simpan tema
      })
      .eq('id', user.id)

    if (!error) {
      await refreshUserData(user.id) // Update context agar Sidebar berubah
      await mutate('dashboard-stats') // Update Dashboard agar warna berubah
      alert('Profil & Tema berhasil diperbarui!')
    } else {
      alert('Gagal menyimpan.')
    }
    setIsSaving(false)
  }

  // Ambil konfigurasi warna dari tema yang DIPILIH (Preview)
  const currentThemeColors = THEMES[formData.theme]?.colors || THEMES['black'].colors
  const currentThemeGradient = THEMES[formData.theme]?.gradient || 'from-gray-700 to-black'

  return (
    <div className="font-sans pb-20 space-y-8 animate-fade-in max-w-xl mx-auto">
       <div className="text-center mb-8 mt-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Personalization</p>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Edit Profil</h1>
       </div>

       <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden">
          {/* Background Header Card (Berubah sesuai tema yg dipilih) */}
          <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-r ${currentThemeGradient} opacity-20 transition-all duration-500`}></div>

          <form onSubmit={handleSaveData} className="relative z-10 space-y-6 mt-4">
             
             {/* AREA FOTO (Klik untuk Ganti) */}
             <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                   <Avatar 
                      value={formData.img} 
                      size="w-32 h-32" 
                      fontSize="text-6xl" 
                      className={`bg-gradient-to-tr ${currentThemeGradient} transition-all duration-500`} 
                   />
                   
                   {/* Overlay Icon Camera */}
                   <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs">
                      <Camera size={24}/>
                   </div>

                   {/* Loading Spinner */}
                   {isUploading && (
                     <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white">
                        <UploadCloud className="animate-bounce"/>
                     </div>
                   )}
                </div>
                
                {/* Input File Tersembunyi */}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange}/>
                <p className="text-xs text-gray-400 mt-3">Ketuk foto untuk mengganti</p>
             </div>

             {/* INPUT FORM */}
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nama Panggilan</label>
                   <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-serif text-xl font-bold text-gray-900 focus:ring-2 focus:ring-black transition"/>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Role / Julukan</label>
                   <input type="text" required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-medium text-gray-700 focus:ring-2 focus:ring-black transition"/>
                </div>

                {/* PILIHAN TEMA (Fitur Baru) */}
                <div className="pt-4">
                   <div className="flex items-center gap-2 mb-3">
                      <Palette size={16} className="text-gray-400"/>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pilih Tema Aplikasi</label>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                      {Object.values(THEMES).map((theme) => (
                         <div 
                            key={theme.id}
                            onClick={() => setFormData({...formData, theme: theme.id})}
                            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col items-center gap-2 ${formData.theme === theme.id ? 'border-black bg-gray-50' : 'border-transparent bg-gray-50/50 hover:bg-gray-100'}`}
                         >
                            <div className={`w-8 h-8 rounded-full ${theme.colors.primary} shadow-md`}></div>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{theme.label}</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             <button type="submit" disabled={isSaving || isUploading} className={`w-full text-white font-bold py-4 rounded-2xl mt-4 hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2 ${currentThemeColors.primary}`}>
                {isSaving ? 'Menyimpan...' : <><Save size={18}/> Simpan Profil</>}
             </button>
          </form>
       </div>

       {/* --- MODAL CROPPER (Dikembalikan) --- */}
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
                aspect={1} // Kotak 1:1
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
           </div>

           {/* Footer Modal (Slider Zoom) */}
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