'use client'
import { User } from 'lucide-react'

export default function Avatar({ value, size = "w-24 h-24", fontSize = "text-5xl", className = "" }) {
  // Cek apakah value adalah Link URL (Foto) atau Emoji
  const isImage = value?.startsWith('http')

  // Style dasar lingkaran
  const baseClass = `${size} rounded-full flex items-center justify-center shadow-lg border-4 border-white relative overflow-hidden bg-gray-100 ${className}`

  if (!value) {
     return <div className={baseClass}><User className="text-gray-400"/></div>
  }

  if (isImage) {
    return (
      <div className={baseClass}>
        <img src={value} alt="Profile" className="w-full h-full object-cover" />
      </div>
    )
  }

  // Jika Emoji
  return (
    <div className={baseClass}>
       <span className={fontSize}>{value}</span>
    </div>
  )
}