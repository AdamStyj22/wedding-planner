'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data pas load
  useEffect(() => {
    getExpenses()
  }, [])

  async function getExpenses() {
    // Select * from expenses order by id
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) console.log('error', error)
    else setExpenses(data)
    setLoading(false)
  }

  // Helper format Rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Wedding Planner Adam</h1>
        
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">
                      {formatRupiah(item.budget)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${item.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          item.status === 'dp' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}