'use strict';

function getFormData() {
  var data = {
    fecha: document.getElementById('fecha').value,
    equipo: document.getElementById('equipo').value.trim(),
    tecnico: document.getElementById('tecnico').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    horometro: document.getElementById('horometro').value,
    intervalo: document.getElementById('intervalo').value,
    proximo: document.getElementById('proximo').value,
    ubicacion: document.getElementById('ubicacion').value.trim(),
    orden: document.getElementById('orden').value.trim(),
    estado: document.getElementById('estado').value,
    observaciones: document.getElementById('observaciones').value.trim(),
    tasks: [],
    spareParts: [],
    photos: [],
    signatures: []
  };

  var tbody = document.getElementById('maintBody');
  var rows = tbody.querySelectorAll('tr:not(.section-row)');
  rows.forEach(function (row) {
    var select = row.querySelector('.task-result');
    var obsInput = row.querySelector('.task-obs');
    data.tasks.push({
      name: row.dataset.name || '',
      partNumber: row.querySelector('.task-part') ? row.querySelector('.task-part').value : '',
      quantity: row.querySelector('.task-qty') ? row.querySelector('.task-qty').value : '',
      result: select ? select.value : '',
      obs: obsInput ? obsInput.value.trim() : ''
    });
  });

  var spareRows = document.querySelectorAll('.spare-part-row');
  spareRows.forEach(function (row) {
    var nameInput = row.querySelector('.spare-name');
    var partInput = row.querySelector('.spare-part');
    var qtyInput = row.querySelector('.spare-qty');
    if (nameInput && nameInput.value.trim()) {
      data.spareParts.push({
        name: nameInput.value.trim(),
        partNumber: partInput ? partInput.value.trim() : '',
        quantity: qtyInput ? qtyInput.value.trim() : ''
      });
    }
  });

  window.PHOTOS.forEach(function (p) {
    var img = document.getElementById('preview-' + p.id);
    data.photos.push({
      id: p.id,
      label: p.label,
      data: img && img.src ? img.src : null
    });
  });

  window.SIGNATURES.forEach(function (s) {
    var canvas = document.getElementById(s.id);
    data.signatures.push({
      id: s.id,
      label: s.label,
      data: canvas && canvas.toDataURL ? canvas.toDataURL('image/png') : null
    });
  });

  return data;
}

function validateForm() {
  var errors = [];
  var firstError = null;

  var fields = [
    { id: 'fecha', label: 'Fecha' },
    { id: 'equipo', label: 'Número de equipo' },
    { id: 'tecnico', label: 'Técnico responsable' },
    { id: 'horometro', label: 'Horómetro actual' },
    { id: 'estado', label: 'Estado general' }
  ];

  fields.forEach(function (f) {
    var el = document.getElementById(f.id);
    var val = el.value ? el.value.trim() : '';
    if (!val) {
      errors.push(f.label);
      el.classList.add('field-error');
      if (!firstError) firstError = el;
    } else {
      el.classList.remove('field-error');
    }
  });

  var tbody = document.getElementById('maintBody');
  var rows = tbody.querySelectorAll('tr:not(.section-row)');
  var pendingTasks = 0;
  rows.forEach(function (row) {
    var select = row.querySelector('.task-result');
    if (select) {
      if (!select.value) {
        select.classList.add('field-error');
        pendingTasks++;
        if (!firstError) firstError = select;
      } else {
        select.classList.remove('field-error');
      }
    }
  });

  if (pendingTasks > 0) {
    errors.push(pendingTasks + ' resultado(s) de actividad(es) sin completar');
  }

  if (errors.length > 0) {
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (firstError.tagName === 'SELECT') {
        firstError.focus();
      } else {
        firstError.focus();
      }
    }
    return { valid: false, errors: errors };
  }

  return { valid: true, errors: [] };
}

function getStatusColor(value) {
  switch (value) {
    case 'SÍ': return [26, 122, 26];
    case 'NO': return [204, 0, 0];
    case 'N/A': return [102, 102, 102];
    case 'PENDIENTE': return [184, 134, 11];
    default: return [0, 0, 0];
  }
}

