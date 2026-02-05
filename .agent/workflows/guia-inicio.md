---
description: Cómo ejecutar y desplegar Montañita Pulse
---

# Guía de Montañita Pulse 🏄‍♂️🔥

Esta guía te ayudará a poner en marcha el proyecto y desplegarlo.

## 1. Configuración de Variables de Entorno
Crea un archivo `.env.local` en la raíz de `montanita-pulse/` (si no existe ya) con:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_de_mapbox
```

## 2. Configuración de Base de Datos
Ejecuta el contenido de `supabase_schema_v2.sql` en el **SQL Editor** de tu dashboard de Supabase. Esto habilitará PostGIS y creará todas las tablas necesarias.

## 3. Ejecución en Local
Para ver la aplicación en tu navegador:
// turbo
```powershell
cd montanita-pulse
npm run dev
```
Luego abre [http://localhost:3000](http://localhost:3000).

## 4. Despliegue en Netlify
// turbo
```powershell
cd montanita-pulse
npm run build
npx netlify deploy --prod
```

## 5. Estructura de Sectores
- **Centro**: `#f43f5e` (Rose) - Vida nocturna.
- **La Punta**: `#06b6d4` (Cyan) - Surf y Chill.
- **Tigrillo**: `#10b981` (Emerald) - Yoga y Silencio.
- **Malecón**: `#f59e0b` (Amber) - Cultura.
