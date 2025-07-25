import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/chikh_counter/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Chikh Counter',
        short_name: 'Chikh',
        start_url: '/chikh_counter/',
        scope: '/chikh_counter/',
        display: 'standalone',
        background_color: '#333333',
        theme_color: '#333333',
        icons: [
          {
            src: '/chikh_counter/android-icon-36x36.png',
            sizes: '36x36',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/android-icon-48x48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/android-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/android-icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/android-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/ms-icon-310x310.png',
            sizes: '310x310',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/apple-icon-180x180.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/apple-icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/apple-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/apple-icon-120x120.png',
            sizes: '120x120',
            type: 'image/png'
          },
          {
            src: '/chikh_counter/apple-icon-114x114.png',
            sizes: '114x114',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
