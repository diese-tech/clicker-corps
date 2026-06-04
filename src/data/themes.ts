// Cosmetic palettes. Each theme id maps to a `data-theme` attribute on the
// root element; the actual colors are swapped via CSS custom properties in
// index.css. `accent` is used only to tint the picker swatches.
export interface ThemeDef {
  id: string
  name: string
  accent: string
  bg: string
}

export const THEMES: ThemeDef[] = [
  { id: 'woodland', name: 'Woodland', accent: '#7cfc00', bg: '#1a2e1a' },
  { id: 'desert', name: 'Desert', accent: '#e8c860', bg: '#2b2416' },
  { id: 'dress_blues', name: 'Dress Blues', accent: '#d4af37', bg: '#0a1226' },
  { id: 'night_ops', name: 'Night Ops', accent: '#ffae00', bg: '#0a0a0a' },
]

export const DEFAULT_THEME = 'woodland'
