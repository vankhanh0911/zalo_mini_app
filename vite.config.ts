import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    server: { https: true },
    root: './src',
    base: '',
    plugins: [reactRefresh(),{
      name: 'override-config', // Plugin tùy chỉnh để đặt target esnext
      config: () => ({
        build: {
          target: 'esnext', // Đặt target là esnext để hỗ trợ các tính năng hiện đại
        },
      }),
    },],
  })
}
