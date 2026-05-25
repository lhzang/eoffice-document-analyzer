import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: 'var(--p-primary-50)',
      100: 'var(--p-primary-100)',
      200: 'var(--p-primary-200)',
      300: 'var(--p-primary-300)',
      400: 'var(--p-primary-400)',
      500: 'var(--p-primary-500)',
      600: 'var(--p-primary-600)',
      700: 'var(--p-primary-700)',
      800: 'var(--p-primary-800)',
      900: 'var(--p-primary-900)',
      950: 'var(--p-primary-950)'
    },

    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '{primary.50}',
          hoverColor: '{primary.700}',
          activeColor: '{primary.600}'
        },
        highlight: {
          background: '{primary.500}',
          focusBackground: '{primary.500}',
          color: '{primary.50}',
          focusColor: '{primary.50}'
        },
        surface: {
          0: 'var(--p-bg-0)',
          50: 'var(--p-bg-50)',
          100: 'var(--p-bg-100)'
        }
      },
      dark: {
        primary: {
          color: '{primary.50}',
          contrastColor: '{primary.950}',
          hoverColor: '{primary.100}',
          activeColor: '{primary.200}'
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.300}',
          color: '{primary.950}',
          focusColor: '{primary.950}'
        },
        surface: {
          0: 'var(--p-bg-0)',
          50: 'var(--p-bg-50)',
          100: 'var(--p-bg-100)'
        }
      }
    }
  }
})

export default Noir
