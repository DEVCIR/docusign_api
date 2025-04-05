// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'node:path'
// import autoprefixer from 'autoprefixer'

// export default defineConfig(() => {
//   return {
//     base: './',
//     build: {
//       outDir: 'build',
//     },
//     css: {
//       postcss: {
//         plugins: [
//           autoprefixer({}), // add options if needed
//         ],
//       },
//       preprocessorOptions: {
//         scss: {
//           quietDeps: true,
//           silenceDeprecations: ['import', 'legacy-js-api'],
//         },
//       },
//     },
//     esbuild: {
//       loader: 'jsx',
//       include: /src\/.*\.jsx?$/,
//       exclude: [],
//     },
//     optimizeDeps: {
//       force: true,
//       esbuildOptions: {
//         loader: {
//           '.js': 'jsx',
//         },
//       },
//     },
//     plugins: [react()],
//     // resolve: {
//     //   alias: [
//     //     {
//     //       find: 'src/',
//     //       replacement: `${path.resolve(__dirname, 'src')}/`,
//     //     },
//     //   ],
//     //   extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
//     // },
//     resolve: {
//       alias: [
//         {
//           find: 'src/',
//           replacement: `${path.resolve(__dirname, 'src')}/`,
//         },
//         // {
//         //   // Alias to pdf.mjs instead of pdf.js
//         //   find: 'pdfjs-dist',
//         //   replacement: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.mjs'),
//         // },
//       ],
//       extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
//     },
//     server: {
//       port: 3000,
//       proxy: {
//         // https://vitejs.dev/config/server-options.html
//       },
//     },
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    // base: './',
    base: '/',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import', 'legacy-js-api'],
        },
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
        // Uncomment this if you need a custom alias for pdfjs-dist
        // {
        //   find: 'pdfjs-dist',
        //   replacement: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.mjs'),
        // },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 3000,
      proxy: {
        // Proxy all requests starting with `/api` to Laravel's backend
        '/api': 'http://localhost:8000',
        '/storage': 'http://localhost:8000', // For proxying file storage if needed
      },
    },
  }
})