function safeRoundedRect(doc, x, y, width, height, radius = 2, style = 'S') {
  var nx = Number(x);
  var ny = Number(y);
  var nw = Number(width);
  var nh = Number(height);
  var nr = Number(radius);

  if (
    !Number.isFinite(nx) ||
    !Number.isFinite(ny) ||
    !Number.isFinite(nw) ||
    !Number.isFinite(nh) ||
    nw <= 0 ||
    nh <= 0
  ) {
    console.warn('roundedRect omitido por dimensiones inválidas', {
      x: x,
      y: y,
      width: width,
      height: height,
      radius: radius,
      style: style
    });
    return;
  }

  var safeRadius = Number.isFinite(nr)
    ? Math.max(0, Math.min(nr, nw / 2, nh / 2))
    : 0;

  doc.roundedRect(nx, ny, nw, nh, safeRadius, safeRadius, style);
}

function safeText(doc, text, x, y, options) {
  var safeTextValue = text;

  if (text === null || text === undefined) {
    safeTextValue = '';
  } else if (typeof text !== 'string' && !Array.isArray(text)) {
    safeTextValue = String(text);
  }

  var nx = Number(x);
  var ny = Number(y);

  if (!Number.isFinite(nx) || !Number.isFinite(ny)) {
    console.warn('text omitido por coordenadas inválidas', {
      text: text,
      x: x,
      y: y,
      options: options
    });
    return;
  }

  if (options) {
    doc.text(safeTextValue, nx, ny, options);
  } else {
    doc.text(safeTextValue, nx, ny);
  }
}

