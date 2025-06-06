// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@pinia/nuxt',
    '@vueuse/motion/nuxt'
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

  motion: {
    directives: {
      'motion': true
    }
  },

  app: {
    head: {
      title: 'هلمیز',
      htmlAttrs: {
        dir: 'rtl',
        lang: 'fa'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'فروشگاه آنلاین لوازم آرایشی و بهداشتی هلمیز' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
