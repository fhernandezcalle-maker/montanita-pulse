
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Store, Camera, Edit2, Trash2, Save, X, LogOut, Check } from 'lucide-react';
import { getSupabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { SECTOR_INFO } from '@/constants';
import { Sector } from '@/types';

type UserType = 'visitor' | 'business';

interface BusinessProfile {
    id: string;
    name: string;
    description: string;
    sector_id: string;
    category_id: string;
    image_url: string;
    address: string;
    is_verified: boolean;
}

export default function ProfileView() {
    const { user, signOut } = useAuth();
    const [userType, setUserType] = useState<UserType>('visitor');
    const [business, setBusiness] = useState<BusinessProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editSector, setEditSector] = useState<Sector>(Sector.CENTRO);
    const [editCategory, setEditCategory] = useState('bar');
    const [editAddress, setEditAddress] = useState('');

    useEffect(() => {
        if (user) {
            loadProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (data) {
            setBusiness(data);
            setUserType('business');
            setEditName(data.name);
            setEditDescription(data.description || '');
            setEditSector(data.sector_id as Sector);
            setEditCategory(data.category_id || 'bar');
            setEditAddress(data.address || '');
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!user || !business) return;
        setSaving(true);

        const supabase = getSupabase();
        const { error } = await supabase
            .from('businesses')
            .update({
                name: editName,
                description: editDescription,
                sector_id: editSector,
                category_id: editCategory,
                address: editAddress
            })
            .eq('id', business.id);

        if (error) {
            alert('Error al guardar: ' + error.message);
        } else {
            setBusiness({
                ...business,
                name: editName,
                description: editDescription,
                sector_id: editSector,
                category_id: editCategory,
                address: editAddress
            });
            setIsEditing(false);
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!user || !business) return;

        if (!confirm('¿Estás seguro de que quieres eliminar tu negocio? Esta acción no se puede deshacer.')) {
            return;
        }

        const supabase = getSupabase();
        const { error } = await supabase
            .from('businesses')
            .delete()
            .eq('id', business.id);

        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            setBusiness(null);
            setUserType('visitor');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !business) return;

        const supabase = getSupabase();
        const fileExt = file.name.split('.').pop();
        const fileName = `${business.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('business-images')
            .upload(fileName, file);

        if (uploadError) {
            alert('Error subiendo imagen: ' + uploadError.message);
            return;
        }

        const { data: urlData } = supabase.storage
            .from('business-images')
            .getPublicUrl(fileName);

        const { error: updateError } = await supabase
            .from('businesses')
            .update({ image_url: urlData.publicUrl })
            .eq('id', business.id);

        if (!updateError) {
            setBusiness({ ...business, image_url: urlData.publicUrl });
        }
    };

    const createBusinessProfile = async () => {
        if (!user) return;
        setLoading(true);

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('businesses')
            .insert({
                name: 'Mi Negocio',
                description: 'Descripción de mi negocio',
                sector_id: Sector.CENTRO,
                category_id: 'bar',
                owner_id: user.id,
                address: 'Montañita'
            })
            .select()
            .single();

        if (error) {
            alert('Error creando perfil: ' + error.message);
        } else {
            setBusiness(data);
            setUserType('business');
            setEditName(data.name);
            setEditDescription(data.description);
            setEditSector(data.sector_id);
            setEditCategory(data.category_id);
            setEditAddress(data.address);
            setIsEditing(true);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Inicia sesión para ver tu perfil
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* User Type Selector */}
            <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                    Tipo de cuenta
                </h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setUserType('visitor')}
                        className={`flex-1 p-4 rounded-2xl border-2 transition-all ${userType === 'visitor'
                                ? 'border-rose-500 bg-rose-500/10'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                    >
                        <User className={`w-8 h-8 mx-auto mb-2 ${userType === 'visitor' ? 'text-rose-500' : 'text-slate-500'}`} />
                        <p className={`font-bold ${userType === 'visitor' ? 'text-white' : 'text-slate-500'}`}>Visitante</p>
                        <p className="text-[10px] text-slate-500 mt-1">Explorar eventos y lugares</p>
                    </button>
                    <button
                        onClick={() => {
                            if (!business) {
                                createBusinessProfile();
                            } else {
                                setUserType('business');
                            }
                        }}
                        className={`flex-1 p-4 rounded-2xl border-2 transition-all ${userType === 'business'
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                    >
                        <Store className={`w-8 h-8 mx-auto mb-2 ${userType === 'business' ? 'text-cyan-500' : 'text-slate-500'}`} />
                        <p className={`font-bold ${userType === 'business' ? 'text-white' : 'text-slate-500'}`}>Negocio</p>
                        <p className="text-[10px] text-slate-500 mt-1">Publicar eventos y promociones</p>
                    </button>
                </div>
            </div>

            {/* Business Profile */}
            {userType === 'business' && business && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 rounded-3xl p-6 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Mi Negocio
                        </h3>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-all"
                                    >
                                        {saving ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Business Image */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-800 mb-6 group">
                        <img
                            src={business.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800'}
                            alt={business.name}
                            className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="w-8 h-8 text-white" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                        {business.is_verified && (
                            <div className="absolute top-4 right-4 bg-cyan-500 rounded-full p-1.5">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Business Details */}
                    <div className="space-y-4">
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Nombre del negocio"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                                />
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Descripción"
                                    rows={3}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white resize-none"
                                />
                                <select
                                    value={editSector}
                                    onChange={(e) => setEditSector(e.target.value as Sector)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                                >
                                    {Object.entries(SECTOR_INFO).map(([id, info]) => (
                                        <option key={id} value={id}>{info.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    placeholder="Dirección"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                                />
                            </>
                        ) : (
                            <>
                                <div>
                                    <h2 className="text-xl font-black text-white">{business.name}</h2>
                                    <p className="text-slate-400 text-sm mt-1">{business.description}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            backgroundColor: `${SECTOR_INFO[business.sector_id as Sector]?.color}20`,
                                            color: SECTOR_INFO[business.sector_id as Sector]?.color
                                        }}
                                    >
                                        {SECTOR_INFO[business.sector_id as Sector]?.name}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-400">
                                        {business.address}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Logout Button */}
            <button
                onClick={signOut}
                className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
            >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
            </button>
        </div>
    );
}
