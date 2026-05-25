import { colord } from 'colord'

export function applyTheme(primary: string, background: string, dark: boolean) {
  console.log(primary, background, dark, 'primary, background, dark')
  const root = document.documentElement

  // PRIMARY SCALE
  const base = colord(primary)
  const SCALE = {
    50: 0.95,
    100: 0.9,
    200: 0.75,
    300: 0.6,
    400: 0.4,
    500: 0,
    600: -0.1,
    700: -0.2,
    800: -0.3,
    900: -0.4,
    950: -0.5
  }

  for (const [k, v] of Object.entries(SCALE)) {
    const c = v === 0 ? base : v > 0 ? base.lighten(v) : base.darken(Math.abs(v))

    root.style.setProperty(`--p-primary-${k}`, c.toHex())
  }

  const BG_SCALE = {
    0: 0.15, // lighter than selected bg
    50: 0, // API color
    100: -0.05,
    200: -0.1,
    300: -0.2,
    400: -0.3,
    500: -0.4,
    600: -0.5,
    700: -0.6,
    800: -0.7,
    900: -0.8,
    950: -0.85
  }

  const bgBase = colord(background)

  for (const [k, v] of Object.entries(BG_SCALE)) {
    const c = v === 0 ? bgBase : v > 0 ? bgBase.lighten(v) : bgBase.darken(Math.abs(v))

    root.style.setProperty(`--p-bg-${k}`, c.toHex())
  }
}
