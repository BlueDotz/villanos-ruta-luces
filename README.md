# Villanos & Malvados — Ruta de las Luces 2026

Web para elegir disfraces de villanos en grupo: galería con fotos, propuestas,
encuesta de 3 opciones por persona y resultados en tiempo real.

## Cómo desplegarla (sin tocar código, en dos pasos)

### 1. Sube esta carpeta a GitHub

1. Ve a https://github.com y crea una cuenta gratis si no tienes.
2. Pulsa el botón verde **"New"** para crear un repositorio nuevo.
3. Ponle un nombre, por ejemplo `villanos-ruta-luces`, y pulsa **"Create repository"**.
4. En la página del repositorio, pulsa **"uploading an existing file"**.
5. Arrastra TODOS los archivos y carpetas de este paquete (excepto `node_modules`
   si lo hubiera) a esa zona.
6. Pulsa **"Commit changes"**.

### 2. Despliega en Render

1. Ve a https://render.com y crea una cuenta gratis (puedes usar tu cuenta de GitHub para entrar directamente).
2. Pulsa **"New +"** → **"Web Service"**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio que acabas de crear.
4. En la configuración:
   - **Name**: lo que quieras, por ejemplo `villanos-ruta-luces`.
   - **Region**: la más cercana (Frankfurt para España).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Pulsa **"Create Web Service"**.
6. Espera 1-2 minutos mientras Render instala y arranca la web.
7. Cuando termine, arriba verás la URL pública (algo como
   `https://villanos-ruta-luces.onrender.com`). Ese es el enlace para compartir
   con el grupo.

## Importante

- Los datos (votos, fotos, propuestas) se guardan en un archivo dentro del
  propio servidor. **No hace falta que nadie tenga cuenta de nada** para ver
  la web ni para votar.
- El plan gratuito de Render "duerme" la web tras un rato sin uso, y tarda
  unos 20-30 segundos en despertar la primera vez que alguien entra después de
  un tiempo. Es normal, no es un fallo.
- Si en algún momento hay que cambiar el código (añadir un villano, ajustar
  algo del diseño...), pide el archivo actualizado, súbelo de nuevo a GitHub
  (mismo proceso: "Add file" → "Upload files") y Render lo desplegará solo.
  Esto **no borra** los votos ni las fotos guardadas, porque viven en un
  archivo aparte del código.
