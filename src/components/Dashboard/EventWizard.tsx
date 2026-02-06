
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Clock, Check, ChevronRight, Loader2 } from 'lucide-react';
import { getSupabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { Sector } from '@/types';
import { SECTOR_INFO, MONTANITA_CENTER } from '@/constants';

export default function EventWizard() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const [selectedSector, setSelectedSector] = useState<Sector>(Sector.CENTRO);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Música');
    const [frequency, setFrequency] = useState('No');
    const [selectedVibe, setSelectedVibe] = useState('Fiesta');

    const handlePublish = async () => {
        if (!user) return;
        setLoading(true);

        const supabase = getSupabase();

        try {
            // 1. Find or create a business for this host in the selected sector
            let { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .eq('sector_id', selectedSector)
                .maybeSingle();

            if (!business) {
                const { data: newBus, error: busError } = await supabase
                    .from('businesses')
                    .insert({
                        name: `Local de ${user.email?.split('@')[0]}`,
                        sector_id: selectedSector,
                        category_id: category.toLowerCase(),
                        location_lat: SECTOR_INFO[selectedSector].center?.[1] || MONTANITA_CENTER.lat,
                        location_lng: SECTOR_INFO[selectedSector].center?.[0] || MONTANITA_CENTER.lng,
                        owner_id: user.id,
                        address: SECTOR_INFO[selectedSector].name,
                        description: `Un rincón vibra en ${SECTOR_INFO[selectedSector].name}`
                    })
                    .select()
                    .single();

                if (busError) throw busError;
                business = newBus;
            }

            // 2. Insert the event
            if (business && business.id) {
                const { error: eventError } = await supabase
                    .from('events')
                    .insert({
                        business_id: business.id,
                        title: title,
                        description: `Evento de ${selectedVibe} en Montañita`,
                        start_at: new Date().toISOString(),
                        end_at: new Date(Date.now() + 3600000 * 4).toISOString(), // +4 hours
                        category_id: category.toLowerCase(),
                        vibe_tags: [selectedVibe],
                        is_recurring: frequency !== 'No',
                        sector_id: selectedSector,
                        interested_count: 0
                    });

                if (eventError) throw eventError;
                setStep(3);
            }
        } catch (error) {
            console.error('Error publishing event:', error);
            alert('Error al publicar el evento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 rounded-[40px] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-amber-500 opacity-50" />

            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter">Crear Evento</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Paso {step} de 3</p>
                </div>
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-10 h-1.5 rounded-full transition-all duration-700 ${step >= s ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-800'}`} />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">¿Dónde es el evento?</label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(SECTOR_INFO).map(([id, info]) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedSector(id as Sector)}
                                        className={`p-4 rounded-3xl text-left transition-all border-2 ${selectedSector === id ? 'bg-white/5 border-rose-500 shadow-lg shadow-rose-500/10' : 'bg-slate-800/50 border-transparent hover:bg-slate-800'}`}
                                    >
                                        <span className="text-xl mb-2 block">{info.icon}</span>
                                        <span className={`font-bold block text-sm ${selectedSector === id ? 'text-white' : 'text-slate-400'}`}>{info.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Título del Evento</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej. Techno Sunset Session"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-3xl p-5 focus:ring-2 focus:ring-rose-500/50 transition-all text-white font-bold placeholder:text-slate-600 outline-none"
                            />
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">¿Qué vibra tiene?</label>
                            <div className="flex flex-wrap gap-2">
                                {['Fiesta', 'Techno', 'Relax', 'Surf', 'Wellness', 'Cultura'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setSelectedVibe(v)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedVibe === v ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Categoría principal</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Música', 'Deportes', 'Cultura', 'Bienestar'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`p-4 rounded-3xl text-left transition-all font-bold text-sm ${category === cat ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="aspect-video bg-slate-800/50 rounded-[32px] border-4 border-dashed border-slate-700/50 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-rose-500/30 transition-all">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Image className="w-6 h-6 text-slate-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subir Flyer</p>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8">
                            <Check className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-black mb-3">¡Vibra Publicada!</h3>
                        <p className="text-slate-500 max-w-[280px] text-sm leading-relaxed">Tu evento ya está en el mapa y la agenda de Montañita Pulse.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-10 bg-white text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                        >
                            Ver en el Mapa
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {step < 3 && (
                <div className="mt-12 flex justify-between items-center">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        className={`text-slate-500 font-bold hover:text-white transition-colors uppercase text-[10px] tracking-widest ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        Atrás
                    </button>
                    <button
                        onClick={() => step === 2 ? handlePublish() : setStep(2)}
                        disabled={loading}
                        className="bg-rose-500 hover:bg-rose-600 px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                {step === 2 ? 'Publicar Ahora' : 'Siguiente'}
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
