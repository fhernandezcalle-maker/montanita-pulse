
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, Users, Calendar, Edit3, Trash2, Camera, Check, X, Loader2 } from 'lucide-react';
import { getSupabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { SECTOR_INFO } from '@/constants';
import { Sector } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventPublication {
    id: string;
    title: string;
    description: string;
    start_at: string;
    end_at: string;
    interested_count: number;
    image_url: string;
    sector_id: string;
    is_recurring: boolean;
}

interface BusinessDashboardProps {
    onCreateEvent: () => void;
}

export default function BusinessDashboard({ onCreateEvent }: BusinessDashboardProps) {
    const { user } = useAuth();
    const [publications, setPublications] = useState<EventPublication[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ rsvps: 0, events: 0 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    async function loadDashboardData() {
        if (!user) {
            setLoading(false);
            return;
        }

        const supabase = getSupabase();

        // Get business of the user
        const { data: business } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (!business) {
            setLoading(false);
            return;
        }

        // Get events for this business
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .eq('business_id', business.id)
            .order('start_at', { ascending: false });

        if (error) {
            console.error('Error loading events:', error);
        } else if (events) {
            setPublications(events);
            const totalRsvps = events.reduce((acc, e) => acc + (e.interested_count || 0), 0);
            setStats({ rsvps: totalRsvps, events: events.length });
        }
        setLoading(false);
    }

    const handleEdit = (event: EventPublication) => {
        setEditingId(event.id);
        setEditTitle(event.title);
        setEditDescription(event.description || '');
    };

    const handleSave = async () => {
        if (!editingId) return;
        setSaving(true);

        const supabase = getSupabase();
        const { error } = await supabase
            .from('events')
            .update({
                title: editTitle,
                description: editDescription
            })
            .eq('id', editingId);

        if (error) {
            alert('Error al guardar: ' + error.message);
        } else {
            setPublications(prev => prev.map(p =>
                p.id === editingId
                    ? { ...p, title: editTitle, description: editDescription }
                    : p
            ));
            setEditingId(null);
        }
        setSaving(false);
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm('¿Eliminar este evento?')) return;

        const supabase = getSupabase();
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            setPublications(prev => prev.filter(p => p.id !== eventId));
            setStats(prev => ({ ...prev, events: prev.events - 1 }));
        }
    };

    const handleImageUpload = async (eventId: string, file: File) => {
        setUploadingId(eventId);
        const supabase = getSupabase();

        const fileExt = file.name.split('.').pop();
        const fileName = `event-${eventId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(fileName, file);

        if (uploadError) {
            // If bucket doesn't exist, use a placeholder
            console.error('Upload error:', uploadError);
            alert('Error subiendo imagen. Verifica que el bucket "event-images" existe en Supabase Storage.');
            setUploadingId(null);
            return;
        }

        const { data: urlData } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName);

        const { error: updateError } = await supabase
            .from('events')
            .update({ image_url: urlData.publicUrl })
            .eq('id', eventId);

        if (!updateError) {
            setPublications(prev => prev.map(p =>
                p.id === eventId ? { ...p, image_url: urlData.publicUrl } : p
            ));
        }
        setUploadingId(null);
    };

    const getStatusBadge = (event: EventPublication) => {
        const now = new Date();
        const start = new Date(event.start_at);
        const end = new Date(event.end_at);

        if (now > end) return { label: 'Terminado', color: 'bg-slate-500' };
        if (now >= start && now <= end) return { label: 'En vivo', color: 'bg-emerald-500' };
        return { label: 'Próximo', color: 'bg-amber-500' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        );
    }

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
                        <Calendar className="w-5 h-5 text-cyan-500" />
                    </div>
                    <p className="text-2xl font-black">{stats.events}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Eventos</p>
                </div>
            </div>

            {/* Create New Button */}
            <button
                onClick={onCreateEvent}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/20"
            >
                <Plus className="w-5 h-5" />
                Crear Nuevo Evento
            </button>

            {/* Events List */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Mis Publicaciones ({publications.length})
                </h3>

                {publications.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                        <p className="text-slate-500 text-sm">Aún no tienes eventos publicados</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {publications.map((event, idx) => {
                            const status = getStatusBadge(event);
                            const isEditing = editingId === event.id;

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all"
                                >
                                    <div className="flex">
                                        {/* Event Image */}
                                        <div className="relative w-28 h-28 flex-shrink-0 group">
                                            <img
                                                src={event.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                {uploadingId === event.id ? (
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                ) : (
                                                    <Camera className="w-6 h-6 text-white" />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload(event.id, file);
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Event Details */}
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                                                    />
                                                    <textarea
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        rows={2}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white resize-none"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white truncate">{event.title}</h4>
                                                        {event.is_recurring && (
                                                            <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-500 px-2 py-0.5 rounded-full">
                                                                🔄
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">
                                                        {format(new Date(event.start_at), "d MMM 'a las' HH:mm", { locale: es })}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] text-rose-500 font-bold">
                                                    ❤️ {event.interested_count} interesados
                                                </span>

                                                <div className="flex gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={handleSave}
                                                                disabled={saving}
                                                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                                            >
                                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(event)}
                                                                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(event.id)}
                                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
