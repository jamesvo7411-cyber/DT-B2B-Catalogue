# DT B2B Catalogue

## Local development

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev -- --host
```

## GitHub Pages

The `Deploy to GitHub Pages` workflow builds and deploys the site when changes
are pushed to `main`. In the repository settings, open **Pages** and set
**Build and deployment** → **Source** to **GitHub Actions**. The first
deployment will then publish the site at:

`https://jamesvo7411-cyber.github.io/DT-B2B-Catalogue/`

The build automatically uses the repository subpath on GitHub Pages. Images in
`public/` are included in the deployment; `DT_CATALOGUE_IMAGE_DIR` is only a
local development override.
