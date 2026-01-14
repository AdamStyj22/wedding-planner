'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Plus, Trash2, Edit2, X, Check, ExternalLink, Link as LinkIcon, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useAppTheme } from '../../hooks/useAppTheme' // <--- SAYA TAMBAH INI
import { useRouter } from 'next/navigation' // <--- SAYA TAMBAH INI BUAT BACK BUTTON

const STANDARD_CATEGORIES = ['Pakaian', 'Tas Sepatu', 'Alat Mandi', 'Make up', 'Skincare', 'ETC Tambahan Opsional']

const fetcher = async () => {
  const { data } = await supabase.from('items').select('*').order('is_purchased', { ascending: true }).order('id', { ascending: false })
  return data || []
}

export default function ItemsPage() {
  const colors = useAppTheme() // <--- AMBIL WARNA TEMA
  const router = useRouter()
  
  const { data: items = [], isLoading, mutate } = useSWR('items-list', fetcher)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({ id: null, detail: '', brand: '', warna: '', harga: '', category: 'Pakaian', customCategory: '', link: '', is_purchased: false })

  async function handleSave(e) {
    e.preventDefault(); setIsSaving(true)
    try {
      let finalCat = formData.category === 'Others' ? formData.customCategory : formData.category
      const cleanPrice = formData.harga ? parseInt(formData.harga.toString().replace(/\D/g, '')) : 0
      const payload = { detail: formData.detail, brand: formData.brand||'', warna: formData.warna||'', harga: cleanPrice, category: finalCat, link: formData.link||'', is_purchased: formData.is_purchased }
      if (isEditing) await supabase.from('items').update(payload).eq('id', formData.id)
      else await supabase.from('items').insert([payload])
      setIsModalOpen(false); mutate()
    } catch (e) { alert(e.message) } finally { setIsSaving(false) }
  }
  async function handleDelete(id) { if (confirm('Hapus?')) { await supabase.from('items').delete().eq('id', id); mutate() } }
  async function toggleStatus(item) {
    const newStatus = !item.is_purchased
    mutate(items.map(i => i.id === item.id ? {...i, is_purchased: newStatus} : i), false)
    await supabase.from('items').update({ is_purchased: newStatus }).eq('id', item.id)
    mutate()
  }
  
  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  const formatInput = (v) => v ? new Intl.NumberFormat('id-ID').format(v) : ''
  const handleNum = (e, f) => setFormData({ ...formData, [f]: e.target.value.replace(/\D/g, '') })
  const cats = Array.from(new Set([...STANDARD_CATEGORIES, ...items.map(i => i.category)]))
  const openAdd = () => { setFormData({ id: null, detail: '', brand: '', warna: '', harga: '', category: 'Pakaian', customCategory: '', link: '', is_purchased: false }); setIsEditing(false); setIsModalOpen(true) }
  const openEdit = (item) => { setFormData({ ...item, category: STANDARD_CATEGORIES.includes(item.category) ? item.category : 'Others', customCategory: STANDARD_CATEGORIES.includes(item.category) ? '' : item.category, link: item.link || '' }); setIsEditing(true); setIsModalOpen(true) }

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="pb-20 p-4 bg-[#FAFAFA] min-h-screen">
       {/* HEADER (Saya tambah tombol back agar konsisten) */}
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50"><ArrowLeft size={18}/></button>
             <h1 className="text-xl font-bold text-gray-900">Checklist Barang</h1>
          </div>
          {/* Tombol Tambah Pakai Warna Tema */}
          <button onClick={openAdd} className={`${colors.primary} text-white px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-md transition-all`}>
             <Plus size={16}/> Tambah
          </button>
       </div>

       <div className="space-y-6">
          {cats.map((cat) => {
             const catItems = items.filter(i => i.category === cat)
             if (!catItems.length) return null 
             return (
               <div key={cat} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                 {/* Header Kategori Pakai Warna Tema Tipis */}
                 <div className={`px-4 py-3 border-b border-gray-100 flex justify-between items-center ${colors.softBg}`}>
                    <h2 className={`text-sm font-bold ${colors.textMain}`}>{cat}</h2>
                    <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full font-bold text-gray-500">{catItems.length} Item</span>
                 </div>
                 
                 <div className="divide-y divide-gray-100">
                   {catItems.map((item) => (
                     <div key={item.id} className={`p-4 flex gap-4 items-center transition-colors ${item.is_purchased ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50/50'}`}>
                        
                        {/* Icon Box (Warna Tema) */}
                        <div onClick={() => toggleStatus(item)} className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${item.is_purchased ? `${colors.primary} text-white` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                           {item.is_purchased ? <Check size={18} strokeWidth={3}/> : <ShoppingCart size={18}/>}
                        </div>

                        {/* Details (Dense) */}
                        <div className="flex-1 min-w-0" onClick={() => openEdit(item)}>
                           <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-sm text-gray-900 truncate ${item.is_purchased && 'line-through'}`}>{item.detail}</h3>
                              {item.link && <a href={item.link} target="_blank" onClick={(e) => e.stopPropagation()} className="text-blue-500 hover:text-blue-700"><ExternalLink size={12}/></a>}
                           </div>
                           <div className="flex flex-wrap gap-2 mt-0.5">
                             {item.brand && <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 rounded">{item.brand}</span>}
                             {item.warna && <span className="text-[10px] font-medium text-gray-500 border border-gray-200 px-1.5 rounded">{item.warna}</span>}
                           </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="text-right flex flex-col items-end gap-1">
                           <p className={`font-mono font-bold text-xs ${colors.textMain}`}>{formatRupiah(item.harga)}</p>
                           <div className="flex gap-1">
                              <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14}/></button>
                              <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )
          })}
       </div>

       {/* MODAL (Compact Form) */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-5"><h3 className="font-bold text-lg">{isEditing ? 'Edit' : 'Baru'}</h3><button onClick={() => setIsModalOpen(false)}><X size={20}/></button></div>
             <form onSubmit={handleSave} className="space-y-4">
                <input type="text" placeholder="Nama Barang (Wajib)" required value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold text-gray-900 focus:ring-1 focus:ring-black"/>
                
                <div className="grid grid-cols-2 gap-3">
                   <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm">{STANDARD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}<option value="Others">Lainnya...</option></select>
                   <input type="text" placeholder="Harga" value={formatInput(formData.harga)} onChange={e => handleNum(e, 'harga')} className="w-full p-3 bg-gray-50 rounded-xl border-none font-mono font-bold text-sm text-right"/>
                </div>
                {formData.category === 'Others' && <input type="text" placeholder="Kategori Baru..." value={formData.customCategory} onChange={e => setFormData({...formData, customCategory: e.target.value})} className="w-full p-3 bg-blue-50 text-blue-900 rounded-xl border-none text-sm"/>}
                
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 text-gray-400" size={14}/>
                    <input type="url" placeholder="Link Shopee/Tokped..." value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-gray-50 rounded-xl border-none text-sm text-blue-600 truncate"/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <input type="text" placeholder="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none text-xs"/>
                   <input type="text" placeholder="Warna" value={formData.warna} onChange={e => setFormData({...formData, warna: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none text-xs"/>
                </div>
                <button type="submit" disabled={isSaving} className={`w-full ${colors.primary} text-white font-bold py-3 rounded-xl mt-2 text-sm transition-opacity hover:opacity-90`}>{isSaving ? '...' : 'Simpan'}</button>
             </form>
          </div>
        </div>
       )}
    </div>
  )
}