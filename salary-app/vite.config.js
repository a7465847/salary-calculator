import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // 自訂網域請設為 '/'
  base: '/', 
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // 自動更新模式
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      
      // --- 關鍵修改：新增 workbox 設定 ---
      workbox: {
        // 1. 強制刪除舊的快取
        cleanupOutdatedCaches: true,
        // 2. 新的 Service Worker 安裝後立即接管 (Skip Waiting)
        skipWaiting: true,
        // 3. 讓新的 Service Worker 立即控制所有頁面
        clientsClaim: true,
        // 4. 確保 index.html 不被快取太久，每次都去網路檢查是否有新版
        navigateFallbackDenylist: [/^\/api/], // 排除 API 路徑(如果有)
        runtimeCaching: [
          {
            // 對於 HTML 檔案，採用 NetworkFirst (優先網路) 策略
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            },
          },
          {
            // 對於 JS/CSS/圖片，採用 StaleWhileRevalidate (優先快取，背景更新)
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
            },
          },
        ]
      },
      // ----------------------------------

      manifest: {
        name: '薪資試算模擬器',
        short_name: '薪資試算',
        description: '快速計算年度薪資與獎金結構',
        theme_color: '#ffffff',
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