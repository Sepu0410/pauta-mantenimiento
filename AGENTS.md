# AGENTS.md - Pauta de Mantenimiento

## Reglas del proyecto

- **Sin frameworks**: El proyecto debe permanecer en HTML, CSS y JavaScript puro. No usar React, Vue, Angular, TypeScript ni herramientas que requieran compilación.
- **No eliminar funciones de cámara**: Los inputs `capture="environment"` y `accept="image/*"` deben mantenerse. La compresión mediante canvas (1200 px, JPEG) es obligatoria.
- **Sin claves privadas en el código**: No incluir API keys ni secretos. EmailJS usa `config.js` con valores placeholder.
- **EmailJS opcional**: La app debe funcionar completamente sin EmailJS. El botón "Enviar por correo" usa Web Share API cuando EmailJS está deshabilitado.
- **Descarga y compartir sin EmailJS**: Los botones "Descargar PDF" y "Compartir PDF" deben funcionar sin depender de EmailJS.
- **Compatibilidad con tablet**: El diseño debe ser responsive. Puntos de quiebre en 768px y 480px. Campos de mínimo 48 px en móvil.
- **Probar generación de PDF**: Cualquier modificación debe verificar que `generatePdf()` en `pdf.js` sigue funcionando (sin errores, el PDF se genera correctamente).
- **Actividades en TASKS**: Las actividades de mantenimiento están en `config.js` como `window.TASKS`. No hardcodear actividades en otros archivos.
- **Fotos en PHOTOS**: Las definiciones de fotos están en `config.js` como `window.PHOTOS`. No hardcodear en HTML.
- **Persistencia del correo**: El campo "Correo de destino" se guarda permanentemente en localStorage (clave `EMAIL_KEY`) y no se borra al limpiar la pauta.
- **Historial local**: Las últimas 20 pautas se guardan en localStorage (clave `HISTORY_KEY`). El historial se actualiza al generar un PDF.
- **No usar alert()**: Usar el sistema de toast en `app.js` para notificaciones.

## Archivos principales

| Archivo | Propósito |
|---------|-----------|
| `index.html` | Estructura HTML semántica |
| `styles.css` | Estilos responsive, Excel-like industrial |
| `app.js` | Lógica de formulario, canvas, fotos, auto-guardado, historial |
| `pdf.js` | Generación de PDF con jsPDF y AutoTable |
| `config.js` | Constantes TASKS, PHOTOS, RESULTS_OPTIONS, EMAIL_CONFIG |
| `sw.js` | Service Worker para offline |
| `manifest.webmanifest` | Manifiesto PWA |

## Funciones clave en pdf.js

- `getFormData()`: Recolecta todos los datos del formulario.
- `validateForm()`: Valida campos obligatorios.
- `generatePdf(data)`: Genera el PDF, devuelve `{doc, dataUri, blob, filename}`.

## Funciones clave en app.js

- `renderTasks()`: Dibuja la tabla de actividades desde `TASKS`.
- `handlePhotoSelect()`: Captura y comprime imágenes.
- `compressImage()`: Redimensiona a 1200 px, formato JPEG.
- `initSignaturePad()`: Inicializa canvas de firma con Pointer Events.
- `saveDraft()`: Guarda en localStorage.
- `loadDraft()`: Recupera borrador de localStorage.
- `scheduleAutoSave()`: Auto-guardado con debounce de 800 ms.
- `handleSharePdf()`: Web Share API + fallback de descarga.
- `handleDownloadPdf()`: Descarga directa.
- `handleSendEmail()`: EmailJS o Web Share según configuración.
- `handleClear()`: Limpia formulario (preserva correo e intervalo).
- `handleDuplicate()`: Duplica última pauta del historial.
- `addToHistory()`: Agrega pauta al historial local.
- Toast: `showToast(message, type)`.
- Confirm: `showConfirm(title, message, callback)`.

## CSS

- Azul oscuro: `#17365d`
- Azul: `#2f75b5`
- Fondo: `#e8eaed`
- Campos editables: `#fffbc8` (amarillo Excel)
- Botón éxito: `#2d8f2d`
- Botón peligro: `#c00`

## Notas

- La generación del PDF se parchea en `app.js` para agregar automáticamente al historial.
- Al duplicar una pauta, solo se copian equipo, técnico, ubicación, orden y repuestos. No se copian resultados, fotos ni firmas.
- Los resultados visuales (colores en selects) se aplican mediante clases CSS: `result-yes`, `result-no`, `result-na`, `result-pending`.
