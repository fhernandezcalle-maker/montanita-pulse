
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Montañita Pulse',
        short_name: 'Pulse',
        description: 'La vibra de Montañita en tu bolsillo. Eventos, surf y fiesta.',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#f43f5e',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
