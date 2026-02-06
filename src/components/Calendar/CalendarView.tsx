
'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Sector } from '@/types';
import { SECTOR_INFO } from '@/constants';
import { getSupabase } from '@/services/supabase';

export default function CalendarView() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('events')
                .select(`
                    id,
                    title,
                    start_at,
                    end_at,
                    sector_id,
                    businesses (
                        name
                    )
                `);

            if (error) {
                console.error('Error loading events:', error);
                return;
            }

            if (data) {
                const formattedEvents = data.map(event => ({
                    id: event.id,
                    title: event.title,
                    start: event.start_at,
                    end: event.end_at,
                    // Use sector color or default to rose
                    backgroundColor: event.sector_id && SECTOR_INFO[event.sector_id as Sector]
                        ? SECTOR_INFO[event.sector_id as Sector].color
                        : '#f43f5e',
                    borderColor: 'transparent',
                }));
                setEvents(formattedEvents);
            }
            setLoading(false);
        }

        loadEvents();
    }, []);

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Agenda Pulse</h2>
                {loading && <div className="text-[10px] text-slate-500 animate-pulse">Cargando eventos...</div>}
                {!loading && events.length === 0 && <div className="text-[10px] text-slate-500">No hay eventos guardados</div>}
            </div>

            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridDay,timeGridWeek,dayGridMonth'
                    }}
                    editable={false}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    nowIndicator={true}
                    slotMinTime="06:00:00"
                    slotMaxTime="30:00:00"
                    themeSystem="standard"
                    events={events}
                    eventContent={(eventInfo) => (
                        <div className="p-1 overflow-hidden h-full">
                            <div className="text-[10px] font-bold truncate leading-tight">{eventInfo.event.title}</div>
                        </div>
                    )}
                />
            </div>

            <style jsx global>{`
        .fc {
          --fc-border-color: rgba(255, 255, 255, 0.05);
          --fc-button-bg-color: #1e293b;
          --fc-button-border-color: rgba(255, 255, 255, 0.1);
          --fc-button-hover-bg-color: #334155;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: rgba(255, 255, 255, 0.02);
          --fc-list-event-hover-bg-color: rgba(255, 255, 255, 0.05);
          --fc-today-bg-color: rgba(244, 63, 94, 0.05);
          color: white;
          font-family: inherit;
        }
        .fc-toolbar-title {
          font-size: 1rem !important;
          font-weight: 800 !important;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .fc-button {
          font-size: 0.7rem !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          border-radius: 0.75rem !important;
        }
        .fc-timegrid-slot {
          height: 3rem !important;
        }
        .fc-event {
          border-radius: 6px !important;
          padding: 2px !important;
        }
      `}</style>
        </div>
    );
}
