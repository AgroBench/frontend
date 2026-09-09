import { createVuetify } from 'vuetify'
import { pt } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  locale: {
    locale: 'pt',
    messages: { pt },
  },
  defaults: {
    VBtn: { rounded: 'lg', elevation: 0 },
    VCard: { rounded: 'xl', elevation: 0 },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
    VAlert: { rounded: 'lg' },
  },
  theme: {
    defaultTheme: 'agrobench',
    themes: {
      agrobench: {
        dark: false,
        colors: {
          background: '#f6f2e6',
          surface: '#fffcf3',
          primary: '#2f6d61',
          secondary: '#a06e13',
          error: '#a1502c',
          info: '#2f6d61',
          success: '#2f6d61',
          warning: '#a06e13',
          'on-background': '#1c1c11',
          'on-surface': '#1c1c11',
          'on-primary': '#fffaf0',
          'on-secondary': '#fffaf0',
        },
      },
    },
  },
})