function generatePdf(data) {
  return new Promise(function (resolve, reject) {
    try {
      var doc = new jspdf.jsPDF('p', 'mm', 'a4');
      var pageWidth = doc.internal.pageSize.getWidth();
      var pageHeight = doc.internal.pageSize.getHeight();
      var margin = 15;
      var contentWidth = pageWidth - 2 * margin;
      var y = margin;

      function addPageIfNeeded(needed) {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      }

      function addHeaderAndFooter() {
        var pageCount = doc.getNumberOfPages();
        for (var i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          // Header line
          doc.setDrawColor(23, 54, 93);
          doc.setLineWidth(0.5);
          doc.line(margin, margin - 5, pageWidth - margin, margin - 5);

          // Footer
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          var eqText = data.equipo || 'S/N';
          safeText(doc, eqText + ' | ' + data.fecha, margin, pageHeight - 8);
          safeText(doc, 'Página ' + i + ' de ' + pageCount, pageWidth - margin, pageHeight - 8, { align: 'right' });
        }
        doc.setPage(doc.getCurrentPageInfo().pageNumber || 1);
      }

      // ===== TITLE =====
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(23, 54, 93);
      safeText(doc, 'PAUTA DE MANTENIMIENTO', pageWidth / 2, y, { align: 'center' });
      y += 7;

      doc.setFontSize(13);
      doc.setTextColor(47, 117, 181);
      safeText(doc, 'LINCOLN VANTAGE 500', pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Horizontal line
      doc.setDrawColor(23, 54, 93);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // ===== DATOS GENERALES =====
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(23, 54, 93);

      addPageIfNeeded(20);
      safeText(doc, 'DATOS GENERALES', margin, y);
      y += 1;

      var generalData = [
        ['Fecha', data.fecha || '—', 'N° de equipo', data.equipo || '—'],
        ['Técnico', data.tecnico || '—', 'Estado general', data.estado || '—'],
        ['Horómetro', data.horometro || '—', 'Próximo mantenimiento', data.proximo || '—'],
        ['Ubicación', data.ubicacion || '—', 'Orden / OT', data.orden || '—'],
        ['Intervalo', data.intervalo || '—', 'Correo de destino', data.correo || '—']
      ];

      doc.autoTable({
        startY: y + 1,
        head: [],
        body: generalData,
        theme: 'grid',
        tableWidth: contentWidth,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8.5,
          cellPadding: 2.5,
          lineColor: [80, 80, 80],
          lineWidth: 0.3
        },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.18, fontStyle: 'bold', fillColor: [240, 240, 240] },
          1: { cellWidth: contentWidth * 0.32 },
          2: { cellWidth: contentWidth * 0.18, fontStyle: 'bold', fillColor: [240, 240, 240] },
          3: { cellWidth: contentWidth * 0.32 }
        },
        headStyles: { fillColor: [23, 54, 93], textColor: [255, 255, 255] },
        didParseCell: function (cellData) {
          if (cellData.section === 'head' && cellData.column === 0) {
            cellData.cell.text = 'DATOS GENERALES';
            cellData.colSpan = 4;
          }
        }
      });

      y = doc.lastAutoTable.finalY + 8;

      // ===== ACTIVIDADES DE MANTENIMIENTO =====
      addPageIfNeeded(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(23, 54, 93);
      safeText(doc, 'ACTIVIDADES DE MANTENIMIENTO', margin, y);
      y += 4;

      var activityRows = [];
      window.TASKS.forEach(function (section) {
        activityRows.push({ type: 'section', text: section.section, bold: true });
        section.items.forEach(function (item) {
          var found = null;
          data.tasks.forEach(function (t) {
            if (t.name === item.name) found = t;
          });
          activityRows.push({
            type: 'row',
            name: item.name,
            part: item.partNumber,
            qty: item.quantity,
            result: found ? found.result : '',
            obs: found ? found.obs : ''
          });
        });
      });

      var tableBody = [];
      activityRows.forEach(function (r) {
        if (r.type === 'section') {
          tableBody.push([{ content: r.text, colSpan: 5, styles: { fillColor: [47, 117, 181], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }]);
        } else {
          var resultColor = getStatusColor(r.result);
          tableBody.push([
            r.name,
            r.part || '',
            r.qty || '',
            { content: r.result || '', styles: r.result ? { textColor: resultColor, fontStyle: 'bold', fontSize: 8.5 } : { fontSize: 8.5 } },
            r.obs || ''
          ]);
        }
      });

      if (tableBody.length > 0) {
        doc.autoTable({
          startY: y,
          head: [['Actividad / control', 'N° de parte', 'Cant.', 'Resultado', 'Observación']],
          body: tableBody,
          theme: 'grid',
          tableWidth: contentWidth,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 7.5,
            cellPadding: 2,
            lineColor: [100, 100, 100],
            lineWidth: 0.3,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.38 },
            1: { cellWidth: contentWidth * 0.14 },
            2: { cellWidth: contentWidth * 0.08 },
            3: { cellWidth: contentWidth * 0.14 },
            4: { cellWidth: contentWidth * 0.26 }
          },
          headStyles: {
            fillColor: [23, 54, 93],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.5
          },
          didParseCell: function (cellData) {
            if (cellData.section === 'head') {
              cellData.cell.styles.halign = 'center';
            }
            if (cellData.section === 'body') {
              if (cellData.column.index === 3) {
                cellData.cell.styles.halign = 'center';
              }
              if (cellData.column.index === 2) {
                cellData.cell.styles.halign = 'center';
              }
            }
          }
        });

        y = doc.lastAutoTable.finalY + 8;
      }

      // ===== OBSERVACIONES GENERALES =====
      addPageIfNeeded(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(23, 54, 93);
      safeText(doc, 'OBSERVACIONES GENERALES', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      var obsLines = doc.splitTextToSize(data.observaciones || 'Sin observaciones.', contentWidth - 4);
      doc.rect(margin, y - 3, contentWidth, Math.max(20, obsLines.length * 4 + 6));
      safeText(doc, obsLines, margin + 2, y);
      y += Math.max(20, obsLines.length * 4 + 6) + 5;

      // ===== REPUESTOS ADICIONALES =====
      if (data.spareParts && data.spareParts.length > 0) {
        addPageIfNeeded(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(23, 54, 93);
        safeText(doc, 'REPUESTOS ADICIONALES', margin, y);
        y += 4;

        var spBody = data.spareParts.map(function (sp) {
          return [sp.name, sp.partNumber || '—', sp.quantity || '—'];
        });

        doc.autoTable({
          startY: y,
          head: [['Repuesto', 'N° de parte', 'Cantidad']],
          body: spBody,
          theme: 'grid',
          tableWidth: contentWidth,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [100, 100, 100],
            lineWidth: 0.3
          },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.5 },
            1: { cellWidth: contentWidth * 0.3 },
            2: { cellWidth: contentWidth * 0.2 }
          },
          headStyles: {
            fillColor: [23, 54, 93],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8
          }
        });

        y = doc.lastAutoTable.finalY + 8;
      }

      // ===== FOTOGRAFÍAS =====
      var hasPhotos = data.photos.some(function (p) { return p.data; });
      if (hasPhotos) {
        addPageIfNeeded(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(23, 54, 93);
        safeText(doc, 'REGISTRO FOTOGRÁFICO', margin, y);
        y += 6;

        var photoCols = 2;
        var photoMargin = 3;
        var photoW = (contentWidth - photoMargin) / photoCols;
        var photoH = photoW * 0.7;
        var col = 0;

        data.photos.forEach(function (p) {
          if (p.data) {
            addPageIfNeeded(photoH + 15);
            var px = margin + col * (photoW + photoMargin);
            var py = y;

            doc.setDrawColor(180, 180, 180);
            doc.setFillColor(245, 245, 245);
            safeRoundedRect(doc, px, py, photoW, photoH, 2, 'FD');

            try {
              doc.addImage(p.data, 'JPEG', px + 2, py + 2, photoW - 4, photoH - 14);
            } catch (e) {
              // image failed
            }

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            doc.setTextColor(80, 80, 80);
            safeText(doc, p.label, px + photoW / 2, py + photoH - 3, { align: 'center' });

            col++;
            if (col >= photoCols) {
              col = 0;
              y += photoH + 5;
            }
          }
        });

        if (col > 0) y += photoH + 5;
        y += 3;
      }

      // ===== FIRMAS =====
      addPageIfNeeded(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(23, 54, 93);
      safeText(doc, 'FIRMAS', margin, y);
      y += 6;

      var sigCols = 2;
      var sigW = (contentWidth - photoMargin) / sigCols;
      var sigH = 35;

      for (var si = 0; si < data.signatures.length; si++) {
        var sig = data.signatures[si];
        var sc = si % sigCols;
        var sx = margin + sc * (sigW + photoMargin);
        var sy = y + Math.floor(si / sigCols) * (sigH + 15);

        addPageIfNeeded(sigH + 20);

        doc.setDrawColor(180, 180, 180);
        safeRoundedRect(doc, sx, sy, sigW, sigH, 2, 'S');

        if (sig.data) {
          try {
            doc.addImage(sig.data, 'PNG', sx + 2, sy + 2, sigW - 4, sigH - 4);
          } catch (e) {
            // signature failed
          }
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        safeText(doc, sig.label, sx + sigW / 2, sy + sigH + 5, { align: 'center' });
      }

      y = y + Math.ceil(data.signatures.length / sigCols) * (sigH + 15) + 5;

      // Add header and footer to all pages
      addHeaderAndFooter();

      // ===== Generate output =====
      var pdfDataUri = doc.output('datauristring');
      var pdfBlob = doc.output('blob');
      var safeEquipo = (data.equipo || 'SIN-EQUIPO').replace(/[^a-zA-Z0-9_-]/g, '_');
      var safeFecha = data.fecha || new Date().toISOString().split('T')[0];
      var filename = 'Pauta_' + safeEquipo + '_' + safeFecha + '.pdf';

      resolve({
        doc: doc,
        dataUri: pdfDataUri,
        blob: pdfBlob,
        filename: filename
      });
    } catch (err) {
      reject(err);
    }
  });
}
