
export enum Sector {
    CENTRO = 'centro',
    LA_PUNTA = 'la-punta',
    TIGRILLO = 'tigrillo',
    MALECON = 'malecon'
}

export interface Category {
    id: string;
    name: string;
    icon: string;
}

export interface Business {
    id: string;
    name: string;
    description: string;
    sector_id: Sector;
    category_id: string;
    location: {
        lat: number;
        lng: number;
    };
    address: string;
    is_verified: boolean;
    image_url: string;
    owner_id: string;
    contact_info: {
        phone?: string;
        whatsapp?: string;
        instagram?: string;
        website?: string;
    };
}

export interface MontanitaEvent {
    id: string;
    business_id: string;
    title: string;
    description: string;
    image_url: string;
    category_id: string;
    vibe_tags: string[];
    start_at: Date;
    end_at: Date;
    is_recurring: boolean;
    rrule?: string;
    interested_count: number;
    businesses?: {
        name: string;
        is_verified: boolean;
        image_url: string;
    };
}

export type Vibe = 'Adrenalina' | 'Relax' | 'Techno' | 'Familia' | 'Wellness' | 'Fiesta';
