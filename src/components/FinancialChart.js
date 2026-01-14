'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function FinancialChart({ data }) {
  // 1. Jika data kosong/null
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
         <p className="text-xs font-serif italic">Belum ada data transaksi</p>
      </div>
    )
  }

  // 2. Olah Data
  const processData = () => {
    // Urutkan dari terlama
    const sorted = [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    
    let currentBalance = 0
    let chartData = sorted.map(item => {
      const val = item.type === 'in' ? item.amount : -item.amount
      currentBalance += val
      return {
        date: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        saldo: currentBalance,
        title: item.title,
        amount: item.amount
      }
    })

    // FIX: Jika data cuma 1, tambahkan titik awal (0) biar grafik muncul
    if (chartData.length === 1) {
       chartData = [
         { date: 'Start', saldo: 0, title: 'Awal', amount: 0 },
         ...chartData
       ]
    }

    return chartData
  }

  const chartData = processData()

  // Tooltip Custom (Kotak Info saat di-hover)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/20 text-xs">
          <p className="font-bold text-gray-900 mb-1">{label}</p>
          <p className="text-gray-500">{dataPoint.title}</p>
          <p className={`font-mono font-bold ${dataPoint.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
            Rp {new Intl.NumberFormat('id-ID').format(dataPoint.saldo)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    // PENTING: Container harus punya width/height 100%
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fff" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="saldo" 
            stroke="#fff" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorSaldo)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}