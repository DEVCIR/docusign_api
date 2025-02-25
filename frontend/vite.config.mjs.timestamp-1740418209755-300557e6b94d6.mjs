// vite.config.mjs
import { defineConfig } from "file:///C:/Users/Muneeb/Desktop/docusign_api/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Muneeb/Desktop/docusign_api/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "node:path";
import autoprefixer from "file:///C:/Users/Muneeb/Desktop/docusign_api/frontend/node_modules/autoprefixer/lib/autoprefixer.js";
var __vite_injected_original_dirname = "C:\\Users\\Muneeb\\Desktop\\docusign_api\\frontend";
var vite_config_default = defineConfig(() => {
  return {
    base: "./",
    build: {
      outDir: "build"
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({})
          // add options if needed
        ]
      },
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ["import", "legacy-js-api"]
        }
      }
    },
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.jsx?$/,
      exclude: []
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          ".js": "jsx"
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: "src/",
          replacement: `${path.resolve(__vite_injected_original_dirname, "src")}/`
        }
        // Uncomment this if you need a custom alias for pdfjs-dist
        // {
        //   find: 'pdfjs-dist',
        //   replacement: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.mjs'),
        // },
      ],
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".scss"]
    },
    server: {
      port: 3e3,
      proxy: {
        // Proxy all requests starting with `/api` to Laravel's backend
        "/api": "http://localhost:8000",
        "/storage": "http://localhost:8000"
        // For proxying file storage if needed
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTXVuZWViXFxcXERlc2t0b3BcXFxcZG9jdXNpZ25fYXBpXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNdW5lZWJcXFxcRGVza3RvcFxcXFxkb2N1c2lnbl9hcGlcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9NdW5lZWIvRGVza3RvcC9kb2N1c2lnbl9hcGkvZnJvbnRlbmQvdml0ZS5jb25maWcubWpzXCI7Ly8gaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbi8vIGltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbi8vIGltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcbi8vIGltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJ1xuXG4vLyBleHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKCkgPT4ge1xuLy8gICByZXR1cm4ge1xuLy8gICAgIGJhc2U6ICcuLycsXG4vLyAgICAgYnVpbGQ6IHtcbi8vICAgICAgIG91dERpcjogJ2J1aWxkJyxcbi8vICAgICB9LFxuLy8gICAgIGNzczoge1xuLy8gICAgICAgcG9zdGNzczoge1xuLy8gICAgICAgICBwbHVnaW5zOiBbXG4vLyAgICAgICAgICAgYXV0b3ByZWZpeGVyKHt9KSwgLy8gYWRkIG9wdGlvbnMgaWYgbmVlZGVkXG4vLyAgICAgICAgIF0sXG4vLyAgICAgICB9LFxuLy8gICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuLy8gICAgICAgICBzY3NzOiB7XG4vLyAgICAgICAgICAgcXVpZXREZXBzOiB0cnVlLFxuLy8gICAgICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnaW1wb3J0JywgJ2xlZ2FjeS1qcy1hcGknXSxcbi8vICAgICAgICAgfSxcbi8vICAgICAgIH0sXG4vLyAgICAgfSxcbi8vICAgICBlc2J1aWxkOiB7XG4vLyAgICAgICBsb2FkZXI6ICdqc3gnLFxuLy8gICAgICAgaW5jbHVkZTogL3NyY1xcLy4qXFwuanN4PyQvLFxuLy8gICAgICAgZXhjbHVkZTogW10sXG4vLyAgICAgfSxcbi8vICAgICBvcHRpbWl6ZURlcHM6IHtcbi8vICAgICAgIGZvcmNlOiB0cnVlLFxuLy8gICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbi8vICAgICAgICAgbG9hZGVyOiB7XG4vLyAgICAgICAgICAgJy5qcyc6ICdqc3gnLFxuLy8gICAgICAgICB9LFxuLy8gICAgICAgfSxcbi8vICAgICB9LFxuLy8gICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbi8vICAgICAvLyByZXNvbHZlOiB7XG4vLyAgICAgLy8gICBhbGlhczogW1xuLy8gICAgIC8vICAgICB7XG4vLyAgICAgLy8gICAgICAgZmluZDogJ3NyYy8nLFxuLy8gICAgIC8vICAgICAgIHJlcGxhY2VtZW50OiBgJHtwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyl9L2AsXG4vLyAgICAgLy8gICAgIH0sXG4vLyAgICAgLy8gICBdLFxuLy8gICAgIC8vICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy5zY3NzJ10sXG4vLyAgICAgLy8gfSxcbi8vICAgICByZXNvbHZlOiB7XG4vLyAgICAgICBhbGlhczogW1xuLy8gICAgICAgICB7XG4vLyAgICAgICAgICAgZmluZDogJ3NyYy8nLFxuLy8gICAgICAgICAgIHJlcGxhY2VtZW50OiBgJHtwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyl9L2AsXG4vLyAgICAgICAgIH0sXG4vLyAgICAgICAgIC8vIHtcbi8vICAgICAgICAgLy8gICAvLyBBbGlhcyB0byBwZGYubWpzIGluc3RlYWQgb2YgcGRmLmpzXG4vLyAgICAgICAgIC8vICAgZmluZDogJ3BkZmpzLWRpc3QnLFxuLy8gICAgICAgICAvLyAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL3BkZmpzLWRpc3QvYnVpbGQvcGRmLm1qcycpLFxuLy8gICAgICAgICAvLyB9LFxuLy8gICAgICAgXSxcbi8vICAgICAgIGV4dGVuc2lvbnM6IFsnLm1qcycsICcuanMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcuc2NzcyddLFxuLy8gICAgIH0sXG4vLyAgICAgc2VydmVyOiB7XG4vLyAgICAgICBwb3J0OiAzMDAwLFxuLy8gICAgICAgcHJveHk6IHtcbi8vICAgICAgICAgLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9zZXJ2ZXItb3B0aW9ucy5odG1sXG4vLyAgICAgICB9LFxuLy8gICAgIH0sXG4vLyAgIH1cbi8vIH0pXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnXG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcidcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBiYXNlOiAnLi8nLFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6ICdidWlsZCcsXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIHBvc3Rjc3M6IHtcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgIGF1dG9wcmVmaXhlcih7fSksIC8vIGFkZCBvcHRpb25zIGlmIG5lZWRlZFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIHF1aWV0RGVwczogdHJ1ZSxcbiAgICAgICAgICBzaWxlbmNlRGVwcmVjYXRpb25zOiBbJ2ltcG9ydCcsICdsZWdhY3ktanMtYXBpJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZXNidWlsZDoge1xuICAgICAgbG9hZGVyOiAnanN4JyxcbiAgICAgIGluY2x1ZGU6IC9zcmNcXC8uKlxcLmpzeD8kLyxcbiAgICAgIGV4Y2x1ZGU6IFtdLFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBmb3JjZTogdHJ1ZSxcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIGxvYWRlcjoge1xuICAgICAgICAgICcuanMnOiAnanN4JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6ICdzcmMvJyxcbiAgICAgICAgICByZXBsYWNlbWVudDogYCR7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpfS9gLFxuICAgICAgICB9LFxuICAgICAgICAvLyBVbmNvbW1lbnQgdGhpcyBpZiB5b3UgbmVlZCBhIGN1c3RvbSBhbGlhcyBmb3IgcGRmanMtZGlzdFxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgZmluZDogJ3BkZmpzLWRpc3QnLFxuICAgICAgICAvLyAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL3BkZmpzLWRpc3QvYnVpbGQvcGRmLm1qcycpLFxuICAgICAgICAvLyB9LFxuICAgICAgXSxcbiAgICAgIGV4dGVuc2lvbnM6IFsnLm1qcycsICcuanMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcuc2NzcyddLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgLy8gUHJveHkgYWxsIHJlcXVlc3RzIHN0YXJ0aW5nIHdpdGggYC9hcGlgIHRvIExhcmF2ZWwncyBiYWNrZW5kXG4gICAgICAgICcvYXBpJzogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCcsXG4gICAgICAgICcvc3RvcmFnZSc6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLCAvLyBGb3IgcHJveHlpbmcgZmlsZSBzdG9yYWdlIGlmIG5lZWRlZFxuICAgICAgfSxcbiAgICB9LFxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQXNFQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sa0JBQWtCO0FBekV6QixJQUFNLG1DQUFtQztBQTJFekMsSUFBTyxzQkFBUSxhQUFhLE1BQU07QUFDaEMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNQLFNBQVM7QUFBQSxVQUNQLGFBQWEsQ0FBQyxDQUFDO0FBQUE7QUFBQSxRQUNqQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxVQUNKLFdBQVc7QUFBQSxVQUNYLHFCQUFxQixDQUFDLFVBQVUsZUFBZTtBQUFBLFFBQ2pEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFNBQVMsQ0FBQztBQUFBLElBQ1o7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLE9BQU87QUFBQSxNQUNQLGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFVBQ04sT0FBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixhQUFhLEdBQUcsS0FBSyxRQUFRLGtDQUFXLEtBQUssQ0FBQztBQUFBLFFBQ2hEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BTUY7QUFBQSxNQUNBLFlBQVksQ0FBQyxRQUFRLE9BQU8sT0FBTyxRQUFRLFFBQVEsU0FBUyxPQUFPO0FBQUEsSUFDckU7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQTtBQUFBLFFBRUwsUUFBUTtBQUFBLFFBQ1IsWUFBWTtBQUFBO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
