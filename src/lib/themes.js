export const THEMES = {
  // 1. TEMA HITAM (Tetap Elegan)
  black: {
    id: 'black',
    label: 'Luxury Black',
    colors: {
      primary: 'bg-black',
      secondary: 'bg-gray-900',
      accent: 'text-gray-400',
      softBg: 'bg-gray-50',
      border: 'border-gray-200',
      textMain: 'text-gray-900',
      gradient: 'from-gray-700 to-black',
      shadow: 'shadow-gray-300'
    }
  },

  // 2. TEMA MINT (Tosca Terang / Fresh) - INI YANG BARU
  tosca: {
    id: 'tosca',
    label: 'Minty Fresh',
    colors: {
      // Kita pakai Teal-400/500 agar warnanya terang seperti es krim mint
      primary: 'bg-teal-500', 
      secondary: 'bg-teal-600', 
      accent: 'text-teal-100',
      softBg: 'bg-teal-50', // Background belakang icon jadi sangat pudar
      border: 'border-teal-200',
      textMain: 'text-teal-900', // Teks jadi hijau tua agar terbaca
      gradient: 'from-teal-300 to-teal-500', // Gradasi dari mint muda ke tosca sedang
      shadow: 'shadow-teal-200' // Bayangan hijau tipis
    }
  },

  // 3. TEMA ROSE (Tetap Romantis)
  rose: {
    id: 'rose',
    label: 'Romantic Rose',
    colors: {
      primary: 'bg-rose-900', 
      secondary: 'bg-rose-950',
      accent: 'text-rose-200',
      softBg: 'bg-rose-50',
      border: 'border-rose-100',
      textMain: 'text-rose-900',
      gradient: 'from-rose-500 to-rose-900',
      shadow: 'shadow-rose-200'
    }
  }
}