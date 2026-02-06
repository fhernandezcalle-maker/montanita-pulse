
import { Sector } from '@/types';

export const SECTOR_INFO = {
    [Sector.CENTRO]: {
        name: 'Centro',
        color: '#f43f5e', // Rose 500
        description: 'Vida nocturna y Calle de los Cócteles',
        icon: '🔥',
        center: [-80.7533, -1.8265]
    },
    [Sector.LA_PUNTA]: {
        name: 'La Punta',
        color: '#06b6d4', // Cyan 500
        description: 'Surf, atardeceres y ambiente chill',
        icon: '🏄',
        center: [-80.7590, -1.8210]
    },
    [Sector.TIGRILLO]: {
        name: 'El Tigrillo',
        color: '#10b981', // Emerald 500
        description: 'Yoga, bienestar y zona de silencio',
        icon: '🧘',
        center: [-80.7522, -1.8270]
    },
    [Sector.MALECON]: {
        name: 'Malecón',
        color: '#f59e0b', // Amber 500
        description: 'Eventos públicos y ferias culturales',
        icon: '🏖️',
        center: [-80.7560, -1.8265]
    }
};


export const MONTANITA_CENTER = {
    lat: -1.8250,
    lng: -80.7530,
    zoom: 15
};

export const SECTOR_POLYGONS = {
    [Sector.CENTRO]: [
        [-80.7555, -1.8285],
        [-80.7555, -1.8245],
        [-80.7515, -1.8245],
        [-80.7515, -1.8285],
        [-80.7555, -1.8285] // Close the polygon
    ],
    [Sector.LA_PUNTA]: [
        [-80.7620, -1.8240],
        [-80.7620, -1.8180],
        [-80.7560, -1.8180],
        [-80.7560, -1.8240],
        [-80.7620, -1.8240]
    ],
    [Sector.TIGRILLO]: [
        [-80.7545, -1.8290],
        [-80.7545, -1.8250],
        [-80.7500, -1.8250],
        [-80.7500, -1.8290],
        [-80.7545, -1.8290]
    ],
    [Sector.MALECON]: [
        [-80.7565, -1.8285],
        [-80.7565, -1.8245],
        [-80.7555, -1.8245],
        [-80.7555, -1.8285],
        [-80.7565, -1.8285]
    ]
};

