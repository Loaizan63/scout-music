# Guía de Migración a Supabase

## 1. Crear la Tabla en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo `supabase-schema.sql` y cópialo
3. Ejecuta todo el SQL en el editor
4. Presiona "RUN"

## 2. Instalar dependencias

```bash
npm install
```

Esto instalará:
- `@supabase/supabase-js` - Cliente de Supabase
- `express` - Servidor backend
- `cors` - CORS para API
- `dotenv` - Variables de entorno
- `ts-node` - Para ejecutar TypeScript

## 3. Migrar datos a Supabase

```bash
npm run migrate
```

Este comando:
- Lee `src/data/songs.json`
- Carga todos los datos en la tabla `songs` de Supabase
- Muestra confirmación de éxito

## 4. Opción A: Usar Frontend directo con Supabase (RECOMENDADO)

El frontend ya está configurado para:
- Importar credenciales desde `.env.local`
- Conectarse directamente a Supabase
- Usar caché y queries optimizadas

**No necesitas servidor backend separado para esto.**

## 4. Opción B: Usar servidor Node.js backend

Si prefieres un backend:

```bash
bun server
```

Endpoints disponibles:
- `GET /api/songs` - Todas las canciones
- `GET /api/songs?category=Rovers` - Filtrar por categoría
- `GET /api/songs?q=búsqueda` - Búsqueda
- `GET /api/songs/:id` - Una canción por ID
- `GET /api/categories` - Todas las categorías
- `GET /health` - Verificar servidor

## 5. Desplegar en Coolify

### Opción A: Frontend (Recomendado)
1. Conecta tu repo a Coolify
2. Selecciona "Node.js"
3. Build: `npm install && npm run build`
4. Start: `npm run preview`

### Opción B: Backend + Frontend
1. Crea dos servicios en Coolify
2. **Frontend**: Build: `npm install && npm run build`, Start: `npm run preview`
3. **Backend**: Build: `npm install`, Start: `npm run server`
4. Configura variables de entorno en ambos

## Variables de Entorno (.env.local)

```
VITE_SUPABASE_URL=https://qbndzipgrhjlhgauledh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFibmR6aXBncmhqbGhnYXVsZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzQwNzQsImV4cCI6MjA4NTY1MDA3NH0.EW_DxhSxTmI6N4kRJ399xubgOckZGCpScyHFhe4LFXg
```

## Verificar que funciona

```bash
# En una terminal
bun dev

# En otra terminal (si usas backend)
bun server
```

Abre `http://localhost:5628` y verifica que carga las canciones.

## Próximos Pasos

- [ ] Ejecutar SQL en Supabase
- [ ] Ejecutar `bun migrate`
- [ ] Probar `bun dev`
- [ ] Desplegar en Coolify
