import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages는 https://<user>.github.io/Diet-Manager/ 하위 경로로 서빙되므로
// 빌드 시에만 base 를 저장소 이름으로 설정한다. (로컬 dev 는 루트 '/')
const REPO_BASE = '/Diet-Manager/'

export default defineConfig(({ command }) => {
  const base = command === 'build' ? REPO_BASE : '/'
  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: '식단관리',
          short_name: '식단관리',
          description: '개인 식단 관리 앱 - 칼로리/영양소 기록',
          theme_color: '#059669',
          background_color: '#030712',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          icons: [
            { src: 'icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
          ],
        },
      }),
    ],
  }
})
