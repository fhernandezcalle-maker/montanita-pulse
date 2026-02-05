
'use client';

import React from 'react';
import { MontanitaEvent, Sector } from '@/types';
import { SECTOR_INFO } from '@/constants';
import { motion } from 'framer-motion';
import { Heart, Check, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventListProps {
    events: MontanitaEvent[];
    rsvped: string[];
    onToggleRSVP: (id: string) => void;
    loading: boolean;
}

export default function EventList({ events, rsvped, onToggleRSVP, loading }: EventListProps) {
    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-900/50 animate-pulse rounded-3xl border border-white/5" />
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No hay eventos en este sector</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {events.map((event, idx) => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-slate-900/40 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/10 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-lg">
                                <img
                                    src={event.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400'}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-base text-white">{event.title}</h4>
                                {event.interested_count > 10 && (
                                    <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        🔥 Top
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(event.start_at), "HH:mm 'hs'", { locale: es })}
                                </div>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest">
                                    {event.interested_count + (rsvped.includes(event.id) ? 1 : 0)} asistiendo
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onToggleRSVP(event.id)}
                        className={`p-3 rounded-2xl transition-all ${rsvped.includes(event.id) ? 'bg-rose-500/20 active:scale-90' : 'bg-white/5 hover:bg-white/10 active:scale-95'}`}
                    >
                        <Heart className={`w-5 h-5 transition-colors ${rsvped.includes(event.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-500'}`} />
                    </button>
                </motion.div>
            ))}
        </div>
    );
}
