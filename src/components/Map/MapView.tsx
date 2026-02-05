'use client';


import React, { useState, useRef, useMemo } from 'react';

import Map, { Marker, NavigationControl, Source, Layer, MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';

import 'mapbox-gl/dist/mapbox-gl.css';
import { Business, Sector } from '@/types';
import { SECTOR_INFO, MONTANITA_CENTER, SECTOR_POLYGONS } from '@/constants';
import { MapPin, Info } from 'lucide-react';


interface MapViewProps {
    businesses: Business[];
    selectedSector: Sector | null;
    onBusinessSelect: (business: Business) => void;
}

export default function MapView({ businesses, selectedSector, onBusinessSelect }: MapViewProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
        latitude: MONTANITA_CENTER.lat,
        longitude: MONTANITA_CENTER.lng,
        zoom: MONTANITA_CENTER.zoom,
        pitch: 45,
        bearing: 0
    });


    // GeoJSON for Businesses (Clustering)
    const businessesGeojson = useMemo(() => ({
        type: 'FeatureCollection' as const,
        features: businesses.map(b => ({
            type: 'Feature' as const,
            properties: {
                id: b.id,
                name: b.name,
                category: b.category_id,
                sector: b.sector_id,
                isVerified: b.is_verified
            },
            geometry: {
                type: 'Point' as const,
                coordinates: [b.location.lng, b.location.lat]
            }
        }))
    }), [businesses]);

    // GeoJSON for Sectors (Polygons)
    const sectorsGeojson = useMemo(() => ({
        type: 'FeatureCollection' as const,
        features: Object.entries(SECTOR_POLYGONS).map(([sectorId, coords]) => ({
            type: 'Feature' as const,
            properties: {
                id: sectorId,
                color: SECTOR_INFO[sectorId as Sector].color,
                isSelected: selectedSector === sectorId
            },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [coords]
            }
        }))
    }), [selectedSector]);


    const sectorFillLayer: any = {
        id: 'sector-fills',
        type: 'fill',
        source: 'sectors',
        layout: {},
        paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': [
                'case',
                ['get', 'isSelected'],
                0.3,
                0.05
            ]
        }
    };

    const sectorOutlineLayer: any = {
        id: 'sector-outlines',
        type: 'line',
        source: 'sectors',
        layout: {},
        paint: {
            'line-color': ['get', 'color'],
            'line-width': [
                'case',
                ['get', 'isSelected'],
                4,
                1
            ],
            'line-dasharray': [2, 1]
        }
    };

    const clusterLayer: any = {
        id: 'clusters',
        type: 'circle',
        source: 'businesses',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#f43f5e',
                10,
                '#e11d48',
                30,
                '#9f1239'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10,
                30,
                30,
                40
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    };

    const clusterCountLayer: any = {
        id: 'cluster-count',
        type: 'symbol',
        source: 'businesses',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        paint: {
            'text-color': '#ffffff'
        }
    };

    const unclusteredPointLayer: any = {
        id: 'unclustered-point',
        type: 'circle',
        source: 'businesses',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#f43f5e',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    };

    return (
        <div className="relative w-full h-[60vh] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800/50 group">
            <Map
                {...viewState}


                onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}


                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
            >
                <Source id="sectors" type="geojson" data={sectorsGeojson}>
                    <Layer {...sectorFillLayer} />
                    <Layer {...sectorOutlineLayer} />
                </Source>

                <Source
                    id="businesses"
                    type="geojson"
                    data={businessesGeojson}
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                >
                    <Layer {...clusterLayer} />
                    <Layer {...clusterCountLayer} />
                    <Layer {...unclusteredPointLayer} />
                </Source>

                <NavigationControl position="top-right" />
            </Map>

            {/* Glassmorphism Overlay for Legend/Info */}
            <div className="absolute bottom-6 left-6 right-6 p-4 backdrop-blur-md bg-slate-900/60 rounded-2xl border border-white/10 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500 rounded-lg">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Explorando Montañita</h3>
                        <p className="text-slate-400 text-xs">{selectedSector ? SECTOR_INFO[selectedSector].name : 'Todos los sectores'}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Info className="w-5 h-5 text-slate-300" />
                </button>
            </div>
        </div>
    );
}
