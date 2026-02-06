
'use client';

import React from 'react';
import { MontanitaEvent } from '@/types';
import EventList from '@/components/Events/EventList';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface FavoritesViewProps {
    events: MontanitaEvent[];
    rsvpedIds: string[];
    onToggleRSVP: (id: string) => void;
    loading: boolean;
}

export default function FavoritesView({ events, rsvpedIds, onToggleRSVP, loading }: FavoritesViewProps) {
    const favoriteEvents = events.filter(e => rsvpedIds.includes(e.id));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-rose-500/10 rounded-2xl">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black">Mis Favoritos</h2>
                    <p className="text-slate-500 text-sm">Eventos que no te quieres perder</p>
                </div>
            </div>

            {favoriteEvents.length === 0 && !loading ? (
                <div className="py-20 text-center bg-slate-900/40 rounded-[40px] border border-dashed border-slate-800">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-bold">Aún no tienes favoritos</p>
                    <p className="text-slate-600 text-xs mt-1">Explora el mapa y guarda los mejores planes</p>
                </div>
            ) : (
                <EventList
                    events={favoriteEvents}
                    rsvped={rsvpedIds}
                    onToggleRSVP={onToggleRSVP}
                    loading={loading}
                />
            )}
        </div>
    );
}
