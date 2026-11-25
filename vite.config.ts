import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function localCatalogueImagesPlugin(imageDirectory: string) {
  return {
    name: 'local-catalogue-images',
    apply: 'serve' as const,
    configureServer(server: import('vite').ViteDevServer) {
      if (!imageDirectory) {
        console.warn(
          'Local catalogue images are disabled. Set DT_CATALOGUE_IMAGE_DIR in .env.local.'
        );
        return;
      }

      if (!fs.existsSync(imageDirectory)) {
        throw new Error(
          `Catalogue image directory does not exist: ${imageDirectory}`
        );
      }

      const imageRoot = fs.realpathSync(imageDirectory);
      const mimeTypes: Record<string, string> = {
        '.avif': 'image/avif',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      };

      server.middlewares.use('/catalogue-media', (request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          next();
          return;
        }

        let requestedName: string;
        try {
          requestedName = decodeURIComponent(
            (request.url ?? '').split('?')[0].replace(/^\/+/, '')
          );
        } catch {
          response.statusCode = 400;
          response.end('Invalid image path');
          return;
        }

        if (!requestedName || path.basename(requestedName) !== requestedName) {
          response.statusCode = 404;
          response.end('Image not found');
          return;
        }

        const extension = path.extname(requestedName).toLowerCase();
        const mimeType = mimeTypes[extension];
        if (!mimeType) {
          response.statusCode = 404;
          response.end('Image not found');
          return;
        }

        const candidate = path.join(imageRoot, requestedName);
        let imagePath: string;
        let stat: fs.Stats;
        try {
          imagePath = fs.realpathSync(candidate);
          stat = fs.statSync(imagePath);
        } catch {
          response.statusCode = 404;
          response.end('Image not found');
          return;
        }

        if (path.dirname(imagePath) !== imageRoot || !stat.isFile()) {
          response.statusCode = 404;
          response.end('Image not found');
          return;
        }

        response.statusCode = 200;
        response.setHeader('Content-Type', mimeType);
        response.setHeader('Content-Length', stat.size);
        response.setHeader('Cache-Control', 'no-cache');
        if (request.method === 'HEAD') {
          response.end();
          return;
        }

        fs.createReadStream(imagePath)
          .on('error', (error) => {
            server.config.logger.error(
              `Could not read catalogue image ${requestedName}: ${error.message}`
            );
            if (!response.headersSent) response.statusCode = 500;
            response.end('Could not read local image');
          })
          .pipe(response);
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const bundledImageDirectory = path.resolve(
    process.cwd(),
    'public/catalogue-media'
  );
  const imageDirectory = env.DT_CATALOGUE_IMAGE_DIR
    ? path.resolve(env.DT_CATALOGUE_IMAGE_DIR)
    : fs.existsSync(bundledImageDirectory)
      ? bundledImageDirectory
      : '';
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base =
    process.env.GITHUB_ACTIONS === 'true' && repositoryName
      ? `/${repositoryName}/`
      : '/';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      localCatalogueImagesPlugin(imageDirectory),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
