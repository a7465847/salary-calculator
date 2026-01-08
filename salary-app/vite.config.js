import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.dev
export default defineConfig({
  base: '/salary-calculator/', // 必須與 GitHub 儲存庫名稱一致，前後都要斜線
  plugins: [react()],
})