'use strict';

window.EMAIL_CONFIG = {
  enabled: false,
  publicKey: 'TU_PUBLIC_KEY',
  serviceId: 'TU_SERVICE_ID',
  templateId: 'TU_TEMPLATE_ID',
  toEmailParameter: 'to_email',
  subjectParameter: 'subject',
  messageParameter: 'message',
  attachmentParameter: 'attachment',
  filenameParameter: 'filename'
};

window.TASKS = [
  {
    section: 'INDICACIONES INICIALES',
    items: [
      { name: 'Inspección antes de lavado', partNumber: '', quantity: '' },
      { name: 'Lavado completo del equipo', partNumber: '', quantity: '' },
      { name: 'Inspección posterior al lavado', partNumber: '', quantity: '' }
    ]
  },
  {
    section: 'MOTOR',
    items: [
      { name: 'Cambio de filtro de aceite del motor', partNumber: 'W712/19', quantity: '1' },
      { name: 'Cambio de filtro de aire', partNumber: 'C13149', quantity: '1' },
      { name: 'Cambio de filtro de combustible', partNumber: 'WK731', quantity: '1' },
      { name: 'Cambio de filtro de línea de combustible', partNumber: 'FF-149', quantity: '1' },
      { name: 'Cambio de correa de accesorios', partNumber: '1179564', quantity: '1' }
    ]
  },
  {
    section: 'CARROCERÍA',
    items: [
      { name: 'Lavado y pintura exterior', partNumber: '', quantity: '' },
      { name: 'Instalación de cinta reflectante', partNumber: '', quantity: '' }
    ]
  },
  {
    section: 'SISTEMA ELÉCTRICO',
    items: [
      { name: 'Revisión de batería', partNumber: '', quantity: '' },
      { name: 'Revisión de salida del transformador', partNumber: '', quantity: '' },
      { name: 'Revisión de conexiones eléctricas', partNumber: '', quantity: '' },
      { name: 'Revisión de indicadores y medidores', partNumber: '', quantity: '' },
      { name: 'Limpieza de tarjetas de circuitos impresos', partNumber: '', quantity: '' },
      { name: 'Soplado y limpieza dieléctrica de circuitos', partNumber: '', quantity: '' }
    ]
  }
];

window.RESULTS_OPTIONS = ['SÍ', 'NO', 'N/A', 'PENDIENTE'];

window.PHOTOS = [
  { id: 'photo1', label: 'Foto 1 — Antes' },
  { id: 'photo2', label: 'Foto 2 — Durante' },
  { id: 'photo3', label: 'Foto 3 — Después' },
  { id: 'photo4', label: 'Foto 4 — Hallazgos' }
];

window.SIGNATURES = [
  { id: 'sig-tech', label: 'Firma técnico' },
  { id: 'sig-sup', label: 'Firma supervisor / cliente' }
];

window.STORAGE_KEY = 'pauta_mantenimiento_borrador';
window.HISTORY_KEY = 'pauta_mantenimiento_historial';
window.EMAIL_KEY = 'pauta_mantenimiento_email';
window.MAX_HISTORY = 20;
