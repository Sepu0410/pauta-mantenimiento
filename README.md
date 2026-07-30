# Pauta de Mantenimiento

Aplicación web estática para completar pautas de mantenimiento del equipo **Lincoln Vantage 500**, optimizada para tablet y teléfono. Reemplaza una pauta de Excel sin necesidad de macros, Power Apps o servidores.

## Requisitos

- Navegador moderno (Chrome, Edge, Safari, Firefox).
- Opcional: Python 3 para servidor local.

## Cómo ejecutar

```bash
# Con Python 3
python -m http.server 8080

# O con PowerShell (Windows)
powershell -Command "Start-Process 'http://localhost:8080'"

# Luego abrir en el navegador:
# http://localhost:8080
```

También puedes usar cualquier servidor estático (Live Server de VS Code, http-server de Node, etc.).

## Cómo probarlo localmente

1. Ejecuta `python -m http.server 8080` en la raíz del proyecto.
2. Abre `http://localhost:8080` en el navegador.
3. Completa algunos campos, toma fotos de prueba, firma.
4. Haz clic en "Descargar PDF" para verificar la generación.

## Cómo publicarlo

La aplicación es 100% estática. Puedes subirla a:

- **GitHub Pages**: sube los archivos a un repositorio y habilita GitHub Pages.
- **Netlify**: arrastra la carpeta a Netlify Drop.
- **Vercel**: conecta el repositorio o sube la carpeta.
- **Cualquier hosting estático**: copia los archivos al servidor.

No se necesita compilación ni configuración especial.

## Cómo instalarlo en la tablet (PWA)

1. Abre la aplicación en Chrome o Edge.
2. Presiona el menú (tres puntos) → "Instalar aplicación" / "Agregar a pantalla de inicio".
3. La aplicación se abrirá en modo standalone sin la barra del navegador.
4. Después de la primera carga, funciona offline.

## Cómo configurar EmailJS

1. Crea una cuenta en [EmailJS](https://www.emailjs.com/).
2. Conecta un servicio de correo (Gmail, Outlook, etc.).
3. Crea una plantilla con las variables: `to_email`, `subject`, `message`, `attachment`, `filename`.
4. Copia tu Public Key, Service ID y Template ID.
5. Abre `config.js` y actualiza:

```js
window.EMAIL_CONFIG = {
  enabled: true,
  publicKey: "TU_PUBLIC_KEY",
  serviceId: "TU_SERVICE_ID",
  templateId: "TU_TEMPLATE_ID",
  toEmailParameter: "to_email",
  subjectParameter: "subject",
  messageParameter: "message",
  attachmentParameter: "attachment",
  filenameParameter: "filename"
};
```

6. Agrega el SDK de EmailJS en `index.html` antes de `config.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

**Importante**: No subas claves privadas a repositorios públicos.

## Cómo funciona el botón Compartir

Usa la **Web Share API** del navegador. Al presionar "Compartir PDF":

1. Genera el PDF en segundo plano.
2. Crea un objeto `File` con el PDF.
3. Abre el menú de compartir del sistema.
4. Permite seleccionar Gmail, WhatsApp, Drive, etc.

Si el navegador no soporta compartir archivos, descarga automáticamente el PDF.

## Cómo modificar las actividades

Las actividades están definidas en `config.js` dentro de la constante `window.TASKS`. Puedes:

- Agregar, quitar o modificar secciones.
- Cambiar números de parte y cantidades.
- Modificar las opciones de resultado en `window.RESULTS_OPTIONS`.

Después de modificar `config.js`, recarga la página.

## Cómo funciona el borrador

- Los datos se guardan automáticamente en `localStorage` 800 ms después de cada cambio.
- Al recargar la página, el borrador se recupera automáticamente.
- El indicador en el encabezado muestra "Guardando…", "Guardado HH:MM", "Borrador recuperado".
- Al presionar "Limpiar pauta" se elimina el borrador.
- Las fotografías se comprimen a 1200 px como JPEG antes de guardarse.
- Las firmas se guardan solo si tienen contenido dibujado.

## Estructura del proyecto

```
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos CSS responsive
├── app.js              # Lógica de la aplicación
├── pdf.js              # Generación de PDF con jsPDF
├── config.js           # Configuración y constantes
├── sw.js               # Service Worker (PWA offline)
├── manifest.webmanifest # Manifiesto PWA
├── README.md           # Este archivo
├── AGENTS.md           # Guía para agentes OpenCode
└── icons/
    ├── icon-192.png    # Icono 192x192
    └── icon-512.png    # Icono 512x512
```

## Licencia

Uso interno.
