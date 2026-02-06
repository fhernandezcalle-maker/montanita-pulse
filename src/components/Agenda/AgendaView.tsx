
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, List, Edit2, Trash2, Heart, MapPin } from 'lucide-react';
import { getSupabase } from '@/services/supabase';
import { SECTOR_INFO } from '@/constants';
import { Sector } from '@/types';
import { format, isToday, isTomorrow, addDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    start_at: string;
    end_at: string;
    sector_id: string;
    image_url?: string;
    interested_count: number;
    businesses?: {
        name: string;
        is_verified: boolean;
    };
}

export default function AgendaView() {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [likedEvents, setLikedEvents] = useState<string[]>([]);

    useEffect(() => {
        loadEvents();
        const saved = localStorage.getItem('montanita-liked-events');
        if (saved) setLikedEvents(JSON.parse(saved));
    }, []);

    const loadEvents = async () => {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('events')
            .select(`
                id, title, description, start_at, end_at, sector_id, image_url, interested_count,
                businesses (name, is_verified)
            `)
            .gte('start_at', new Date().toISOString())
            .order('start_at', { ascending: true })
            .limit(50);

        if (error) {
            console.error('Error loading events:', error);
        } else if (data) {
            // Map data to handle the businesses join properly
            const mapped = data.map((e: any) => ({
                ...e,
                businesses: Array.isArray(e.businesses) ? e.businesses[0] : e.businesses
            }));
            setEvents(mapped as TimelineEvent[]);
        }
        setLoading(false);
    };

    const toggleLike = async (eventId: string) => {
        const supabase = getSupabase();
        const isLiked = likedEvents.includes(eventId);

        // Update local state
        const newLiked = isLiked
            ? likedEvents.filter(id => id !== eventId)
            : [...likedEvents, eventId];
        setLikedEvents(newLiked);
        localStorage.setItem('montanita-liked-events', JSON.stringify(newLiked));

        // Update in database
        const event = events.find(e => e.id === eventId);
        if (event) {
            await supabase
                .from('events')
                .update({ interested_count: event.interested_count + (isLiked ? -1 : 1) })
                .eq('id', eventId);

            // Update local events
            setEvents(prev => prev.map(e =>
                e.id === eventId
                    ? { ...e, interested_count: e.interested_count + (isLiked ? -1 : 1) }
                    : e
            ));
        }
    };

    const groupEventsByDate = () => {
        const groups: { [key: string]: TimelineEvent[] } = {};
        events.forEach(event => {
            const dateKey = format(new Date(event.start_at), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(event);
        });
        return groups;
    };

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Hoy';
        if (isTomorrow(date)) return 'Mañana';
        return format(date, "EEEE d 'de' MMMM", { locale: es });
    };

    const groupedEvents = groupEventsByDate();

    return (
        <div className="space-y-6">
            {/* Header with View Toggle */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Agenda</h2>
                <div className="flex bg-slate-900/50 rounded-2xl p-1 border border-white/5">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'timeline'
                            ? 'bg-rose-500 text-white'
                            : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        Timeline
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'calendar'
                            ? 'bg-rose-500 text-white'
                            : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Calendario
                    </button>
                </div>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="space-y-8">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-slate-900/50 animate-pulse rounded-3xl" />
                            ))}
                        </div>
                    ) : Object.keys(groupedEvents).length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No hay eventos próximos</p>
                        </div>
                    ) : (
                        Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
                            <div key={dateKey} className="space-y-4">
                                {/* Date Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                        <span className="text-lg font-black text-rose-500">
                                            {format(new Date(dateKey), 'd')}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white capitalize">
                                            {getDateLabel(dateKey)}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            {dayEvents.length} evento{dayEvents.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Events for this date */}
                                <div className="pl-6 border-l-2 border-slate-800 space-y-4">
                                    {dayEvents.map((event, idx) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="relative pl-6"
                                        >
                                            {/* Timeline dot */}
                                            <div
                                                className="absolute left-0 top-4 w-3 h-3 rounded-full -translate-x-[7px] border-2 border-slate-900"
                                                style={{ backgroundColor: SECTOR_INFO[event.sector_id as Sector]?.color || '#f43f5e' }}
                                            />

                                            {/* Event Card */}
                                            <div className="bg-slate-900/50 rounded-3xl p-4 border border-white/5 hover:border-white/10 transition-all group">
                                                <div className="flex gap-4">
                                                    {/* Image */}
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
                                                        <img
                                                            src={event.image_url || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200`}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <h4 className="font-bold text-white truncate">{event.title}</h4>
                                                                {event.businesses && (
                                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                                        {event.businesses.name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => toggleLike(event.id)}
                                                                className={`p-2 rounded-xl transition-all ${likedEvents.includes(event.id)
                                                                    ? 'bg-rose-500/20 text-rose-500'
                                                                    : 'bg-white/5 text-slate-500 hover:text-rose-500'
                                                                    }`}
                                                            >
                                                                <Heart className={`w-4 h-4 ${likedEvents.includes(event.id) ? 'fill-current' : ''}`} />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {format(new Date(event.start_at), 'HH:mm')}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {SECTOR_INFO[event.sector_id as Sector]?.name || event.sector_id}
                                                            </span>
                                                            <span className="text-rose-500 font-bold">
                                                                ❤️ {event.interested_count + (likedEvents.includes(event.id) ? 1 : 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Calendar View - Import existing CalendarView */}
            {viewMode === 'calendar' && (
                <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5">
                    <p className="text-center text-slate-500 py-8">
                        El calendario completo está en la pestaña Calendario
                    </p>
                </div>
            )}
        </div>
    );
}
