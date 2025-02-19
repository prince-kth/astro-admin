import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AccentColor = 'blue' | 'green' | 'purple' | 'rose' | 'amber' | 'teal'

interface ThemeState {
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accentColor: 'blue',
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: 'theme-store',
    }
  )
)
