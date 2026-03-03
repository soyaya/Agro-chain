import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Debridger | Bridging Farmers to Sellers',
    short_name: 'Debridger',
    description: 'Connect international buyers with verified Nigerian farmers for premium crops.',
    start_url: '/dashboard',           // as requested
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',            // emerald-500 – agriculture feel
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}