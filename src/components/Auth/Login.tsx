
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Store, Shield, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { getSupabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'register';
type UserRole = 'visitor' | 'business' | 'admin';

const roleConfig = {
    visitor: {
        icon: User,
        title: 'Visitante',
        description: 'Explora eventos y añade a favoritos',
        color: 'rose'
    },
    business: {
        icon: Store,
        title: 'Negocio',
        description: 'Publica eventos y promociones',
        color: 'cyan'
    },
    admin: {
        icon: Shield,
        title: 'Administrador',
        description: 'Gestiona toda la plataforma',
        color: 'amber'
    }
};

export default function Login() {
    const { user } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [step, setStep] = useState(1); // 1: role select, 2: credentials
    const [selectedRole, setSelectedRole] = useState<UserRole>('visitor');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const supabase = getSupabase();

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
            } else {
                // Register new user
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            display_name: displayName,
                            role: selectedRole
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // Create user profile with role - use setTimeout to avoid abort
                    setTimeout(async () => {
                        try {
                            await supabase
                                .from('user_profiles')
                                .upsert({
                                    id: data.user!.id,
                                    role: selectedRole,
                                    display_name: displayName
                                });
                        } catch (e) {
                            console.log('Profile will be created on first login');
                        }
                    }, 100);

                    setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.');
                    // Switch to login mode after successful registration
                    setTimeout(() => {
                        setMode('login');
                        setStep(1);
                    }, 2000);
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setDisplayName('');
        setError('');
        setSuccess('');
        setStep(1);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-8 border border-white/5 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.1 }}
                            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20"
                        >
                            {mode === 'login' ? (
                                <Lock className="w-8 h-8 text-white" />
                            ) : (
                                React.createElement(roleConfig[selectedRole].icon, { className: 'w-8 h-8 text-white' })
                            )}
                        </motion.div>
                        <h2 className="text-2xl font-black text-white">
                            {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {mode === 'login'
                                ? 'Inicia sesión para continuar'
                                : step === 1
                                    ? 'Elige tu tipo de cuenta'
                                    : `Registro como ${roleConfig[selectedRole].title}`
                            }
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Register Step 1: Role Selection */}
                        {mode === 'register' && step === 1 && (
                            <motion.div
                                key="role-select"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {(Object.keys(roleConfig) as UserRole[]).map((role) => {
                                    const config = roleConfig[role];
                                    const Icon = config.icon;
                                    const isSelected = selectedRole === role;

                                    return (
                                        <button
                                            key={role}
                                            onClick={() => setSelectedRole(role)}
                                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${isSelected
                                                ? `border-${config.color}-500 bg-${config.color}-500/10`
                                                : 'border-slate-800 hover:border-slate-700'
                                                }`}
                                            style={{
                                                borderColor: isSelected
                                                    ? config.color === 'rose' ? '#f43f5e'
                                                        : config.color === 'cyan' ? '#06b6d4'
                                                            : '#f59e0b'
                                                    : undefined,
                                                backgroundColor: isSelected
                                                    ? config.color === 'rose' ? 'rgba(244,63,94,0.1)'
                                                        : config.color === 'cyan' ? 'rgba(6,182,212,0.1)'
                                                            : 'rgba(245,158,11,0.1)'
                                                    : undefined
                                            }}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center`}
                                                style={{
                                                    backgroundColor: config.color === 'rose' ? 'rgba(244,63,94,0.2)'
                                                        : config.color === 'cyan' ? 'rgba(6,182,212,0.2)'
                                                            : 'rgba(245,158,11,0.2)'
                                                }}
                                            >
                                                <Icon
                                                    className="w-6 h-6"
                                                    style={{
                                                        color: config.color === 'rose' ? '#f43f5e'
                                                            : config.color === 'cyan' ? '#06b6d4'
                                                                : '#f59e0b'
                                                    }}
                                                />
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                                    {config.title}
                                                </p>
                                                <p className="text-xs text-slate-500">{config.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl font-bold text-white mt-6 hover:opacity-90 transition-opacity"
                                >
                                    Continuar
                                </button>

                                <button
                                    onClick={() => { setMode('login'); resetForm(); }}
                                    className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors"
                                >
                                    ¿Ya tienes cuenta? <span className="text-rose-500 font-bold">Inicia sesión</span>
                                </button>
                            </motion.div>
                        )}

                        {/* Login / Register Step 2: Credentials */}
                        {(mode === 'login' || (mode === 'register' && step === 2)) && (
                            <motion.form
                                key="credentials"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {mode === 'register' && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-4"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Cambiar tipo de cuenta
                                    </button>
                                )}

                                {mode === 'register' && (
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder={selectedRole === 'business' ? 'Nombre del negocio' : 'Tu nombre'}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Contraseña"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center"
                                    >
                                        {success}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : mode === 'login' ? (
                                        'Iniciar Sesión'
                                    ) : (
                                        'Crear Cuenta'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'register' : 'login');
                                        resetForm();
                                    }}
                                    className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors"
                                >
                                    {mode === 'login' ? (
                                        <>¿No tienes cuenta? <span className="text-rose-500 font-bold">Regístrate</span></>
                                    ) : (
                                        <>¿Ya tienes cuenta? <span className="text-rose-500 font-bold">Inicia sesión</span></>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
