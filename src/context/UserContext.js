'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Load User dari LocalStorage saat awal buka
  useEffect(() => {
    const savedUser = localStorage.getItem('planner_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      
      // 2. BACKGROUND REFRESH: Cek data terbaru dari Supabase agar sinkron
      refreshUserData(parsedUser.id)
    }
    setLoading(false)
  }, [])

  // Fungsi untuk mengambil data terbaru dari Database
  const refreshUserData = async (userId) => {
    if (!userId) return
    const { data } = await supabase.from('app_profiles').select('*').eq('id', userId).single()
    if (data) {
        setUser(data)
        localStorage.setItem('planner_user', JSON.stringify(data))
    }
  }

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('planner_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('planner_user')
  }

  return (
    <UserContext.Provider value={{ user, login, logout, loading, refreshUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)