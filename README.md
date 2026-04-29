# ⚜️ Scout Music

Scout Music es una plataforma de streaming musical diseñada específicamente para el movimiento scout. Inspirada en la fluidez y estética inmersiva de plataformas modernas, esta aplicación busca revolucionar la forma en que los grupos, como el Grupo Scout Cóndores 123, acceden, comparten y disfrutan de sus himnos, canciones de marcha y cantos de fogata.

## 🚀 Características Principales

* **🎧 Reproductor Global Persistente:** La música nunca se detiene. Navega por toda la aplicación explorando diferentes álbumes mientras tu canción sigue sonando, sin recargas de página ni cortes en el audio.
* **🔗 Enlaces Compartibles (Deep Linking):** Al reproducir una pista, la URL se sincroniza instantáneamente (`/song/[id]`). Copia y comparte el enlace de cualquier canción a tus patrullas y equipos sin interrumpir tu experiencia de escucha.
* **🏕️ Modo PWA y Caché Offline:** Construida para la vida al aire libre. La aplicación funciona como una Progressive Web App, permitiendo descargar música en caché para reproducir los himnos en campamentos o montañas donde no hay cobertura de internet.
* **✨ Interfaz Inmersiva (Glassmorphism):** El entorno visual de la aplicación reacciona a la música. El fondo extrae automáticamente los colores predominantes de la portada del álbum actual, difuminándolos bajo una capa de cristal esmerilado para una experiencia premium.
* **🎤 Letras Sincronizadas (Modo Karaoke):** Soporte para letras dinámicas mediante archivos `.lrc`. Las líneas se iluminan al ritmo de la música, facilitando que los miembros más nuevos aprendan las canciones.
* **🎸 Modo Fogata (Acordes Interactivos):** Cambia a la vista de acordes sin salir del reproductor. Ideal para el guitarrista del grupo, con futuras capacidades para transponer tonos en tiempo real.

## 🛠️ Stack Tecnológico

El proyecto está construido sobre un ecosistema moderno y escalable:

* **Framework:** [Next.js](https://nextjs.org/) (App Router) y React.
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (para layouts rápidos y utilidades de *backdrop-blur*).
* **Gestor de Estado:** [Zustand](https://github.com/pmndrs/zustand) (manejo del reproductor global y la cola de reproducción).
* **Procesamiento de Imágenes:** Librerías de cliente para extracción de color dominante (ej. `colorthief-react`).

## 🗂️ Estructura de Datos (Core)

La arquitectura relacional abandona las categorías simples para adoptar un modelo nativo de consumo musical:

* **Álbumes:** Agrupaciones (ej. *Himnos Oficiales*, *Cantos de Fogata Vol. 1*) con metadatos de año y arte de portada.
* **Canciones:** Entidades vinculadas a un álbum mediante llaves foráneas, conteniendo la URL del audio, la duración y los archivos de sincronización de letra/acordes.

## 💻 Instalación y Desarrollo Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/Loaizan63/scout-music.git](https://github.com/Loaizan63/scout-music.git)
    cd scout-music
    ```

2.  **Instalar las dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar las variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto. Deberás configurar tus credenciales de Supabase (o tu base de datos de preferencia):
    ```env
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    ADMIN_PASSWORD=
    ```

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación en acción.

---
*Hecho para mantener viva la tradición, línea por línea de código.*
