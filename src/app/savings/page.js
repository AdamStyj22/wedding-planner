'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { ArrowLeft, Plus, Minus, TrendingUp, TrendingDown, Wallet, Calendar, User } from 'lucide-react'
import { useAppTheme } from '../../hooks/useAppTheme'
import { useUser } from '../../context/UserContext' // <--- IMPORT CONTEXT USER
import { useRouter } from 'next/navigation'

const fetcher = async () => {
  const { data } = await supabase.from('savings').select('*').order('date', { ascending: false })
  return data || []
}

export default function SavingsPage() {
  const colors = useAppTheme()
  const { user } = useUser() // <--- AMBIL DATA USER YANG LOGIN
  const router = useRouter()
  const { data: transactions = [], mutate, isLoading } = useSWR('savings-list', fetcher)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [type, setType] = useState('in')
  const [form, setForm] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0] })
  const [isSaving, setIsSaving] = useState(false)

  // --- LOGIC ---
  async function handleSave(e) {
      e.preventDefault()
      setIsSaving(true)
      
      const cleanAmount = form.amount ? parseInt(form.amount.toString().replace(/\D/g, '')) : 0
      
      // Simpan data beserta NAMA user yang sedang login
      const { error } = await supabase.from('savings').insert([{
          title: form.title,
          amount: cleanAmount,
          type: type,
          date: form.date,
          saved_by: user?.name || 'Anonim' // <--- SIMPAN NAMA DISINI
      }])

      if (error) {
          alert("Gagal simpan: " + error.message)
      } else {
          setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0] })
          setIsModalOpen(false)
          mutate()
      }
      setIsSaving(false)
  }

  async function handleDelete(id) {
      if(!confirm('Hapus transaksi ini?')) return
      await supabase.from('savings').delete().eq('id', id)
      mutate()
  }

  const totalBalance = transactions.reduce((acc, curr) => {
      return curr.type === 'in' ? acc + curr.amount : acc - curr.amount
  }, 0)

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

  const openModal = (transactionType) => {
      setType(transactionType)
      setIsModalOpen(true)
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
       
       {/* KONTAINER UTAMA */}
       <div className="max-w-5xl mx-auto w-full px-6 md:px-12 pt-8 md:pt-12">
           
           {/* 1. HEADER */}
           <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition mb-4 font-bold text-xs uppercase tracking-wider">
              <ArrowLeft size={16}/> Dashboard
           </button>

           <div className="flex justify-between items-end mb-6 md:mb-8">
               <h1 className="font-serif text-3xl md:text-4xl text-gray-900">Dompet Nikah</h1>
               {/* Label User Login */}
               <div className="text-right hidden md:block">
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest">Login Sebagai</p>
                   <p className={`font-bold ${colors.textMain}`}>{user?.name}</p>
               </div>
           </div>

           {/* 2. ATM CARD */}
           <div className={`relative w-full rounded-[2rem] p-6 md:p-8 shadow-xl overflow-hidden flex flex-col justify-between transition-colors duration-500 mb-8 ${colors.primary} aspect-[1.6/1] md:aspect-auto md:h-64`}>
               {/* Pattern Overlay */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
               
               <div className="relative z-10 flex justify-between items-start">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white border border-white/10">
                      <Wallet size={24}/>
                  </div>
                  {/* Chip Icon */}
                  <div className="w-12 h-9 border border-white/20 rounded-lg flex items-center justify-center relative overflow-hidden bg-white/5 backdrop-blur-sm">
                      <div className="w-full h-[1px] bg-white/30 absolute top-2.5"></div>
                      <div className="w-full h-[1px] bg-white/30 absolute bottom-2.5"></div>
                      <div className="h-full w-[1px] bg-white/30 absolute left-4"></div>
                      <div className="h-full w-[1px] bg-white/30 absolute right-4"></div>
                  </div>
               </div>

               <div className="relative z-10 text-white">
                  <p className="text-[10px] md:text-xs font-bold opacity-80 mb-1 uppercase tracking-widest">Total Saldo</p>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight truncate">{formatRupiah(totalBalance)}</h2>
               </div>
           </div>

           {/* 3. ACTION BUTTONS */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
               <button onClick={() => openModal('in')} className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 md:gap-3 hover:shadow-md transition active:scale-[0.98] group hover:border-emerald-100">
                   <div className="p-2 md:p-2.5 bg-emerald-50 text-emerald-600 rounded-full group-hover:bg-emerald-100 transition flex-shrink-0">
                       <Plus size={18} className="md:w-5 md:h-5"/>
                   </div>
                   <div className="text-left min-w-0">
                       <p className="text-xs md:text-sm font-bold text-gray-900 truncate">Pemasukan</p>
                       <p className="text-[10px] text-gray-400 truncate">Tambah dana</p>
                   </div>
               </button>

               <button onClick={() => openModal('out')} className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 md:gap-3 hover:shadow-md transition active:scale-[0.98] group hover:border-rose-100">
                   <div className="p-2 md:p-2.5 bg-rose-50 text-rose-600 rounded-full group-hover:bg-rose-100 transition flex-shrink-0">
                       <Minus size={18} className="md:w-5 md:h-5"/>
                   </div>
                   <div className="text-left min-w-0">
                       <p className="text-xs md:text-sm font-bold text-gray-900 truncate">Pengeluaran</p>
                       <p className="text-[10px] text-gray-400 truncate">Catat biaya</p>
                   </div>
               </button>
           </div>

           {/* 4. TRANSACTION HISTORY */}
           <div className="space-y-4">
               <div className="flex items-center justify-between">
                   <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">Riwayat Transaksi</h3>
                   <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-500">{transactions.length} Data</span>
               </div>
               
               {transactions.length === 0 && <p className="text-center text-xs text-gray-400 py-10 italic border-2 border-dashed border-gray-100 rounded-2xl">Belum ada data transaksi.</p>}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {transactions.map((t) => (
                       <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center group hover:shadow-sm transition hover:border-gray-200">
                           <div className="flex items-center gap-4">
                               <div className={`p-3 rounded-2xl ${t.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                   {t.type === 'in' ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                               </div>
                               <div>
                                   <p className="font-bold text-gray-900 text-sm line-clamp-1">{t.title}</p>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      {/* BADGE NAMA PENABUNG */}
                                      {t.saved_by && (
                                          <span className="text-[9px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                            <User size={8}/> {t.saved_by}
                                          </span>
                                      )}
                                      <p className="text-[10px] text-gray-400">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                   </div>
                               </div>
                           </div>
                           <div className="text-right flex-shrink-0 ml-2">
                               <p className={`font-mono font-bold text-sm ${t.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                   {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                               </p>
                               <button onClick={() => handleDelete(t.id)} className="text-[10px] text-gray-300 mt-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer px-2 py-1 hover:bg-red-50 rounded">Hapus</button>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

       </div>

       {/* MODAL FORM */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 animate-slide-up shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 rounded-2xl ${type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {type === 'in' ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-gray-900">{type === 'in' ? 'Pemasukan' : 'Pengeluaran'}</h3>
                        <p className="text-xs text-gray-400">
                             Ditambahkan oleh: <span className="font-bold text-black">{user?.name}</span>
                        </p>
                    </div>
                </div>
                
                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Judul</label>
                        <input type="text" placeholder={type === 'in' ? "Gaji, Bonus..." : "DP Gedung, Cincin..."} required autoFocus className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 mt-2 focus:ring-2 focus:ring-black/5 outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})}/>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nominal (Rp)</label>
                        <input type="text" placeholder="0" required className="w-full p-4 bg-gray-50 rounded-2xl font-mono text-xl font-bold text-gray-900 mt-2 focus:ring-2 focus:ring-black/5 outline-none" 
                            value={form.amount ? new Intl.NumberFormat('id-ID').format(form.amount) : ''} 
                            onChange={e => setForm({...form, amount: e.target.value.replace(/\D/g, '')})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tanggal</label>
                        <div className="relative mt-2">
                            <Calendar size={18} className="absolute left-4 top-4 text-gray-400"/>
                            <input type="date" required className="w-full pl-12 p-4 bg-gray-50 rounded-2xl text-sm font-medium text-gray-900 outline-none cursor-pointer" value={form.date} onChange={e => setForm({...form, date: e.target.value})}/>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 transition">Batal</button>
                        <button type="submit" disabled={isSaving} className={`flex-1 py-4 text-white rounded-2xl font-bold shadow-lg transition transform active:scale-95 ${type === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                            {isSaving ? '...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
       )}

    </div>
  )
}