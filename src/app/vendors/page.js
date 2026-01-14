'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { ArrowLeft, Plus, Trash2, Phone, ChevronRight, Receipt, LayoutList, Tag, AlertCircle, MapPin } from 'lucide-react'
import { useAppTheme } from '../../hooks/useAppTheme'
import { useRouter } from 'next/navigation'

const ITEM_CATEGORIES = ['Venue', 'Catering', 'Dekorasi', 'MUA', 'Dokumentasi', 'Entertainment', 'Attire/Baju', 'Souvenir', 'Lainnya']

const fetchVendors = async () => {
  const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false })
  if (error) console.error("Error fetch vendors:", error)
  return data || []
}

const fetchVendorDetails = async (vendorId) => {
  if (!vendorId) return []
  const { data, error } = await supabase.from('vendor_details').select('*').eq('vendor_id', vendorId).order('id', { ascending: true })
  if (error) console.error("Error fetch details:", error)
  return data || []
}

export default function VendorsPage() {
  const colors = useAppTheme() // <--- INI KUNCINYA
  const router = useRouter()
  
  const [selectedVendor, setSelectedVendor] = useState(null) 

  // DATA
  const { data: vendors = [], mutate: mutateVendors, isLoading: loadingVendors } = useSWR('vendors-list', fetchVendors)
  const { data: details = [], mutate: mutateDetails } = useSWR(
    selectedVendor?.id ? `details-${selectedVendor.id}` : null, 
    () => fetchVendorDetails(selectedVendor?.id)
  )

  // MODAL STATES
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [vendorForm, setVendorForm] = useState({ name: '', phone: '' })
  
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [itemForm, setItemForm] = useState({ item_name: '', item_price: '', item_notes: '', category: 'Lainnya' })
  const [isSaving, setIsSaving] = useState(false)

  // --- LOGIC 1: SIMPAN VENDOR UTAMA ---
  async function saveVendor(e) {
      e.preventDefault()
      setIsSaving(true)
      
      const { error } = await supabase.from('vendors').insert([{ ...vendorForm, category: 'Multi-Service', price: 0, status: 'Searching' }])

      if (error) {
          alert("Gagal Simpan Vendor: " + error.message)
          setIsSaving(false)
          return
      }

      setVendorForm({ name: '', phone: '' })
      setIsVendorModalOpen(false)
      mutateVendors()
      setIsSaving(false)
  }

  async function deleteVendor(id) {
      if(!confirm('Hapus vendor ini beserta seluruh rinciannya?')) return
      const { error } = await supabase.from('vendors').delete().eq('id', id)
      if (error) alert("Gagal Hapus: " + error.message)
      
      setSelectedVendor(null)
      mutateVendors()
  }

  // --- LOGIC 2: SIMPAN RINCIAN ITEM ---
  async function saveItem(e) {
      e.preventDefault()
      if (!selectedVendor?.id) return
      setIsSaving(true)

      const priceClean = itemForm.item_price ? parseInt(itemForm.item_price.toString().replace(/\D/g, '')) : 0
      
      // 1. Simpan Item
      const { error: errInsert } = await supabase.from('vendor_details').insert([{ 
          vendor_id: selectedVendor.id,
          item_name: itemForm.item_name,
          item_price: priceClean,
          item_notes: itemForm.item_notes,
          category: itemForm.category
      }])

      if (errInsert) {
          alert("Gagal Simpan Item: " + errInsert.message)
          setIsSaving(false)
          return
      }
      
      // 2. Hitung Ulang Total Harga
      const { data: currentDetails } = await supabase.from('vendor_details').select('item_price').eq('vendor_id', selectedVendor.id)
      const newTotal = currentDetails?.reduce((acc, curr) => acc + (curr.item_price || 0), 0) || 0
      
      // 3. Update Vendor Utama
      await supabase.from('vendors').update({ price: newTotal }).eq('id', selectedVendor.id)
      
      setItemForm({ item_name: '', item_price: '', item_notes: '', category: 'Lainnya' })
      setIsItemModalOpen(false)
      mutateDetails()
      mutateVendors() 
      setIsSaving(false)
  }

  async function deleteItem(itemId) {
      if(!confirm('Hapus rincian ini?')) return
      
      await supabase.from('vendor_details').delete().eq('id', itemId)
      
      const { data: currentDetails } = await supabase.from('vendor_details').select('item_price').eq('vendor_id', selectedVendor.id)
      const newTotal = currentDetails?.reduce((acc, curr) => acc + (curr.item_price || 0), 0) || 0
      
      await supabase.from('vendors').update({ price: newTotal }).eq('id', selectedVendor.id)

      mutateDetails()
      mutateVendors()
  }

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

  if (loadingVendors) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-serif italic">Memuat data vendor...</div>

  // === TAMPILAN 1: LIST VENDOR (HALAMAN DEPAN) ===
  if (!selectedVendor) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">
           {/* HEADER DENGAN TEMA WARNA SOLID */}
           <div className={`relative pt-12 pb-16 px-6 rounded-b-[3rem] shadow-lg overflow-hidden transition-all duration-500 ${colors.primary}`}>
              {/* Dekorasi Background */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 mb-6">
                 <button onClick={() => router.back()} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white">
                    <ArrowLeft size={20}/>
                 </button>
              </div>
              <h1 className="relative z-10 text-4xl font-serif text-white mb-2 leading-tight">Vendor <br/> List</h1>
              <p className="relative z-10 text-white/80 text-sm font-medium">Kelola semua vendor pernikahanmu di sini.</p>
           </div>

           {/* List Card Vendor */}
           <div className="px-6 -mt-10 relative z-20 space-y-4">
              {/* Tombol Tambah (Putih Bersih) */}
              <button onClick={() => setIsVendorModalOpen(true)} className="w-full bg-white p-4 rounded-2xl shadow-md border-2 border-transparent hover:border-gray-100 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition group">
                 <div className={`p-1.5 rounded-full ${colors.softBg} group-hover:scale-110 transition`}><Plus size={16} className={colors.textMain}/></div>
                 <span className="font-bold text-sm">Tambah Vendor Baru</span>
              </button>

              {vendors.length === 0 && (
                  <div className="text-center py-10 opacity-40">
                      <MapPin size={48} className="mx-auto mb-2 text-gray-300"/>
                      <p className="text-xs font-medium text-gray-400">Belum ada vendor.</p>
                  </div>
              )}

              {vendors.map((v) => (
                 <div key={v.id} onClick={() => setSelectedVendor(v)} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-50 hover:shadow-md transition active:scale-[0.98] cursor-pointer group">
                     <div className="flex justify-between items-end">
                         <div>
                             <h3 className="font-bold text-lg text-gray-800 group-hover:text-black transition-colors">{v.name}</h3>
                             <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Phone size={10}/> {v.phone || '-'}</p>
                         </div>
                         <div className="text-right">
                             {/* Harga Mengikuti Warna Tema */}
                             <p className={`font-mono font-bold text-sm ${colors.textMain}`}>{formatRupiah(v.price)}</p>
                             <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 mt-1 group-hover:translate-x-1 transition-transform">
                                 Detail <ChevronRight size={10}/>
                             </div>
                         </div>
                     </div>
                 </div>
              ))}
           </div>

           {/* MODAL TAMBAH VENDOR */}
           {isVendorModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 animate-slide-up">
                    <h3 className="font-bold text-lg mb-4">Buat Vendor Baru</h3>
                    <form onSubmit={saveVendor} className="space-y-3">
                        <input type="text" placeholder="Nama Vendor (Misal: Hotel Mulia)" required autoFocus className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-black/5 outline-none" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})}/>
                        <input type="text" placeholder="No HP (Opsional)" className="w-full p-4 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none" value={vendorForm.phone} onChange={e => setVendorForm({...vendorForm, phone: e.target.value})}/>
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={() => setIsVendorModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">Batal</button>
                            {/* Tombol Simpan Mengikuti Tema */}
                            <button type="submit" disabled={isSaving} className={`flex-1 py-3.5 text-white rounded-xl font-bold transition shadow-lg ${colors.primary} ${isSaving ? 'opacity-50' : ''}`}>{isSaving ? '...' : 'Buat'}</button>
                        </div>
                    </form>
                </div>
            </div>
           )}
        </div>
      )
  }

  // === TAMPILAN 2: DETAIL RINCIAN VENDOR (HALAMAN DALAM) ===
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">
        {/* HEADER DETAIL (SOLID THEME) */}
        <div className={`pt-12 pb-8 px-6 rounded-b-[2.5rem] shadow-sm sticky top-0 z-20 transition-all duration-500 ${colors.primary}`}>
            <div className="flex justify-between items-start mb-4">
                <button onClick={() => setSelectedVendor(null)} className="flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white transition"><ArrowLeft size={14}/> KEMBALI</button>
                <button onClick={() => deleteVendor(selectedVendor.id)} className="p-2 bg-white/20 text-white rounded-lg hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
            </div>
            
            <h1 className="text-2xl font-serif font-bold text-white">{selectedVendor.name}</h1>
            <p className="text-xs text-white/70 mt-1 flex items-center gap-1"><Phone size={12}/> {selectedVendor.phone || 'No Contact'}</p>
            
            {/* TOTAL CARD (Floating) */}
            <div className="bg-white p-4 rounded-2xl shadow-lg mt-6 flex justify-between items-center transform translate-y-1/2">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Biaya</p>
                    <p className={`text-xl font-mono font-bold ${colors.textMain}`}>{formatRupiah(selectedVendor.price)}</p>
                </div>
                <div className={`p-2 rounded-full ${colors.softBg}`}>
                    <Receipt className={colors.textMain} size={20}/>
                </div>
            </div>
        </div>

        {/* LIST ITEM RINCIAN */}
        <div className="px-6 pt-16 pb-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><LayoutList size={16}/> Rincian Item</h3>
                <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-500 shadow-sm">{details.length} Item</span>
            </div>
            
            {details.length === 0 && (
                <div className="text-center py-10 opacity-40">
                    <Tag size={32} className="mx-auto mb-2 text-gray-300"/>
                    <p className="text-gray-400 text-xs italic">Belum ada rincian.</p>
                </div>
            )}

            {details.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-start group hover:shadow-md transition relative">
                    <div className="flex-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-gray-500 mb-1 inline-block ${colors.softBg}`}>
                            {item.category || 'Lainnya'}
                        </span>
                        <p className="font-bold text-gray-800 text-sm">{item.item_name}</p>
                        {item.item_notes && <p className="text-xs text-gray-400 mt-1 italic">{item.item_notes}</p>}
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-sm font-bold text-gray-600">{formatRupiah(item.item_price)}</p>
                        <button onClick={() => deleteItem(item.id)} className="text-[10px] text-red-300 mt-2 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2 py-1 bg-red-50/50 rounded cursor-pointer">Hapus</button>
                    </div>
                </div>
            ))}

            <button onClick={() => setIsItemModalOpen(true)} className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm hover:bg-white hover:border-gray-300 hover:text-gray-600 hover:shadow-sm transition flex items-center justify-center gap-2 mt-4">
                <Plus size={16}/> Tambah Item
            </button>
        </div>

        {/* MODAL TAMBAH RINCIAN */}
        {isItemModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 animate-slide-up">
                    <h3 className="font-bold text-lg mb-4">Tambah Rincian</h3>
                    <form onSubmit={saveItem} className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori</label>
                            <div className="relative mt-1">
                                <Tag size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                                <select 
                                    className="w-full pl-10 p-3.5 bg-gray-50 rounded-xl text-sm font-bold text-gray-800 appearance-none outline-none focus:ring-2 focus:ring-black/5" 
                                    value={itemForm.category} 
                                    onChange={e => setItemForm({...itemForm, category: e.target.value})}
                                >
                                    {ITEM_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Item</label>
                            <input type="text" placeholder="Contoh: Sewa Ballroom" required autoFocus className="w-full p-3.5 bg-gray-50 rounded-xl font-bold text-gray-900 mt-1 outline-none focus:ring-2 focus:ring-black/5" value={itemForm.item_name} onChange={e => setItemForm({...itemForm, item_name: e.target.value})}/>
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Harga</label>
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-3.5 text-gray-400 text-sm font-bold">Rp</span>
                                <input type="text" placeholder="0" className="w-full pl-10 p-3.5 bg-gray-50 rounded-xl font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-black/5" value={itemForm.item_price ? new Intl.NumberFormat('id-ID').format(itemForm.item_price) : ''} onChange={e => setItemForm({...itemForm, item_price: e.target.value.replace(/\D/g, '')})}/>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Catatan (Opsional)</label>
                            <input type="text" placeholder="Keterangan..." className="w-full p-3.5 bg-gray-50 rounded-xl text-sm mt-1 outline-none focus:ring-2 focus:ring-black/5" value={itemForm.item_notes} onChange={e => setItemForm({...itemForm, item_notes: e.target.value})}/>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={() => setIsItemModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">Batal</button>
                            <button type="submit" className={`flex-1 py-3.5 text-white rounded-xl font-bold shadow-lg transition ${colors.primary}`}>{isSaving ? '...' : 'Simpan'}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}