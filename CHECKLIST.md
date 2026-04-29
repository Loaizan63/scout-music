## ✅ CHECKLIST - Migración Supabase

### 1️⃣ Preparación (30 segundos)
- [ ] Instalar Node.js (si es necesario)
  Descarga desde https://nodejs.org (LTS 18+)
  
  Verifica:
  ```powershell
  node --version
  npm --version
  ```

### 2️⃣ Supabase Dashboard (2 minutos)
- [ ] Abre https://app.supabase.com
- [ ] Entra a proyecto `qbndzipgrhjlhgauledh`
- [ ] Ve a **SQL Editor** → **New Query**
- [ ] Copia contenido de `supabase-schema.sql`
- [ ] Pega el SQL en el editor
- [ ] Haz click **RUN**
- [ ] Verifica que tabla `songs` se creó

✅ **Base de datos lista**

### 3️⃣ Instalar dependencias (3 minutos)
```powershell
cd "c:\Users\loaiz\Desktop\DESKTOP\scout-player"
npm install
```

✅ **Dependencias instaladas**

### 4️⃣ Migrar datos (1 minuto)
```powershell
npm run migrate
```

Deberías ver:
```
✅ Successfully migrated 74 songs!
🎉 Migration complete!
```

✅ **Datos en Supabase**

### 5️⃣ Probar localmente (2 minutos)
```powershell
npm run dev
```

- [ ] Abre http://localhost:5628
- [ ] Verifica que carga las canciones
- [ ] Busca una canción
- [ ] Selecciona una categoría
- [ ] Reproduce audio

✅ **Frontend funcionando**

### 6️⃣ Desplegar en Coolify (5 minutos)

**Opción A - Frontend + Supabase directo (RECOMENDADO)**
1. Crea aplicación en Coolify
2. Conecta tu repo Git
3. Framework: **Node.js**
4. Build: `npm install && npm run build`
5. Start: `npm run preview`
6. Agrega variables de entorno:
   ```
   VITE_SUPABASE_URL=https://qbndzipgrhjlhgauledh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFibmR6aXBncmhqbGhnYXVsZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzQwNzQsImV4cCI6MjA4NTY1MDA3NH0.EW_DxhSxTmI6N4kRJ399xubgOckZGCpScyHFhe4LFXg
   ```
7. Deploy

**Opción B - Backend separado**
1. Crea DOS aplicaciones en Coolify
2. **Backend:**
   - Framework: **Node.js**
   - Build: `npm install`
   - Start: `npm run server`
   - Puerto: `3000`
   - Variables de entorno (iguales)
3. **Frontend:**
   - Framework: **Node.js**
   - Build: `npm install && npm run build`
   - Start: `npm run preview`
   - Variables de entorno (iguales)

✅ **Deployado en Coolify**

---

## 🎯 Resumen de cambios

### Archivos Nuevos:
```
✅ .env.local
✅ server.ts
✅ migrate-to-supabase.ts
✅ supabase-schema.sql
✅ src/lib/supabase.ts
✅ SETUP_SUPABASE.md
✅ SUPABASE_MIGRATION.md
```

### Archivos Modificados:
```
✅ package.json - Agregados scripts y dependencias
✅ src/pages/Index.tsx - Ahora carga datos desde Supabase
✅ src/components/Sidebar.tsx - Categorías dinámicas
```

---

## 📝 Notas Importantes

1. **No necesitas PHP** en Coolify
2. **`.env.local` tiene credenciales** - Agregalo a `.gitignore` si lo haces público
3. **Frontend conecta directamente a Supabase** - No necesitas backend para solo lectura
4. **La tabla tiene RLS** - Solo permite lectura pública
5. **Música en `/public/audio/`** - Asegúrate de deployar la carpeta

---

## 🚀 Estado Actual

| Componente | Estado |
|-----------|--------|
| Base de datos | ⏳ Pendiente (crear tabla en Supabase) |
| Código | ✅ Completado |
| Dependencias | ⏳ Pendiente (bun install) |
| Datos | ⏳ Pendiente (bun migrate) |
| Servidor | ✅ Opcional - Incluido |
| Frontend | ✅ Actualizado |
| Deployment | ⏳ Pendiente |

---

¡Sigue el checklist arriba y estará listo en ~15 minutos! 🎉
