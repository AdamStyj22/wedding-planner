'use client'
import { useUser } from '../context/UserContext'
import { THEMES } from '../lib/themes'

export function useAppTheme() {
  const { user } = useUser()
  // Kalau user belum pilih tema, paksa jadi 'black'
  const currentThemeId = user?.theme || 'black'
  return THEMES[currentThemeId] ? THEMES[currentThemeId].colors : THEMES['black'].colors
}