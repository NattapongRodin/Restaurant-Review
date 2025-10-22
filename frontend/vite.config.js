import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  root: __dirname, // ย้ำ root ให้ตรง frontend
  server: {
    port: 5173,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      overlay: true,
    },
    // ✅ 1) ignore ทั้ง backend + data json แบบ absolute
    watch: {
      ignored: [
        path.resolve(__dirname, '../backend/**'),
        path.resolve(__dirname, '../backend/data/**'),
        // กันเผื่อ editor/temp files
        '**/.vscode/**',
        '**/.idea/**',
        '**/*.tmp',
      ],
    },
    // ✅ 2) จำกัดไฟล์ที่ “ยอมให้ดู” จริง ๆ แค่ใน src เท่านั้น
    fs: {
      strict: true,
      allow: [
        path.resolve(__dirname, './src'),
        path.resolve(__dirname, './index.html'),
      ],
      // disallow เส้นทางขึ้นไปหา backend
      deny: [path.resolve(__dirname, '../backend')],
    },
  },
})
