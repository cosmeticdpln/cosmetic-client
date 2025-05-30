// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@pinia/nuxt',
  ],
  
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000'
    }
  },

  nitro: {
    devProxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        prependPath: true
      }
    }
  },

  app: {
    head: {
      title: 'فروشگاه لوازم آرایشی',
      htmlAttrs: {
        dir: 'rtl',
        lang: 'fa'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
