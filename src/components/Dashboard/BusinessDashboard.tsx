
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Users, Calendar, MoreVertical, Edit3, Loader2 } from 'lucide-react';
import { getSupabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';

interface Publication {
    id: string;
    title: string;
    date: string;
    rsvps: number;
    views: number;
    status: 'active' | 'scheduled' | 'ended';
    image: string;
}

interface BusinessDashboardProps {
    onCreateEvent: () => void;
}

export default function BusinessDashboard({ onCreateEvent }: BusinessDashboardProps) {
    const { user } = useAuth();
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ rsvps: 0, views: 0 });

    useEffect(() => {
        if (!user) return;

        async function loadDashboardData() {
            const supabase = getSupabase();

            // 1. Get business of the user
            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user?.id)
                .single();

            if (!business) {
                setLoading(false);
                return;
            }

            // 2. Get events for this business
            const { data: events, error } = await supabase
                .from('events')
                .select('*')
                .eq('business_id', business.id)
                .order('start_at', { ascending: false });

            if (error) {
                console.error('Error loading dashboard events:', error);
            } else if (events) {
                const formattedPubs = events.map(event => ({
                    id: event.id,
                    title: event.title,
                    date: new Date(event.start_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                    rsvps: event.interested_count || 0,
                    views: Math.floor(Math.random() * 500) + 100, // Dummy views for now
                    status: new Date(event.end_at) < new Date() ? 'ended' :
                        new Date(event.start_at) <= new Date() ? 'active' : 'scheduled',
                    image: event.image_url || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=400'
                })) as Publication[];

                setPublications(formattedPubs);

                // Calculate stats
                const totalRsvps = formattedPubs.reduce((acc, p) => acc + p.rsvps, 0);
                const totalViews = formattedPubs.reduce((acc, p) => acc + p.views, 0);
                setStats({ rsvps: totalRsvps, views: totalViews });
            }
            setLoading(false);
        }

        loadDashboardData();
    }, [user]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-2xl font-black">{stats.rsvps}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">RSVPs Totales</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                        <Eye className="w-5 h-5 text-cyan-500" />
                    </div>
                    <p className="text-2xl font-black">{(stats.views / 1000).toFixed(1)}k</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Visitas</p>
                </div>
            </div>

            {/* Header & Action */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black">Mis Publicaciones</h2>
                    <p className="text-slate-500 text-xs">Gestiona tus eventos en vivo</p>
                </div>
                <button
                    onClick={onCreateEvent}
                    className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl shadow-white/5 active:scale-90 transition-all"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* Publications List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                    </div>
                ) : publications.length === 0 ? (
                    <div className="py-12 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                        <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 text-sm font-bold">No has publicado eventos aún.</p>
                        <button onClick={onCreateEvent} className="text-rose-500 text-xs mt-2 hover:underline">¡Crea tu primer evento ahora!</button>
                    </div>
                ) : (
                    publications.map((pub, i) => (
                        <motion.div
                            key={pub.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-900/80 border border-white/5 rounded-3xl p-4 flex gap-4 items-center group relative overflow-hidden"
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800 border border-white/5">
                                <img src={pub.image} alt={pub.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-2 h-2 rounded-full ${pub.status === 'active' ? 'bg-emerald-500 animate-pulse' : pub.status === 'scheduled' ? 'bg-amber-500' : 'bg-slate-600'}`} />
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                        {pub.status === 'active' ? 'En Vivo' : pub.status === 'scheduled' ? 'Programado' : 'Finalizado'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm truncate pr-8">{pub.title}</h3>
                                <div className="flex items-center gap-3 mt-2 text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[10px] whitespace-nowrap">{pub.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-rose-500">
                                        <Users className="w-3 h-3" />
                                        <span className="text-[10px] font-black">{pub.rsvps}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <MoreVertical className="w-5 h-5 text-slate-500" />
                            </button>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Hint */}
            <div className="p-6 bg-gradient-to-tr from-rose-500/10 to-amber-500/10 border border-rose-500/10 rounded-3xl">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-2 text-rose-500">
                    <Edit3 className="w-4 h-4" />
                    Tip del Día
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                    Las publicaciones con fotos reales de tu local tienen un 40% más de interés. ¡Sube una hoy!
                </p>
            </div>
        </div>
    );
}
