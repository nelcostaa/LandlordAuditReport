/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración vacía de Turbopack para silenciar warning
  turbopack: {},
  
  // TEMPORAL: Deshabilitar minification para ver error completo
  swcMinify: false,
  
  // Deshabilitar optimización de producción para debugging
  productionBrowserSourceMaps: true,
  
  compiler: {
    removeConsole: false,
  },
  
  // Aumentar el límite de tamaño de la función para PDFs
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

// Force deployment trigger
export default nextConfig;

