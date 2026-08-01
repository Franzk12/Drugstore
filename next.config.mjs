/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sitio 100% estático: `next build` genera la carpeta out/ (sin servidor).
  // Se puede hostear en Netlify, GitHub Pages, o cualquier hosting estático.
  output: "export",
  images: {
    unoptimized: true,
  },
}

export default nextConfig
