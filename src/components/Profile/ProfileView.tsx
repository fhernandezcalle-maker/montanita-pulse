
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Store, Shield, Camera, Edit2, Trash2, Save, X, LogOut, Check, Users, Calendar, BarChart3, Settings } from 'lucide-react';
import { getSupabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { SECTOR_INFO } from '@/constants';
import { Sector } from '@/types';

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

interface AdminStats {
    totalUsers: number;
    totalBusinesses: number;
    totalEvents: number;
    pendingVerifications: number;
}

export default function ProfileView() {
    const { user, profile, isAdmin, isBusiness, signOut, refreshProfile } = useAuth();
    const [business, setBusiness] = useState<BusinessProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editSector, setEditSector] = useState<Sector>(Sector.CENTRO);
    const [editAddress, setEditAddress] = useState('');

    useEffect(() => {
        if (user) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [user, profile]);

    const loadData = async () => {
        if (!user) return;

        const supabase = getSupabase();

        // Load business if user is business or admin
        if (isBusiness) {
            const { data } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .maybeSingle();

            if (data) {
                setBusiness(data);
                setEditName(data.name);
                setEditDescription(data.description || '');
                setEditSector(data.sector_id as Sector);
                setEditAddress(data.address || '');
            }
        }

        // Load admin stats
        if (isAdmin) {
            const [usersRes, businessesRes, eventsRes, verificationsRes] = await Promise.all([
                supabase.from('user_profiles').select('id', { count: 'exact' }),
                supabase.from('businesses').select('id', { count: 'exact' }),
                supabase.from('events').select('id', { count: 'exact' }),
                supabase.from('businesses').select('id', { count: 'exact' }).eq('is_verified', false)
            ]);

            setAdminStats({
                totalUsers: usersRes.count || 0,
                totalBusinesses: businessesRes.count || 0,
                totalEvents: eventsRes.count || 0,
                pendingVerifications: verificationsRes.count || 0
            });
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

    const verifyBusiness = async (businessId: string) => {
        const supabase = getSupabase();
        await supabase
            .from('businesses')
            .update({ is_verified: true })
            .eq('id', businessId);

        loadData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user || !profile) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Inicia sesión para ver tu perfil
                </p>
            </div>
        );
    }

    const getRoleBadge = () => {
        const badges = {
            admin: { icon: Shield, color: 'amber', label: 'Administrador' },
            business: { icon: Store, color: 'cyan', label: 'Negocio' },
            visitor: { icon: User, color: 'rose', label: 'Visitante' }
        };
        const badge = badges[profile.role];
        const Icon = badge.icon;

        return (
            <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold`}
                style={{
                    backgroundColor: badge.color === 'amber' ? 'rgba(245,158,11,0.2)'
                        : badge.color === 'cyan' ? 'rgba(6,182,212,0.2)'
                            : 'rgba(244,63,94,0.2)',
                    color: badge.color === 'amber' ? '#f59e0b'
                        : badge.color === 'cyan' ? '#06b6d4'
                            : '#f43f5e'
                }}
            >
                <Icon className="w-4 h-4" />
                {badge.label}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
                        {(profile.display_name || user.email)?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">
                            {profile.display_name || user.email?.split('@')[0]}
                        </h2>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                </div>
                {getRoleBadge()}
            </div>

            {/* Admin Dashboard */}
            {isAdmin && adminStats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl p-6 border border-amber-500/20"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-amber-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                            Panel de Administrador
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-900/50 rounded-2xl p-4">
                            <Users className="w-6 h-6 text-cyan-500 mb-2" />
                            <p className="text-2xl font-black">{adminStats.totalUsers}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Usuarios</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-2xl p-4">
                            <Store className="w-6 h-6 text-rose-500 mb-2" />
                            <p className="text-2xl font-black">{adminStats.totalBusinesses}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Negocios</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-2xl p-4">
                            <Calendar className="w-6 h-6 text-emerald-500 mb-2" />
                            <p className="text-2xl font-black">{adminStats.totalEvents}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Eventos</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-2xl p-4">
                            <Check className="w-6 h-6 text-amber-500 mb-2" />
                            <p className="text-2xl font-black">{adminStats.pendingVerifications}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pendientes</p>
                        </div>
                    </div>

                    <button
                        className="w-full py-3 bg-amber-500/20 text-amber-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-all"
                    >
                        <Settings className="w-5 h-5" />
                        Gestionar Plataforma
                    </button>
                </motion.div>
            )}

            {/* Business Profile */}
            {isBusiness && business && (
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

            {/* Visitor Message */}
            {profile.role === 'visitor' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 rounded-3xl p-6 border border-white/5 text-center"
                >
                    <User className="w-12 h-12 mx-auto mb-4 text-rose-500" />
                    <h3 className="font-bold text-white mb-2">Cuenta de Visitante</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Explora eventos, añade favoritos y descubre lo mejor de Montañita.
                    </p>
                    <p className="text-xs text-slate-600">
                        ¿Tienes un negocio? Contacta al administrador para cambiar tu rol.
                    </p>
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
