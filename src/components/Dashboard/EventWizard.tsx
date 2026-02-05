
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, MapPin, Clock, Tag, Check, ChevronRight, Loader2 } from 'lucide-react';
import { getSupabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';

export default function EventWizard() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Música');
    const [frequency, setFrequency] = useState('No');
    const [days, setDays] = useState<number[]>([]);

    const handlePublish = async () => {
        if (!user) return;
        setLoading(true);

        const supabase = getSupabase();

        try {
            // 1. First find or create a business for this host if they don't have one
            // For now, we'll try to find a business owned by this user
            let { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            // If no business, create a dummy one for the host 
            // (In a real app, they would have created this first)
            if (!business) {
                const { data: newBus, error: busError } = await supabase
                    .from('businesses')
                    .insert({
                        name: 'Mi Local',
                        sector_id: 'centro',
                        category_id: 'bar',
                        location_lat: -1.8265,
                        location_lng: -80.7533,
                        owner_id: user.id
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
                        description: `Evento de local ${title}`,
                        start_at: new Date().toISOString(),
                        end_at: new Date(Date.now() + 3600000 * 4).toISOString(), // +4 hours
                        category_id: category.toLowerCase(),
                        is_recurring: frequency !== 'No',
                        sector_id: 'centro'
                    });

                if (eventError) throw eventError;

                // Success! 
                setStep(3);
            }
        } catch (error) {
            console.error('Error publishing event:', error);
            alert('Error al publicar el evento. Revisa la consola.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 rounded-3xl p-8 border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black">Crear Evento</h2>
                    <p className="text-slate-500 text-sm">Paso {step} de 3</p>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-rose-500' : 'bg-slate-800'}`} />
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
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Título del Evento</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej. Techno Sunset Session"
                                className="w-full bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-rose-500 transition-all text-white"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Categoría</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Música', 'Deportes', 'Cultura', 'Bienestar'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`p-4 rounded-2xl text-left transition-all font-bold ${category === cat ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="aspect-video bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-rose-500/50 transition-all">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Image className="w-6 h-6 text-slate-500" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Subir Cover del Evento</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Repetición</label>
                            <div className="flex gap-2">
                                {['No', 'Diario', 'Semanal'].map(freq => (
                                    <button
                                        key={freq}
                                        onClick={() => setFrequency(freq)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${frequency === freq ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        {freq}
                                    </button>
                                ))}
                            </div>
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
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">¡Evento Publicado!</h3>
                        <p className="text-slate-500 max-w-[240px]">Tu evento ya es visible para toda la comunidad en Montañita.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-8 text-rose-500 font-bold hover:underline"
                        >
                            Ver en el Calendario
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {step < 3 && (
                <div className="mt-12 flex justify-between items-center">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        className={`text-slate-500 font-bold hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        Atrás
                    </button>
                    <button
                        onClick={() => step === 2 ? handlePublish() : setStep(2)}
                        disabled={loading}
                        className="bg-rose-500 hover:bg-rose-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {step === 2 ? 'Publicar Evento' : 'Continuar'}
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
