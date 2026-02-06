
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SectorFilter from '@/components/Map/SectorFilter';
import EventWizard from '@/components/Dashboard/EventWizard';
import BusinessDashboard from '@/components/Dashboard/BusinessDashboard';
import Login from '@/components/Auth/Login';
import { useAuth } from '@/context/AuthContext';
import { Sector, Business, MontanitaEvent } from '@/types';
import EventList from '@/components/Events/EventList';
import FavoritesView from '@/components/Favorites/FavoritesView';
import { SECTOR_INFO } from '@/constants';
import { Search, Calendar, Heart, User, Map as MapIcon, Sparkles, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/services/supabase';

const MapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => <div className="w-full h-[60vh] bg-slate-900 animate-pulse rounded-3xl" />
});

const CalendarView = dynamic(() => import('@/components/Calendar/CalendarView'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-900 animate-pulse rounded-3xl" />
});

const AgendaView = dynamic(() => import('@/components/Agenda/AgendaView'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-900 animate-pulse rounded-3xl" />
});

// Temporary mock data until DB is connected
const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Lost Beach Club',
    description: 'The best techno club in the world.',
    sector_id: Sector.CENTRO,
    category_id: 'club',
    location: { lat: -1.8265, lng: -80.7533 },
    address: 'Calle de los Cócteles',
    is_verified: true,
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=800',
    owner_id: 'user1',
    contact_info: { instagram: '@lostbeachclub' }
  },
  {
    id: '2',
    name: 'Balsa Surf Camp',
    description: 'Surf and chill vibes.',
    sector_id: Sector.LA_PUNTA,
    category_id: 'surf',
    location: { lat: -1.8210, lng: -80.7580 },
    address: 'La Punta',
    is_verified: true,
    image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800',
    owner_id: 'user2',
    contact_info: { instagram: '@balsasurfcamp' }
  },
  {
    id: '3',
    name: 'Casa del Sol',
    description: 'Yoga retreats and healthy food.',
    sector_id: Sector.TIGRILLO,
    category_id: 'wellness',
    location: { lat: -1.8275, lng: -80.7515 },
    address: 'Barrio El Tigrillo',
    is_verified: true,
    image_url: 'https://images.unsplash.com/photo-1545208393-216c7ad81645?q=80&w=800',
    owner_id: 'user3',
    contact_info: { instagram: '@casadelsolmontanita' }
  }
];

export default function Home() {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [rsvped, setRsvped] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('explore');
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [events, setEvents] = useState<MontanitaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    async function initData() {
      setLoading(true);
      const { supabaseApi } = await import('@/services/supabase');
      const { getMontanitaDayRange } = await import('@/utils/dateUtils');

      const [busRes, evtRes] = await Promise.all([
        supabaseApi.getBusinessesBySector(selectedSector),
        supabaseApi.getEvents(selectedSector)
      ]);

      if (busRes.data) setBusinesses(busRes.data as any);

      if (evtRes.data) {
        const { start, end } = getMontanitaDayRange(new Date());
        // Filter for local night logic
        const currentEvents = (evtRes.data as any[]).filter(e => {
          const evtStart = new Date(e.start_at);
          return evtStart >= start && evtStart <= end;
        });
        setEvents(currentEvents as any);
      }

      const saved = localStorage.getItem('montanita-pulse-rsvps');
      if (saved) setRsvped(JSON.parse(saved));
      setLoading(false);
    }
    initData();
  }, [selectedSector]);

  const toggleRSVP = (id: string) => {
    setRsvped(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('montanita-pulse-rsvps', JSON.stringify(next));
      return next;
    });
  };

  const filteredEvents = events.filter(e => {
    const searchMatch = !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const vibeMatch = !selectedVibe || e.vibe_tags?.includes(selectedVibe) || e.category_id?.toLowerCase().includes(selectedVibe.toLowerCase());
    return searchMatch && vibeMatch;
  });

  const filteredBusinesses = businesses.filter(b => {
    const searchMatch = !searchQuery ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const vibeMatch = !selectedVibe || b.category_id?.toLowerCase().includes(selectedVibe.toLowerCase());
    return searchMatch && vibeMatch;
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-32">
      <header className="pt-12 px-6 pb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Montañita Pulse</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Live the vibe</p>
            </div>
          </motion.div>
          <div className="w-10 h-10 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden">
            {user?.email ? (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="¿Qué buscas hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800/50 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all backdrop-blur-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-800 rounded-full"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'explore' && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <SectorFilter selectedSector={selectedSector} onSectorChange={setSelectedSector} />
            <div className="px-4 mt-4">
              <MapView
                businesses={filteredBusinesses}
                selectedSector={selectedSector}
                onBusinessSelect={(b) => console.log(b)}
              />
            </div>

            <div className="mt-8 px-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                En Vivo Ahora
              </h2>
              <EventList
                events={filteredEvents}
                rsvped={rsvped}
                onToggleRSVP={toggleRSVP}
                loading={loading}
              />
            </div>

            <div className="mt-8 px-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Filtrar por Vibe</h2>
                {selectedVibe && (
                  <button
                    onClick={() => setSelectedVibe(null)}
                    className="text-[10px] font-bold text-rose-500 uppercase"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {['Surf', 'Club', 'Wellness', 'Techno', 'Relax'].map(vibe => (
                  <button
                    key={vibe}
                    onClick={() => setSelectedVibe(selectedVibe === vibe ? null : vibe)}
                    className={`px-4 py-2 border rounded-full text-xs font-bold transition-all ${selectedVibe === vibe
                      ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4"
          >
            <AgendaView />
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-6"
          >
            <FavoritesView
              events={events}
              rsvpedIds={rsvped}
              onToggleRSVP={toggleRSVP}
              loading={loading}
            />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4"
          >
            {user ? (
              showWizard ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowWizard(false)}
                    className="text-xs font-bold text-slate-500 hover:text-white transition-colors mb-4 flex items-center gap-2"
                  >
                    ← Volver al Dashboard
                  </button>
                  <EventWizard />
                </div>
              ) : (
                <BusinessDashboard onCreateEvent={() => setShowWizard(true)} />
              )
            ) : <Login />}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-[1000] flex items-center justify-around px-2">
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<MapIcon />} label="Explorar" />
        <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar />} label="Agenda" />
        <TabButton active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} icon={<Heart />} label="Favoritos" />
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User />} label="Host" />
      </nav>
    </main>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactElement, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex flex-col items-center gap-1 transition-all duration-300 relative ${active ? 'text-rose-500' : 'text-slate-500'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-rose-500/10' : ''}`}>
        {React.cloneElement(icon, { size: 24 } as any)}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {active && (
        <motion.div layoutId="tab-indicator" className="absolute -bottom-2 w-1 h-1 bg-rose-500 rounded-full" />
      )}
    </button>
  );
}
