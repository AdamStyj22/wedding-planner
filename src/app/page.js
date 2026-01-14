'use client'
import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'
import { 
  ArrowUpRight, Calendar, Edit2, X, Sparkles, 
  Plus, StickyNote, Save, Bell, CheckSquare, Square, Trash2, 
  Clock, CalendarDays, Pencil, Check, Flag, Briefcase, ChevronRight, 
  Camera 
} from 'lucide-react'
import FinancialChart from '../components/FinancialChart'
import { useAppTheme } from '../hooks/useAppTheme'
import { useUser } from '../context/UserContext'
import { useRouter } from 'next/navigation'

// --- 3D ASSETS (POSISI RAPI & TIDAK MENUTUPI) ---
const ASSETS = {
    coinStack: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Coin.png",
    shoppingBag: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shopping%20Bags.png",
    wallet: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Purse.png", 
    vendor: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Briefcase.png", 
    camera: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Camera%20with%20Flash.png",
    calendar: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Spiral%20Calendar.png"
}

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=60", 
  "https://images.unsplash.com/photo-1621621667797-e06afc217fb0?w=800&auto=format&fit=crop&q=60"
];

const fetcher = async () => {
  const { data: items } = await supabase.from('items').select('*')
  const { data: savings } = await supabase.from('savings').select('*')
  const { data: reminders } = await supabase.from('reminders').select('*').order('schedule_at', { ascending: true })
  const { data: milestones } = await supabase.from('milestones').select('*').order('event_date', { ascending: true })
  const { data: vendors } = await supabase.from('vendors').select('*').order('created_at', { ascending: false })
  
  let { data: config, error } = await supabase.from('wedding_config').select('*').single()
  if (error || !config) {
     const { data: newConfig } = await supabase.from('wedding_config').insert([{ id: 1 }]).select().single()
     config = newConfig || { guest_count: 0, memo: '', gallery_urls: [] }
  }

  return { items: items || [], savings: savings || [], reminders: reminders || [], milestones: milestones || [], vendors: vendors || [], config }
}

