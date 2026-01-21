import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // 修改說明：當使用 Custom Domain (如 mktsavio.com) 時，網站會位於網域根目錄
  // 因此 base 必須設為 '/'，不能是 '/salary-calculator/'
  base: '/', 
  
  plugins: [
    react(),
    // PWA 設定 (讓網頁變成 App 的關鍵)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '薪資試算模擬器',
        short_name: '薪資試算',
        description: '快速計算年度薪資與獎金結構',
        theme_color: '#ffffff', // 可以改成您喜歡的顏色，例如 #1e293b (深藍)
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})