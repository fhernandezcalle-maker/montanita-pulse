'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Business, Sector } from '@/types';
import { SECTOR_INFO, MONTANITA_CENTER, SECTOR_POLYGONS } from '@/constants';
import { Check } from 'lucide-react';

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
        width: 24px; 
        height: 24px; 
        background: linear-gradient(135deg, #f43f5e 0%, #f97316 100%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

interface MapViewProps {
    businesses: Business[];
    selectedSector: Sector | null;
    onBusinessSelect: (business: Business) => void;
}

export default function MapView({ businesses, selectedSector, onBusinessSelect }: MapViewProps) {
    const center: [number, number] = selectedSector && SECTOR_INFO[selectedSector]?.center
        ? [SECTOR_INFO[selectedSector].center![1], SECTOR_INFO[selectedSector].center![0]]
        : [MONTANITA_CENTER.lat, MONTANITA_CENTER.lng];

    const zoom = selectedSector ? 16 : MONTANITA_CENTER.zoom;

    // Filter businesses based on selected sector
    const filteredBusinesses = useMemo(() => {
        if (!selectedSector) return businesses;
        return businesses.filter(b => b.sector_id === selectedSector);
    }, [businesses, selectedSector]);

    return (
        <div className="relative w-full h-[60vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Sector Polygons */}
                {Object.entries(SECTOR_POLYGONS).map(([sectorId, coords]) => (
                    <Polygon
                        key={sectorId}
                        positions={coords.map(c => [c[1], c[0]] as [number, number])}
                        pathOptions={{
                            color: SECTOR_INFO[sectorId as Sector]?.color || '#f43f5e',
                            fillColor: SECTOR_INFO[sectorId as Sector]?.color || '#f43f5e',
                            fillOpacity: selectedSector === sectorId ? 0.3 : 0.1,
                            weight: selectedSector === sectorId ? 3 : 1
                        }}
                    />
                ))}

                {/* Business Markers */}
                {filteredBusinesses.map(business => (
                    <Marker
                        key={business.id}
                        position={[business.location.lat, business.location.lng]}
                        icon={defaultIcon}
                        eventHandlers={{
                            click: () => onBusinessSelect(business)
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[150px]">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm text-slate-900">{business.name}</h3>
                                    {business.is_verified && (
                                        <div className="bg-cyan-500 rounded-full p-0.5">
                                            <Check className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{business.description}</p>
                                <span className="inline-block mt-2 text-[10px] font-bold text-rose-500 uppercase">
                                    {SECTOR_INFO[business.sector_id]?.name || business.sector_id}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay gradient for aesthetics */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-lg rounded-2xl p-3 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sectores</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(SECTOR_INFO).map(([id, info]) => (
                        <div key={id} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: info.color }}
                            />
                            <span className="text-[10px] text-slate-400">{info.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