export default function Dashboard() {
  const { user } = useUser()
  const colors = useAppTheme()
  const router = useRouter()
  
  const { data = { items: [], savings: [], reminders: [], milestones: [], vendors: [], config: {} }, isLoading, mutate } = useSWR('dashboard-stats', fetcher)
  
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [greeting, setGreeting] = useState('Halo')
  
  // STATES
  const [memoText, setMemoText] = useState('')
  const [isSavingMemo, setIsSavingMemo] = useState(false)
  const [reminderTitle, setReminderTitle] = useState(''); const [reminderDate, setReminderDate] = useState('')
  const [editingId, setEditingId] = useState(null); const [editTitle, setEditTitle] = useState(''); const [editDate, setEditDate] = useState('')
  const [msTitle, setMsTitle] = useState(''); const [msDate, setMsDate] = useState('')
  
  // GALLERY
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const photos = (data?.config?.gallery_urls && data.config.gallery_urls.length > 0) ? data.config.gallery_urls : DEFAULT_PHOTOS;

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 11) setGreeting('Selamat Pagi')
    else if (hour < 15) setGreeting('Selamat Siang')
    else if (hour < 18) setGreeting('Selamat Sore')
    else setGreeting('Selamat Malam')
  }, [])

  useEffect(() => {
    if (data?.config) {
        setMemoText(data.config.memo || '')
        setNewDate(data.config.wedding_date || '')
    }
  }, [data])

  useEffect(() => {
      const interval = setInterval(() => { nextPhoto() }, 4000); 
      return () => clearInterval(interval);
  }, [currentPhotoIndex, photos.length]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Calon Pengantin'
  const weddingDate = data?.config?.wedding_date
  let daysToGo = 0
  if (weddingDate) {
    const diffTime = new Date(weddingDate) - new Date()
    daysToGo = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
  }

  // --- FUNCTIONAL LOGIC ---
  async function handleSaveDate(e) { e.preventDefault(); await supabase.from('wedding_config').upsert({ id: 1, wedding_date: newDate }); setIsDateModalOpen(false); mutate() }
  async function saveMemo() { setIsSavingMemo(true); await supabase.from('wedding_config').upsert({ id: 1, memo: memoText }); setIsSavingMemo(false); mutate() }
  const toLocalISOString = (d) => { if (!d) return ''; const date = new Date(d); const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 16) }
  
  // REMINDER LOGIC
  async function addReminder(e) { e.preventDefault(); if(!reminderTitle) return; await supabase.from('reminders').insert({ title: reminderTitle, schedule_at: reminderDate ? new Date(reminderDate).toISOString() : null }); setReminderTitle(''); setReminderDate(''); mutate() }
  async function toggleReminder(id, s) { const u = data.reminders.map(r => r.id === id ? {...r, is_done: !s} : r); mutate({...data, reminders: u}, false); await supabase.from('reminders').update({ is_done: !s }).eq('id', id); mutate() }
  async function deleteReminder(id) { if(!confirm('Hapus?')) return; const f = data.reminders.filter(r => r.id !== id); mutate({...data, reminders: f}, false); await supabase.from('reminders').delete().eq('id', id); mutate() }
  const startEditing = (r) => { setEditingId(r.id); setEditTitle(r.title); setEditDate(r.schedule_at ? toLocalISOString(r.schedule_at) : '') }
  const saveEdit = async (id) => { if(!editTitle) return; const d = editDate ? new Date(editDate).toISOString() : null; const u = data.reminders.map(r => r.id === id ? { ...r, title: editTitle, schedule_at: d } : r); mutate({...data, reminders: u}, false); setEditingId(null); await supabase.from('reminders').update({ title: editTitle, schedule_at: d }).eq('id', id); mutate() }
  const cancelEditing = () => { setEditingId(null); setEditTitle(''); setEditDate(''); }

  // MILESTONE LOGIC (RESTORED)
  async function addMilestone(e) { e.preventDefault(); if(!msTitle) return; await supabase.from('milestones').insert({ title: msTitle, event_date: msDate || null }); setMsTitle(''); setMsDate(''); mutate() }
  async function toggleMilestone(id, s) { const u = data.milestones.map(m => m.id === id ? {...m, is_done: !s} : m); mutate({...data, milestones: u}, false); await supabase.from('milestones').update({ is_done: !s }).eq('id', id); mutate() }
  async function deleteMilestone(id) { if(!confirm('Hapus?')) return; const f = data.milestones.filter(m => m.id !== id); mutate({...data, milestones: f}, false); await supabase.from('milestones').delete().eq('id', id); mutate() }

  const nextPhoto = () => { setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1)); };
  const getGoogleCalendarLink = (t, d) => { if (!d) return null; const date = new Date(d); const s = date.toISOString().replace(/-|:|\.\d\d\d/g, ""); const e = new Date(date.getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, ""); return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t)}&dates=${s}/${e}&details=WeddingPlanner` }
  const formatSchedule = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
  const formatMilestoneDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'
  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)
  const getStatusColor = (s) => s === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : s === 'DP' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'

  const items = data?.items || []; const savings = data?.savings || []; const reminders = data?.reminders || []; const milestones = data?.milestones || []; const vendors = data?.vendors || []
  const totalCost = vendors.reduce((acc, curr) => acc + (curr.price || 0), 0); 
  const totalSaved = savings.reduce((acc, curr) => curr.type === 'in' ? acc + (curr.amount || 0) : acc - (curr.amount || 0), 0)
  const progress = items.length > 0 ? Math.round((items.filter(i => i.is_purchased).length / items.length) * 100) : 0; 
  const moneyProgress = totalCost > 0 ? Math.round((totalSaved / totalCost) * 100) : 0

  if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-400 font-serif italic">Memuat...</div>

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans relative pb-28 md:pb-8 bg-[#FAFAFA]" onClick={() => setIsProfileOpen(false)}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-50 pt-4 px-2">
        <div className="relative w-full md:w-auto">
           <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Sparkles size={14} className={`${colors.textMain} opacity-60`} />
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.25em]">{greeting}, {firstName}</p>
           </div>
           <h1 className="text-4xl md:text-6xl font-serif text-gray-900 leading-[1.1] pr-16 md:pr-0">
             Wedding <span className={`italic ${colors.textMain} opacity-90`}>Planner.</span>
           </h1>
        </div>
        <div className="hidden md:flex items-center gap-4">
            <button onClick={() => { setNewDate(weddingDate || ''); setIsDateModalOpen(true) }} className="group relative bg-white border border-gray-100 px-5 py-4 rounded-[2rem] shadow-sm hover:shadow-md transition-all text-left min-w-[180px]">
               <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1"><Calendar size={12}/> Menuju Hari H</div>
               <div className="text-2xl font-serif font-medium text-gray-900">{daysToGo > 0 ? `${daysToGo} Hari` : daysToGo === 0 ? 'Hari H!' : 'Set Tanggal'}</div>
               <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={16} className="text-gray-400"/></div>
            </button>
        </div>
      </div>

      {/* HERO CARDS - 3D TIDY & CLEAN */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 relative z-10 animate-slide-up px-2">
         
         {/* CARD 1: TABUNGAN */}
         <div className={`md:col-span-7 ${colors.primary} text-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 relative overflow-hidden group flex flex-col justify-between min-h-[340px]`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-md border border-white/10">
                    <img src={ASSETS.wallet} alt="Wallet" className="w-6 h-6 object-contain"/>
                </div>
                <Link href="/savings" className="text-[10px] font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-100 transition flex items-center gap-1.5 shadow-lg">Kelola <ArrowUpRight size={12}/></Link>
            </div>

            {/* Content: Teks & 3D Coin Berdampingan (RAPI) */}
            <div className="flex items-center justify-between relative z-10 my-2">
                <div className="flex-1 pr-2">
                    <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">Total Terkumpul</p>
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tight drop-shadow-sm leading-tight">{formatRupiah(totalSaved)}</h2>
                </div>
                {/* 3D Asset: Inside box, no overflow */}
                <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 animate-float-slow filter drop-shadow-lg">
                    <img src={ASSETS.coinStack} alt="Coins" className="w-full h-full object-contain" />
                </div>
            </div>
            
            {/* Grafik: Opacity rendah agar tidak nabrak teks */}
            <div className="absolute bottom-14 left-0 w-full h-[120px] px-2 opacity-50 mix-blend-screen z-0 pointer-events-none">
                <FinancialChart data={savings} />
            </div>
            
            {/* Footer */}
            <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs text-white/90 mb-2 font-bold tracking-wide"><span>TARGET: {formatRupiah(totalCost)}</span><span>{moneyProgress}%</span></div>
                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden backdrop-blur-sm"><div className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${moneyProgress > 100 ? 100 : moneyProgress}%` }}></div></div>
            </div>
         </div>

         {/* CARD 2: CHECKLIST */}
         <div className="md:col-span-5 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100 flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${colors.softBg} transition-colors`}><CheckSquare className={`${colors.textMain}`} size={20}/></div>
                <Link href="/items" className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"><ArrowUpRight size={16}/></Link>
            </div>
            
            <div className="flex items-center justify-between relative z-10 flex-1">
                <div>
                    <h3 className="text-5xl font-serif text-gray-900 mb-1 tracking-tight">{progress}%</h3>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Progress</p>
                </div>
                <div className="w-24 h-24 animate-float-slower filter drop-shadow-md opacity-90">
                    <img src={ASSETS.shoppingBag} alt="Bag" className="w-full h-full object-contain" />
                </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-gray-50 mt-4">
                <p className="text-xs text-gray-500 leading-relaxed">Barang Terbeli: <strong className="text-gray-900">{items.filter(i => i.is_purchased).length}</strong> / {items.length}</p>
            </div>
         </div>
      </div>

      {/* SHORTCUTS */}
      <div className="relative z-10 px-2" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
         <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Shortcut</h3>
         <div className="grid grid-cols-3 gap-3 md:gap-4">
            <button onClick={() => router.push('/savings')} className="bg-white hover:bg-gray-50 border border-gray-100 p-3 aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 relative z-10 filter drop-shadow-sm group-hover:scale-110 transition-transform"><img src={ASSETS.wallet} alt="Nabung" className="w-full h-full object-contain"/></div><span className="text-[10px] font-bold text-gray-600">Nabung</span>
            </button>
            <button onClick={() => router.push('/items')} className="bg-white hover:bg-gray-50 border border-gray-100 p-3 aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 relative z-10 filter drop-shadow-sm group-hover:scale-110 transition-transform"><img src={ASSETS.shoppingBag} alt="Barang" className="w-full h-full object-contain"/></div><span className="text-[10px] font-bold text-gray-600">Barang</span>
            </button>
            <button onClick={() => router.push('/vendors')} className="bg-white hover:bg-gray-50 border border-gray-100 p-3 aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 relative z-10 filter drop-shadow-sm group-hover:scale-110 transition-transform"><img src={ASSETS.vendor} alt="Vendor" className="w-full h-full object-contain"/></div><span className="text-[10px] font-bold text-gray-600">Vendor</span>
            </button>
         </div>
      </div>

      {/* --- ALL FUNCTIONAL WIDGETS (RESTORED & ORGANIZED) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 px-2 pb-4" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
         
         {/* LEFT COLUMN: JADWAL (RUNDOWN) */}
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[400px] relative overflow-hidden">
             <div className="absolute right-4 top-4 w-12 h-12 opacity-50 pointer-events-none"><img src={ASSETS.calendar} className="w-full h-full object-contain"/></div>
            <div className="flex items-center justify-between mb-4 relative z-10"><div className="flex items-center gap-2"><Bell size={14} className="text-gray-400"/><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jadwal</p></div><span className="text-[10px] text-gray-300 bg-gray-50 px-2 py-1 rounded-full">{reminders.length}</span></div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
                {reminders.length === 0 && <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2"><Bell size={24} className="opacity-20"/><p className="text-[10px] italic">Tidak ada jadwal.</p></div>}
                {reminders.map((r) => (<div key={r.id} className="group bg-gray-50/50 p-3 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">{editingId === r.id ? (<div className="space-y-2 animate-fade-in"><input type="text" autoFocus className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium outline-none" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /><input type="datetime-local" className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 outline-none" value={editDate} onChange={(e) => setEditDate(e.target.value)} /><div className="flex gap-2 mt-1"><button onClick={() => saveEdit(r.id)} className="flex-1 bg-black text-white text-xs py-1.5 rounded-lg font-bold flex items-center justify-center gap-1"><Check size={12}/> Simpan</button><button onClick={cancelEditing} className="bg-gray-200 text-gray-600 px-3 rounded-lg"><X size={12}/></button></div></div>) : (<div className="flex items-start justify-between w-full"><div className="flex items-start gap-3 flex-1"><button onClick={() => toggleReminder(r.id, r.is_done)} className={`hover:opacity-70 transition mt-0.5 ${r.is_done ? colors.textMain : 'text-gray-300'}`}>{r.is_done ? <CheckSquare size={18}/> : <Square size={18}/>}</button><div className="min-w-0"><p className={`text-sm font-bold truncate ${r.is_done ? 'text-gray-300 line-through' : 'text-gray-800'}`}>{r.title}</p>{r.schedule_at && <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-medium w-fit px-2 py-0.5 rounded-lg ${colors.softBg} ${colors.textMain}`}><Clock size={10}/> {formatSchedule(r.schedule_at)}</div>}</div></div><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">{r.schedule_at && !r.is_done && <a href={getGoogleCalendarLink(r.title, r.schedule_at)} target="_blank" rel="noopener noreferrer" className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"><CalendarDays size={14}/></a>}<button onClick={() => startEditing(r)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"><Pencil size={14}/></button><button onClick={() => deleteReminder(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button></div></div>)}</div>))}
            </div>
            <form onSubmit={addReminder} className="mt-4 pt-4 border-t border-gray-100 relative z-10"><div className="flex gap-2 mb-2"><input type="text" placeholder="Jadwal..." className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none font-medium" value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)}/></div><div className="flex gap-2"><input type="datetime-local" className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-xs outline-none text-gray-500" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)}/><button type="submit" disabled={!reminderTitle} className="bg-black text-white px-4 rounded-xl hover:scale-105 transition disabled:opacity-50"><Plus size={16}/></button></div></form>
         </div>

         {/* RIGHT COLUMN: STACK (ROADMAP + VENDOR + MEMO) */}
         <div className="space-y-4">
             
             {/* 1. ROADMAP (MILESTONES) - RESTORED! */}
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[200px] relative overflow-hidden">
                 <div className="flex items-center gap-2 mb-4 relative z-10"><Flag size={14} className="text-gray-400"/><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Roadmap</p></div>
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 pl-2">
                     <div className="relative border-l-2 border-gray-100 ml-2 space-y-4 pb-2">
                        {milestones.length === 0 && <p className="text-xs italic text-gray-300 ml-6">Belum ada target.</p>}
                        {milestones.map((m) => (<div key={m.id} className="relative ml-6 group"><button onClick={() => toggleMilestone(m.id, m.is_done)} className={`absolute -left-[33px] w-4 h-4 rounded-full border-2 transition-all hover:scale-125 z-10 bg-white ${m.is_done ? `border-current ${colors.textMain} bg-current` : 'border-gray-300'}`}></button><div className="flex justify-between items-center"><div className="truncate"><p className={`text-sm font-bold truncate ${m.is_done ? 'text-gray-900' : 'text-gray-500'}`}>{m.title}</p><p className="text-[10px] font-bold text-gray-300 uppercase mt-0.5">{formatMilestoneDate(m.event_date)}</p></div><button onClick={() => deleteMilestone(m.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"><Trash2 size={12}/></button></div></div>))}
                     </div>
                 </div>
                 <form onSubmit={addMilestone} className="relative z-20 mt-2 flex gap-2"><input type="text" placeholder="Target baru..." className="flex-1 bg-gray-50 rounded-lg px-2 text-xs outline-none" value={msTitle} onChange={e => setMsTitle(e.target.value)}/><button type="submit" className="bg-black text-white p-1.5 rounded-lg"><Plus size={12}/></button></form>
             </div>

             {/* 2. VENDOR MINI */}
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[160px]">
                <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Briefcase size={14} className="text-gray-400"/><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vendor</p></div><Link href="/vendors" className="p-1.5 hover:bg-gray-50 rounded-full transition"><ChevronRight size={14} className="text-gray-400"/></Link></div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">{vendors.slice(0, 3).map((v) => (<div key={v.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-all"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${v.status === 'Lunas' ? 'bg-emerald-500' : v.status === 'DP' ? 'bg-orange-500' : 'bg-gray-300'}`}></div><p className="text-xs font-bold text-gray-700 truncate max-w-[100px]">{v.name}</p></div><span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${getStatusColor(v.status)}`}>{v.status}</span></div>))}</div>
             </div>
             
             {/* 3. CATATAN (MEMO) */}
             <div className={`p-6 rounded-[2rem] border shadow-sm relative group h-[140px] flex flex-col ${colors.softBg} border-opacity-50 bg-opacity-30`}>
                <div className="flex items-center justify-between mb-2"><div className={`flex items-center gap-2 ${colors.textMain} opacity-60`}><StickyNote size={14}/><p className="text-[10px] font-bold uppercase tracking-wider">Catatan</p></div><button onClick={saveMemo} className={`p-1.5 rounded-full bg-white shadow-sm transition-all ${isSavingMemo ? 'opacity-50' : 'hover:scale-110'} ${colors.textMain}`}><Save size={14}/></button></div>
                <textarea value={memoText} onChange={(e) => setMemoText(e.target.value)} placeholder="Tulis ide disini..." className="w-full h-full bg-transparent border-none resize-none text-sm font-medium text-gray-700 placeholder:text-gray-400/70 focus:ring-0 p-0 leading-relaxed custom-scrollbar" spellCheck="false"/>
             </div>
         </div>
      </div>

      {/* GALLERY */}
      <div className="relative z-10 px-2 pb-safe">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-visible group relative">
            <div className="absolute -left-4 -top-6 w-24 h-24 z-30 filter drop-shadow-xl animate-bounce-slow">
                 <img src={ASSETS.camera} alt="Camera" className="w-full h-full object-contain"/>
            </div>
            <div className="flex items-center gap-2 mb-4 relative z-20 pl-16"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Our Moments</p></div>
            <div className="relative w-full h-[220px] rounded-[2rem] overflow-hidden bg-gray-50 shadow-inner">
                {photos.length > 0 ? photos.map((src, idx) => (
                <img key={idx} src={src} alt="Our Moment" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentPhotoIndex ? 'opacity-100' : 'opacity-0'}`}/>
                )) : <div className="flex items-center justify-center h-full text-gray-300">Belum ada foto. Upload di menu Profil!</div>}
            </div>
        </div>
      </div>

      {/* FOOTER & MODALS */}
      <div className="pt-4 flex justify-center pb-safe"><p className="font-serif italic text-xs text-gray-400 opacity-50">Designed for Adam & Partner.</p></div>
      {isDateModalOpen && (<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"><div className="flex justify-between items-center mb-6"><h3 className="font-serif text-xl font-bold">The Big Day</h3><button onClick={() => setIsDateModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition"><X size={20}/></button></div><form onSubmit={handleSaveDate}><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Pilih Tanggal</label><input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl border-none text-gray-900 focus:ring-2 focus:ring-black outline-none font-medium mb-6" value={newDate} onChange={(e) => setNewDate(e.target.value)} /><button type="submit" className={`w-full ${colors.primary} text-white font-medium py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg`}>Simpan Tanggal</button></form></div></div>)}
      {isProfileOpen && (<div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>)}
    </div>
  )
}