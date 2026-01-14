export const THEMES = {
  // 1. TEMA BAYA (FRESH MINT)
  // Hijau Tosca cerah, segar, dan modern.
  baya: {
    id: 'baya',
    label: 'Fresh Mint',
    gradient: 'from-teal-300 to-teal-500', 
    colors: {
      primary: 'bg-teal-500',
      secondary: 'bg-teal-100',
      textMain: 'text-teal-900',
      softBg: 'bg-teal-50',
      border: 'border-teal-200',
      shadow: 'shadow-teal-300',
      button: 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200/50'
    }
  },

  // 2. TEMA BUYA (ROMANTIC ROSE)
  // Merah Mawar deep yang elegan dan romantis.
  buya: {
    id: 'buya',
    label: 'Romantic Rose',
    gradient: 'from-rose-500 to-rose-700', 
    colors: {
      primary: 'bg-rose-600',
      secondary: 'bg-rose-100',
      textMain: 'text-rose-950',
      softBg: 'bg-rose-50',
      border: 'border-rose-200',
      shadow: 'shadow-rose-300',
      button: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-400/50'
    }
  },

  // 3. TEMA ROYAL NAVY (BARU)
  // Biru gelap, maskulin, gagah, dan sangat formal.
  navy: {
    id: 'navy',
    label: 'Royal Navy',
    gradient: 'from-blue-800 to-slate-900',
    colors: {
      primary: 'bg-blue-800',
      secondary: 'bg-blue-100',
      textMain: 'text-blue-900',
      softBg: 'bg-blue-50',
      border: 'border-blue-200',
      shadow: 'shadow-blue-300',
      button: 'bg-blue-800 text-white hover:bg-blue-900 shadow-lg shadow-blue-500/50'
    }
  },

  // 4. TEMA CHAMPAGNE GOLD (BARU)
  // Nuansa emas/amber yang memberikan kesan "Luxury Wedding".
  gold: {
    id: 'gold',
    label: 'Champagne',
    gradient: 'from-amber-300 to-yellow-600',
    colors: {
      primary: 'bg-yellow-600', // Emas tua
      secondary: 'bg-amber-100',
      textMain: 'text-amber-900',
      softBg: 'bg-amber-50',
      border: 'border-amber-200',
      shadow: 'shadow-amber-200',
      button: 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg shadow-yellow-500/50'
    }
  },

  // 5. TEMA SOFT LAVENDER (BARU)
  // Ungu muda pudar, sangat estetik dan kalem (Pinterest style).
  lavender: {
    id: 'lavender',
    label: 'Soft Lavender',
    gradient: 'from-violet-300 to-purple-500',
    colors: {
      primary: 'bg-violet-500',
      secondary: 'bg-violet-100',
      textMain: 'text-violet-900',
      softBg: 'bg-violet-50',
      border: 'border-violet-200',
      shadow: 'shadow-violet-200',
      button: 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-300/50'
    }
  },

  // 6. TEMA DEFAULT (BLACK)
  // Monokrom klasik.
  black: {
    id: 'black',
    label: 'Luxury Black',
    gradient: 'from-gray-800 to-black',
    colors: {
      primary: 'bg-black',
      secondary: 'bg-gray-100',
      textMain: 'text-gray-900',
      softBg: 'bg-gray-50',
      border: 'border-gray-200',
      shadow: 'shadow-gray-300',
      button: 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-400/50'
    }
  }
}