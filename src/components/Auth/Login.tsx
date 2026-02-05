'use client';

import { useState } from 'react';
import { getSupabase } from '@/services/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Sparkles, MoveRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = getSupabase();
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: email.split('@')[0]
                        }
                    }
                });
                if (error) throw error;
                alert('Revisa tu email para confirmar el registro');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-rose-500/20 mb-6"
                >
                    <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-black tracking-tight">{isSignUp ? 'Únete al Pulse' : 'Bienvenido de nuevo'}</h2>
                <p className="text-slate-500 font-medium">{isSignUp ? 'Crea tu cuenta de host o visitante' : 'Tu conexión con Montañita te espera'}</p>
            </div>

            <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
                <div className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="email"
                            placeholder="Tu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-rose-500 text-sm font-bold text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {isSignUp ? 'Crear Cuenta' : 'Entrar'}
                            <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full text-slate-400 text-sm font-bold hover:text-white transition-colors py-2"
                >
                    {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Registrate gratis'}
                </button>
            </form>
        </div>
    );
}
