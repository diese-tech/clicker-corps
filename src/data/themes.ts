// Cosmetic palettes. Each theme id maps to a `data-theme` attribute on the
// root element; the actual colors are swapped via CSS custom properties in
// index.css. `accent` is used only to tint the picker swatches.
export interface ThemeDef {
  id: string
  name: string
  accent: string
  bg: string
}

// Note: the `desert` id is the default ("Service Khaki"). Ids are kept stable so
// existing saved `selectedTheme` values still resolve after the visual overhaul.
export const THEMES: ThemeDef[] = [
  { id: 'desert', name: 'Service Khaki', accent: '#cda349', bg: '#241f15' },
  { id: 'woodland', name: 'Woodland', accent: '#9fb84f', bg: '#16241a' },
  { id: 'dress_blues', name: 'Dress Blues', accent: '#d4af37', bg: '#0e1730' },
  { id: 'night_ops', name: 'Night Ops', accent: '#e0922f', bg: '#111110' },
]

export const DEFAULT_THEME = 'desert'
