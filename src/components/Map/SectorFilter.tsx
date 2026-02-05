
'use client';

import React from 'react';
import { Sector } from '@/types';
import { SECTOR_INFO } from '@/constants';
import { motion } from 'framer-motion';

interface SectorFilterProps {
    selectedSector: Sector | null;
    onSectorChange: (sector: Sector | null) => void;
}

export default function SectorFilter({ selectedSector, onSectorChange }: SectorFilterProps) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth px-4 mt-8">
            <button
                onClick={() => onSectorChange(null)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${selectedSector === null
                        ? 'bg-white text-black shadow-xl scale-105'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
            >
                Todo
            </button>
            {Object.entries(SECTOR_INFO).map(([key, info]) => (
                <button
                    key={key}
                    onClick={() => onSectorChange(key as Sector)}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 ${selectedSector === key
                            ? 'shadow-xl scale-105'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    style={{
                        backgroundColor: selectedSector === key ? info.color : undefined,
                        color: selectedSector === key ? 'white' : undefined
                    }}
                >
                    <span>{info.icon}</span>
                    {info.name}
                </button>
            ))}
        </div>
    );
}
