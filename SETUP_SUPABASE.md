# ✅ Migración a Supabase - Guía Completa

## 🎯 Resumen

He migrado tu proyecto de PHP/MySQL a **Supabase + Node.js**. Aquí está todo listo para Coolify.

---

## 📋 Archivos Creados/Modificados

### Nuevos archivos:
- `.env.local` - Configuración de Supabase
- `server.ts` - Servidor Express (opcional)
- `migrate-to-supabase.ts` - Script de migración
- `supabase-schema.sql` - Schema para crear tabla
- `src/lib/supabase.ts` - Cliente Supabase para frontend

### Modificados:
- `package.json` - Agregados: express, @supabase/supabase-js, cors, dotenv
- `src/pages/Index.tsx` - Ahora usa Supabase en lugar de JSON
- `src/components/Sidebar.tsx` - Categorías dinámicas desde DB

---

## 🚀 Pasos de Implementación

### Paso 1: Instalar Node.js (si no lo tienes)

Descarga desde https://nodejs.org (versión LTS 18+)

Verifica en PowerShell:
```powershell
node --version
npm --version
```

### Paso 2: Crear la tabla en Supabase

1. Ve a https://app.supabase.com
2. Entra a tu proyecto `qbndzipgrhjlhgauledh`
3. Ve a **SQL Editor**
4. Haz click en **New Query**
5. Copia todo el contenido de `supabase-schema.sql`
6. Pega en el editor
7. Haz click en **RUN**

✅ Tabla `songs` creada

### Paso 3: Instalar dependencias

```powershell
cd "c:\Users\loaiz\Desktop\DESKTOP\scout-player"
npm install
```

### Paso 4: Migrar datos JSON a Supabase

```powershell
npm run migrate
```

Deberías ver:
```
🚀 Starting migration to Supabase...
📖 Loaded 74 songs from songs.json
📋 Creating songs table...
💾 Inserting songs into Supabase...
✅ Successfully migrated 74 songs!
🎉 Migration complete!
```

### Paso 5: Probar localmente

**Terminal 1 - Frontend:**
```powershell
npm run dev
```
Abre http://localhost:5628

El frontend ahora cargará canciones desde Supabase automáticamente ✅

---

## 🌐 Desplegar en Coolify

### Opción A: Frontend solamente (RECOMENDADO)

Tu frontend ahora se conecta directamente a Supabase, no necesitas backend separado.

**En Coolify:**
1. Conecta tu repo Git
2. Framework: **Node.js**
3. Build command: `npm install && npm run build`
4. Start command: `npm run preview`
5. Variables de entorno: **Ya están en `.env.local`** (o cópia a Coolify)

**Ambiente:**
```
VITE_SUPABASE_URL=https://qbndzipgrhjlhgauledh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFibmR6aXBncmhqbGhnYXVsZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzQwNzQsImV4cCI6MjA4NTY1MDA3NH0.EW_DxhSxTmI6N4kRJ399xubgOckZGCpScyHFhe4LFXg
```

---

### Opción B: Frontend + Backend

Si quieres un servidor Node.js separado:

**Backend en Coolify:**
1. Build: `npm install`
2. Start: `npm run server`
3. Puerto: `3000`
4. Mismas variables de entorno

**Frontend en Coolify:**
1. Build: `npm install && npm run build`
2. Start: `npm run preview`
3. Variables: igual

---

## 📁 Estructura Final

```
scout-player/
├── .env.local                      # ✅ Credenciales Supabase
├── server.ts                        # ✅ Backend Express (opcional)
├── migrate-to-supabase.ts          # ✅ Script migración
├── supabase-schema.sql             # ✅ SQL para crear tabla
├── package.json                     # ✅ Actualizado
├── src/
│   ├── lib/
│   │   └── supabase.ts             # ✅ Cliente Supabase
│   ├── pages/
│   │   └── Index.tsx               # ✅ Actualizado (usa Supabase)
│   ├── components/
│   │   └── Sidebar.tsx             # ✅ Actualizado (categorías dinámicas)
│   └── ...
└── ...
```

---

## 🔄 Qué Pasó

### Antes (PHP + MySQL)
```
Frontend (JSON estático) → PHP → MySQL
```

### Ahora (Supabase)
```
Frontend → Supabase (directo)
         ↓ (alternativo)
         Node.js Express → Supabase
```

**Ventajas:**
- ✅ No necesitas PHP
- ✅ Funciona en Coolify
- ✅ Frontend puede conectar directamente a Supabase
- ✅ Datos siempre sincronizados
- ✅ Escalable y seguro

---

## ⚠️ Consideraciones de Seguridad

La `anon key` de Supabase está en el frontend (es pública, así funciona Supabase).

Para mantener seguridad:
- La tabla tiene RLS (Row Level Security) habilitada
- Solo permite lectura pública
- No hay acceso para insertar/actualizar/eliminar desde frontend

Si necesitas operaciones de escritura, usa el servidor Node.js como middleware.

---

## 📞 Próximas acciones:

1. ✅ Instala Bun (si no lo tienes)
2. ✅ Ejecuta SQL en Supabase
3. ✅ Ejecuta `bun migrate`
4. ✅ Prueba con `bun dev`
5. ✅ Deploya en Coolify

---

## 🐛 Solución de problemas

### Error: "Module not found @supabase/supabase-js"
```
bun install
```

### Error: "VITE_SUPABASE_URL is empty"
Verifica que `.env.local` esté en la raíz del proyecto

### Error de conexión a Supabase
Verifica que:
- La URL y key sean correctas
- La tabla `songs` existe en Supabase
- Has ejecutado `bun migrate`

---

¡Listo! Tu app ahora usa Supabase y funciona con Coolify. 🎉
