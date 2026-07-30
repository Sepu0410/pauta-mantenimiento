'use strict';

(function () {
  // ===== DOM REFS =====
  var fecha = document.getElementById('fecha');
  var equipo = document.getElementById('equipo');
  var tecnico = document.getElementById('tecnico');
  var correo = document.getElementById('correo');
  var horometro = document.getElementById('horometro');
  var intervalo = document.getElementById('intervalo');
  var proximo = document.getElementById('proximo');
  var ubicacion = document.getElementById('ubicacion');
  var orden = document.getElementById('orden');
  var estado = document.getElementById('estado');
  var observaciones = document.getElementById('observaciones');
  var maintBody = document.getElementById('maintBody');
  var photoGrid = document.getElementById('photoGrid');
  var signatureGrid = document.getElementById('signatureGrid');
  var sparePartsList = document.getElementById('sparePartsList');
  var addSparePartBtn = document.getElementById('addSparePartBtn');
  var statusIndicator = document.getElementById('statusIndicator');
  var loadingOverlay = document.getElementById('loadingOverlay');
  var loadingMessage = document.getElementById('loadingMessage');
  var confirmModal = document.getElementById('confirmModal');
  var confirmTitle = document.getElementById('confirmTitle');
  var confirmMessage = document.getElementById('confirmMessage');
  var confirmOkBtn = document.getElementById('confirmOkBtn');
  var confirmCancelBtn = document.getElementById('confirmCancelBtn');
  var saveDraftBtn = document.getElementById('saveDraftBtn');
  var sharePdfBtn = document.getElementById('sharePdfBtn');
  var downloadPdfBtn = document.getElementById('downloadPdfBtn');
  var emailBtn = document.getElementById('emailBtn');
  var duplicateBtn = document.getElementById('duplicateBtn');
  var clearBtn = document.getElementById('clearBtn');
  var historyList = document.getElementById('historyList');
  var clearHistoryBtn = document.getElementById('clearHistoryBtn');
  var toastContainer = document.getElementById('toastContainer');

  // ===== STATE =====
  var signatureData = {};
  var autoSaveTimer = null;
  var confirmCallback = null;

  // ===== HELPERS =====
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function timeStr() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  // ===== TOAST =====
  function showToast(message, type) {
    type = type || 'info';
    var icons = { success: '\u2713', error: '\u2717', info: '\u2139', warning: '\u26A0' };
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span>' + (icons[type] || '') + '</span> ' + escapeHtml(message);
    toastContainer.appendChild(toast);
    setTimeout(function () {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
      }
    }, 4000);
  }

  // ===== STATUS INDICATOR =====
  function setStatus(text) {
    statusIndicator.textContent = text;
  }

  function showSaving() {
    setStatus('Guardando\u2026');
  }

  function showSaved() {
    setStatus('Guardado ' + timeStr());
  }

  function showRecovered() {
    setStatus('Borrador recuperado');
  }

  function showUnsaved() {
    setStatus('Borrador sin guardar');
  }

  // ===== LOADING OVERLAY =====
  function showLoading(msg) {
    msg = msg || 'Generando PDF\u2026';
    loadingMessage.textContent = msg;
    loadingOverlay.classList.add('active');
  }

  function hideLoading() {
    loadingOverlay.classList.remove('active');
  }

  // ===== CONFIRM DIALOG =====
  function showConfirm(title, message, callback) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmModal.classList.add('active');
    confirmCallback = callback;
  }

  function hideConfirm() {
    confirmModal.classList.remove('active');
    confirmCallback = null;
  }

  confirmOkBtn.addEventListener('click', function () {
    if (confirmCallback) confirmCallback(true);
    hideConfirm();
  });

  confirmCancelBtn.addEventListener('click', function () {
    if (confirmCallback) confirmCallback(false);
    hideConfirm();
  });

  confirmModal.addEventListener('click', function (e) {
    if (e.target === confirmModal) {
      if (confirmCallback) confirmCallback(false);
      hideConfirm();
    }
  });

  // ===== PROXIMO CALC =====
  function calcProximo() {
    var h = parseFloat(horometro.value) || 0;
    var i = parseFloat(intervalo.value) || 250;
    proximo.value = h + i;
  }

  horometro.addEventListener('input', calcProximo);
  intervalo.addEventListener('input', calcProximo);

  // ===== RENDER TASKS TABLE =====
  function renderTasks() {
    maintBody.innerHTML = '';
    window.TASKS.forEach(function (section) {
      var secRow = document.createElement('tr');
      secRow.className = 'section-row';
      var secCell = document.createElement('td');
      secCell.setAttribute('colspan', '5');
      secCell.textContent = 'SECCI\u00D3N: ' + section.section;
      secRow.appendChild(secCell);
      maintBody.appendChild(secRow);

      section.items.forEach(function (item) {
        var row = document.createElement('tr');
        row.dataset.name = item.name;

        // Activity name
        var tdName = document.createElement('td');
        tdName.className = 'activity-name';
        tdName.textContent = item.name;
        row.appendChild(tdName);

        // Part number
        var tdPart = document.createElement('td');
        var partInput = document.createElement('input');
        partInput.type = 'text';
        partInput.className = 'task-part';
        partInput.value = item.partNumber || '';
        partInput.placeholder = 'N° parte';
        tdPart.appendChild(partInput);
        row.appendChild(tdPart);

        // Quantity
        var tdQty = document.createElement('td');
        var qtyInput = document.createElement('input');
        qtyInput.type = 'text';
        qtyInput.className = 'task-qty';
        qtyInput.value = item.quantity || '';
        qtyInput.placeholder = 'Cant.';
        tdQty.appendChild(qtyInput);
        row.appendChild(tdQty);

        // Result
        var tdResult = document.createElement('td');
        var resultSelect = document.createElement('select');
        resultSelect.className = 'task-result';
        var blankOpt = document.createElement('option');
        blankOpt.value = '';
        blankOpt.textContent = '\u2014';
        resultSelect.appendChild(blankOpt);
        window.RESULTS_OPTIONS.forEach(function (opt) {
          var o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          resultSelect.appendChild(o);
        });
        resultSelect.addEventListener('change', function () {
          applyResultColor(resultSelect);
          scheduleAutoSave();
        });
        tdResult.appendChild(resultSelect);
        row.appendChild(tdResult);

        // Observation
        var tdObs = document.createElement('td');
        var obsInput = document.createElement('input');
        obsInput.type = 'text';
        obsInput.className = 'task-obs';
        obsInput.placeholder = 'Observaci\u00F3n';
        obsInput.addEventListener('input', scheduleAutoSave);
        tdObs.appendChild(obsInput);
        row.appendChild(tdObs);

        maintBody.appendChild(row);
      });
    });
  }

  function applyResultColor(select) {
    select.classList.remove('result-yes', 'result-no', 'result-na', 'result-pending');
    switch (select.value) {
      case 'SÍ': select.classList.add('result-yes'); break;
      case 'NO': select.classList.add('result-no'); break;
      case 'N/A': select.classList.add('result-na'); break;
      case 'PENDIENTE': select.classList.add('result-pending'); break;
    }
  }

  // ===== RENDER PHOTOS =====
  function renderPhotos() {
    photoGrid.innerHTML = '';
    window.PHOTOS.forEach(function (p) {
      var div = document.createElement('div');
      div.className = 'photo-item';

      var label = document.createElement('label');
      label.setAttribute('for', 'input-' + p.id);
      label.textContent = p.label;
      div.appendChild(label);

      var wrapper = document.createElement('div');
      wrapper.className = 'photo-input-wrapper';

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'input-' + p.id;
      fileInput.accept = 'image/*';
      fileInput.capture = 'environment';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'photo-btn';
      btn.innerHTML = '\uD83D\uDCF7 Tomar foto / Seleccionar';
      btn.addEventListener('click', function () { fileInput.click(); });

      wrapper.appendChild(fileInput);
      wrapper.appendChild(btn);

      var previewDiv = document.createElement('div');
      previewDiv.className = 'photo-preview';
      previewDiv.id = 'preview-wrapper-' + p.id;

      fileInput.addEventListener('change', function (e) {
        handlePhotoSelect(p.id, fileInput, previewDiv);
      });

      div.appendChild(wrapper);
      div.appendChild(previewDiv);
      photoGrid.appendChild(div);
    });
  }

  function handlePhotoSelect(id, input, previewDiv) {
    var file = input.files && input.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var compressed = compressImage(img, 1200, 0.8);
        showPhotoPreview(id, compressed, previewDiv);
        scheduleAutoSave();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    input.value = '';
  }

  function compressImage(img, maxSize, quality) {
    var canvas = document.createElement('canvas');
    var w = img.width;
    var h = img.height;

    if (w > maxSize || h > maxSize) {
      var ratio = Math.min(maxSize / w, maxSize / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  }

  function showPhotoPreview(id, dataUrl, previewDiv) {
    previewDiv.innerHTML = '';
    var img = document.createElement('img');
    img.id = 'preview-' + id;
    img.src = dataUrl;
    img.alt = 'Foto';

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'photo-remove';
    removeBtn.innerHTML = '\u00D7';
    removeBtn.setAttribute('aria-label', 'Quitar foto');
    removeBtn.addEventListener('click', function () {
      previewDiv.innerHTML = '';
      var stored = document.getElementById('preview-' + id);
      if (stored) stored.src = '';
      scheduleAutoSave();
    });

    previewDiv.appendChild(removeBtn);
    previewDiv.appendChild(img);
  }

  function getPhotoData(id) {
    var img = document.getElementById('preview-' + id);
    return img && img.src ? img.src : null;
  }

  // ===== RENDER SIGNATURES =====
  function renderSignatures() {
    signatureGrid.innerHTML = '';
    window.SIGNATURES.forEach(function (s) {
      var div = document.createElement('div');
      div.className = 'signature-item';

      var label = document.createElement('label');
      label.textContent = s.label;
      div.appendChild(label);

      var canvas = document.createElement('canvas');
      canvas.className = 'signature-canvas';
      canvas.id = s.id;

      var actions = document.createElement('div');
      actions.className = 'signature-actions';

      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'btn btn-sm btn-danger';
      clearBtn.textContent = 'Limpiar firma';
      clearBtn.addEventListener('click', function () {
        clearCanvas(canvas);
        scheduleAutoSave();
      });

      actions.appendChild(clearBtn);
      div.appendChild(canvas);
      div.appendChild(actions);
      signatureGrid.appendChild(div);

      initSignaturePad(canvas);
    });
  }

  function initSignaturePad(canvas) {
    var ctx = canvas.getContext('2d');
    var drawing = false;
    var points = [];

    function resizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        var tempData = canvas.toDataURL();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        var img = new Image();
        img.onload = function () { ctx.drawImage(img, 0, 0); };
        img.src = tempData;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
    }

    resizeCanvas();
    window.addEventListener('resize', function () {
      resizeCanvas();
    });

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.clientX !== undefined ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
      var clientY = e.clientY !== undefined ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function startDrawing(e) {
      e.preventDefault();
      drawing = true;
      points = [];
      var pos = getPos(e);
      points.push(pos);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
      e.preventDefault();
      if (!drawing) return;
      var pos = getPos(e);
      points.push(pos);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    function stopDrawing(e) {
      if (e) e.preventDefault();
      if (drawing) {
        drawing = false;
        scheduleAutoSave();
      }
    }

    // Pointer Events (modern browsers)
    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointerleave', stopDrawing);

    // Touch events fallback
    canvas.addEventListener('touchstart', function (e) {
      if (e.pointerType) return; // handled by pointer events
      e.preventDefault();
      startDrawing(e);
    }, { passive: false });
    canvas.addEventListener('touchmove', function (e) {
      if (e.pointerType) return;
      e.preventDefault();
      draw(e);
    }, { passive: false });
    canvas.addEventListener('touchend', function (e) {
      if (e.pointerType) return;
      stopDrawing(e);
    }, { passive: false });

    // Mouse fallback
    canvas.addEventListener('mousedown', function (e) {
      if (e.pointerType) return;
      startDrawing(e);
    });
    canvas.addEventListener('mousemove', function (e) {
      if (e.pointerType) return;
      draw(e);
    });
    canvas.addEventListener('mouseup', function (e) {
      if (e.pointerType) return;
      stopDrawing(e);
    });
    canvas.addEventListener('mouseleave', function (e) {
      if (e.pointerType) return;
      if (drawing) stopDrawing(e);
    });
  }

  function getSignatureData(id) {
    var canvas = document.getElementById(id);
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }

  function clearCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ===== SPARE PARTS =====
  function renderSpareParts(parts) {
    sparePartsList.innerHTML = '';
    if (!parts || parts.length === 0) {
      var empty = document.createElement('p');
      empty.style.color = '#888';
      empty.style.fontSize = '0.85rem';
      empty.style.padding = '0.5rem 0';
      empty.textContent = 'No hay repuestos adicionales registrados.';
      sparePartsList.appendChild(empty);
      return;
    }

    parts.forEach(function (part, index) {
      var row = document.createElement('div');
      row.className = 'spare-part-row';

      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'spare-name';
      nameInput.placeholder = 'Nombre del repuesto';
      nameInput.value = part.name || '';
      nameInput.addEventListener('input', scheduleAutoSave);

      var partInput = document.createElement('input');
      partInput.type = 'text';
      partInput.className = 'spare-part';
      partInput.placeholder = 'N° de parte';
      partInput.value = part.partNumber || '';
      partInput.addEventListener('input', scheduleAutoSave);

      var qtyInput = document.createElement('input');
      qtyInput.type = 'text';
      qtyInput.className = 'spare-qty';
      qtyInput.placeholder = 'Cant.';
      qtyInput.value = part.quantity || '';
      qtyInput.addEventListener('input', scheduleAutoSave);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'spare-remove-btn';
      removeBtn.innerHTML = '\u00D7';
      removeBtn.setAttribute('aria-label', 'Quitar repuesto');
      removeBtn.addEventListener('click', function () {
        var parts = getSparePartsData();
        parts.splice(index, 1);
        renderSpareParts(parts);
        scheduleAutoSave();
      });

      row.appendChild(nameInput);
      row.appendChild(partInput);
      row.appendChild(qtyInput);
      row.appendChild(removeBtn);
      sparePartsList.appendChild(row);
    });
  }

  function getSparePartsData() {
    var parts = [];
    var rows = document.querySelectorAll('.spare-part-row');
    rows.forEach(function (row) {
      var nameInput = row.querySelector('.spare-name');
      var partInput = row.querySelector('.spare-part');
      var qtyInput = row.querySelector('.spare-qty');
      if (nameInput && nameInput.value.trim()) {
        parts.push({
          name: nameInput.value.trim(),
          partNumber: partInput ? partInput.value.trim() : '',
          quantity: qtyInput ? qtyInput.value.trim() : ''
        });
      }
    });
    return parts;
  }

  addSparePartBtn.addEventListener('click', function () {
    var current = getSparePartsData();
    current.push({ name: '', partNumber: '', quantity: '' });
    renderSpareParts(current);
    // Scroll to bottom of list
    sparePartsList.scrollTop = sparePartsList.scrollHeight;
  });

  // ===== AUTO-SAVE =====
  function scheduleAutoSave() {
    showSaving();
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function () {
      saveDraft(true);
    }, 800);
  }

  function saveDraft(silent) {
    try {
      var draft = {
        fecha: fecha.value,
        equipo: equipo.value,
        tecnico: tecnico.value,
        correo: correo.value,
        horometro: horometro.value,
        intervalo: intervalo.value,
        ubicacion: ubicacion.value,
        orden: orden.value,
        estado: estado.value,
        observaciones: observaciones.value,
        tasks: [],
        spareParts: getSparePartsData(),
        photos: {},
        signatures: {}
      };

      var rows = maintBody.querySelectorAll('tr:not(.section-row)');
      rows.forEach(function (row) {
        var select = row.querySelector('.task-result');
        var obsInput = row.querySelector('.task-obs');
        var partInput = row.querySelector('.task-part');
        var qtyInput = row.querySelector('.task-qty');
        draft.tasks.push({
          name: row.dataset.name || '',
          result: select ? select.value : '',
          obs: obsInput ? obsInput.value : '',
          partNumber: partInput ? partInput.value : '',
          quantity: qtyInput ? qtyInput.value : ''
        });
      });

      window.PHOTOS.forEach(function (p) {
        var data = getPhotoData(p.id);
        if (data) draft.photos[p.id] = data;
      });

      window.SIGNATURES.forEach(function (s) {
        var canvas = document.getElementById(s.id);
        if (canvas) {
          var data = canvas.toDataURL('image/png');
          // Only save if non-empty (check for blank canvas)
          var ctx = canvas.getContext('2d');
          var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var hasContent = false;
          for (var i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > 0) {
              hasContent = true;
              break;
            }
          }
          if (hasContent) draft.signatures[s.id] = data;
        }
      });

      localStorage.setItem(window.STORAGE_KEY, JSON.stringify(draft));
      if (!silent) {
        showSaved();
      } else {
        setStatus('Guardado ' + timeStr());
      }
    } catch (e) {
      showToast('Error al guardar el borrador: ' + e.message, 'error');
    }
  }

  function loadDraft() {
    try {
      var stored = localStorage.getItem(window.STORAGE_KEY);
      if (!stored) return false;

      var draft = JSON.parse(stored);

      if (draft.fecha) fecha.value = draft.fecha;
      if (draft.equipo) equipo.value = draft.equipo;
      if (draft.tecnico) tecnico.value = draft.tecnico;
      if (draft.correo) correo.value = draft.correo;
      if (draft.horometro) horometro.value = draft.horometro;
      if (draft.intervalo) intervalo.value = draft.intervalo;
      if (draft.ubicacion) ubicacion.value = draft.ubicacion;
      if (draft.orden) orden.value = draft.orden;
      if (draft.estado) estado.value = draft.estado;
      if (draft.observaciones) observaciones.value = draft.observaciones;

      calcProximo();

      // Restore tasks
      if (draft.tasks && draft.tasks.length > 0) {
        var rows = maintBody.querySelectorAll('tr:not(.section-row)');
        var idx = 0;
        rows.forEach(function (row) {
          if (idx < draft.tasks.length) {
            var t = draft.tasks[idx];
            var select = row.querySelector('.task-result');
            var obsInput = row.querySelector('.task-obs');
            var partInput = row.querySelector('.task-part');
            var qtyInput = row.querySelector('.task-qty');
            if (select && t.result) { select.value = t.result; applyResultColor(select); }
            if (obsInput) obsInput.value = t.obs || '';
            if (partInput) partInput.value = t.partNumber || '';
            if (qtyInput) qtyInput.value = t.quantity || '';
          }
          idx++;
        });
      }

      // Restore spare parts
      if (draft.spareParts && draft.spareParts.length > 0) {
        renderSpareParts(draft.spareParts);
      }

      // Restore photos
      window.PHOTOS.forEach(function (p) {
        if (draft.photos && draft.photos[p.id]) {
          var previewDiv = document.getElementById('preview-wrapper-' + p.id);
          if (previewDiv) {
            showPhotoPreview(p.id, draft.photos[p.id], previewDiv);
          }
        }
      });

      // Restore signatures
      window.SIGNATURES.forEach(function (s) {
        if (draft.signatures && draft.signatures[s.id]) {
          var canvas = document.getElementById(s.id);
          if (canvas) {
            var img = new Image();
            img.onload = function () {
              var ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = draft.signatures[s.id];
          }
        }
      });

      showRecovered();
      return true;
    } catch (e) {
      showToast('Error al recuperar el borrador', 'error');
      return false;
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(window.STORAGE_KEY);
    } catch (e) { /* ignore */ }
  }

  // ===== SETUP AUTO-SAVE TRIGGERS =====
  function setupAutoSaveTriggers() {
    var autoFields = [fecha, equipo, tecnico, horometro, intervalo, ubicacion, orden, estado, observaciones, correo];
    autoFields.forEach(function (el) {
      if (el) {
        el.addEventListener('change', scheduleAutoSave);
        el.addEventListener('input', scheduleAutoSave);
      }
    });
  }

  // ===== VALIDATE =====
  function validateBeforeAction() {
    // Clear previous errors
    document.querySelectorAll('.field-error').forEach(function (el) {
      el.classList.remove('field-error');
    });

    var fields = [
      { el: fecha, label: 'Fecha' },
      { el: equipo, label: 'Número de equipo' },
      { el: tecnico, label: 'Técnico responsable' },
      { el: horometro, label: 'Horómetro actual' },
      { el: estado, label: 'Estado general' }
    ];

    var missing = [];
    var firstError = null;

    fields.forEach(function (f) {
      var val = f.el.value ? f.el.value.toString().trim() : '';
      if (!val) {
        missing.push(f.label);
        f.el.classList.add('field-error');
        if (!firstError) firstError = f.el;
      }
    });

    var rows = maintBody.querySelectorAll('tr:not(.section-row)');
    var pendingTasks = 0;
    rows.forEach(function (row) {
      var select = row.querySelector('.task-result');
      if (select && !select.value) {
        select.classList.add('field-error');
        pendingTasks++;
        if (!firstError) firstError = select;
      }
    });

    if (pendingTasks > 0) {
      missing.push(pendingTasks + ' resultado(s) sin completar');
    }

    if (missing.length > 0) {
      showToast('Campos pendientes: ' + missing.join(', '), 'error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return false;
    }

    return true;
  }

  // ===== GENERATE AND DOWNLOAD PDF =====
  function handleDownloadPdf() {
    if (!validateBeforeAction()) return;
    showLoading('Generando PDF\u2026');

    var data = getFormData();
    generatePdf(data).then(function (result) {
      hideLoading();
      var link = document.createElement('a');
      link.href = result.dataUri;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('PDF descargado: ' + result.filename, 'success');
    }).catch(function (err) {
      hideLoading();
      showToast('Error al generar PDF: ' + err.message, 'error');
    });
  }

  // ===== SHARE PDF =====
  function handleSharePdf() {
    if (!validateBeforeAction()) return;
    showLoading('Preparando PDF para compartir\u2026');

    var data = getFormData();
    generatePdf(data).then(function (result) {
      hideLoading();

      if (navigator.share && navigator.canShare) {
        var file = new File([result.blob], result.filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            title: 'Pauta de Mantenimiento',
            text: 'Pauta de mantenimiento - ' + (data.equipo || '') + ' - ' + (data.fecha || ''),
            files: [file]
          }).then(function () {
            showToast('PDF compartido exitosamente', 'success');
          }).catch(function (err) {
            if (err.name !== 'AbortError') {
              showToast('Error al compartir: ' + err.message, 'error');
            }
          });
          return;
        }
      }

      // Fallback: download
      var link = document.createElement('a');
      link.href = result.dataUri;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Compartir no disponible. El PDF se ha descargado.', 'info');
    }).catch(function (err) {
      hideLoading();
      showToast('Error al generar PDF: ' + err.message, 'error');
    });
  }

  // ===== SEND EMAIL =====
  function handleSendEmail() {
    if (!validateBeforeAction()) return;

    var cfg = window.EMAIL_CONFIG;
    if (cfg && cfg.enabled) {
      // EmailJS method
      var destEmail = correo.value.trim();
      if (!destEmail) {
        showToast('Escriba un correo de destino en el campo correspondiente.', 'error');
        return;
      }

      showLoading('Enviando correo\u2026');
      var data = getFormData();
      generatePdf(data).then(function (result) {
        // Convert blob to base64 data URI (without the prefix)
        var reader = new FileReader();
        reader.onload = function () {
          var base64 = reader.result.split(',')[1];

          if (typeof emailjs === 'undefined') {
            hideLoading();
            showToast('EmailJS no está cargado. Configure el SDK o use el botón Compartir.', 'error');
            return;
          }

          var templateParams = {};
          templateParams[cfg.toEmailParameter || 'to_email'] = destEmail;
          templateParams[cfg.subjectParameter || 'subject'] = 'Pauta de Mantenimiento - ' + (data.equipo || '') + ' - ' + (data.fecha || '');
          templateParams[cfg.messageParameter || 'message'] = 'Adjunto pauta de mantenimiento.\n\nEquipo: ' + (data.equipo || '') + '\nFecha: ' + (data.fecha || '') + '\nTécnico: ' + (data.tecnico || '');
          templateParams[cfg.attachmentParameter || 'attachment'] = base64;
          templateParams[cfg.filenameParameter || 'filename'] = result.filename;

          emailjs.send(cfg.serviceId, cfg.templateId, templateParams, cfg.publicKey)
            .then(function () {
              hideLoading();
              showToast('Correo enviado exitosamente a ' + destEmail, 'success');
            })
            .catch(function (err) {
              hideLoading();
              showToast('Error al enviar correo: ' + (err.text || err.message || 'desconocido'), 'error');
            });
        };
        reader.readAsDataURL(result.blob);
      }).catch(function (err) {
        hideLoading();
        showToast('Error al generar PDF: ' + err.message, 'error');
      });
    } else {
      // Share fallback
      handleSharePdf();
    }
  }

  // ===== CLEAR FORM =====
  function handleClear() {
    showConfirm(
      'Limpiar pauta',
      '¿Está seguro de limpiar toda la pauta? Se perderán todos los datos no guardados.',
      function (confirmed) {
        if (!confirmed) return;
        clearForm();
      }
    );
  }

  function getDefaultTaskValues(name) {
    for (var s = 0; s < window.TASKS.length; s++) {
      for (var i = 0; i < window.TASKS[s].items.length; i++) {
        if (window.TASKS[s].items[i].name === name) {
          return {
            partNumber: window.TASKS[s].items[i].partNumber || '',
            quantity: window.TASKS[s].items[i].quantity || ''
          };
        }
      }
    }
    return { partNumber: '', quantity: '' };
  }

  function clearForm() {
    var today = todayStr();
    fecha.value = today;
    equipo.value = '';
    tecnico.value = '';
    // Keep correo (persistent)
    horometro.value = '';
    intervalo.value = '250';
    ubicacion.value = '';
    orden.value = '';
    estado.value = '';
    observaciones.value = '';

    calcProximo();

    // Clear tasks
    var rows = maintBody.querySelectorAll('tr:not(.section-row)');
    rows.forEach(function (row) {
      var select = row.querySelector('.task-result');
      var obsInput = row.querySelector('.task-obs');
      var partInput = row.querySelector('.task-part');
      var qtyInput = row.querySelector('.task-qty');
      var defaults = getDefaultTaskValues(row.dataset.name);
      if (select) { select.value = ''; select.classList.remove('result-yes', 'result-no', 'result-na', 'result-pending'); }
      if (obsInput) obsInput.value = '';
      if (partInput) partInput.value = defaults.partNumber;
      if (qtyInput) qtyInput.value = defaults.quantity;
    });

    // Clear photos
    window.PHOTOS.forEach(function (p) {
      var previewDiv = document.getElementById('preview-wrapper-' + p.id);
      if (previewDiv) previewDiv.innerHTML = '';
      var stored = document.getElementById('preview-' + p.id);
      if (stored) stored.src = '';
    });

    // Clear signatures
    window.SIGNATURES.forEach(function (s) {
      var canvas = document.getElementById(s.id);
      if (canvas) clearCanvas(canvas);
    });

    // Clear spare parts
    renderSpareParts([]);

    // Clear draft from storage
    clearDraft();

    // Remove errors
    document.querySelectorAll('.field-error').forEach(function (el) {
      el.classList.remove('field-error');
    });

    setStatus('Pauta limpiada');
    showToast('Pauta limpiada correctamente', 'info');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== DUPLICATE PREVIOUS =====
  function handleDuplicate() {
    var history = getHistory();
    if (history.length === 0) {
      showToast('No hay pautas anteriores para duplicar.', 'warning');
      return;
    }

    var prev = history[0];
    equipo.value = prev.equipo || '';
    tecnico.value = prev.tecnico || '';
    // Keep correo
    ubicacion.value = prev.ubicacion || '';
    orden.value = prev.orden || '';
    estado.value = '';
    intervalo.value = prev.intervalo || '250';
    horometro.value = '';
    observaciones.value = '';
    fecha.value = todayStr();

    calcProximo();

    // Restore task results from previous
    if (prev.tasks && prev.tasks.length > 0) {
      var rows = maintBody.querySelectorAll('tr:not(.section-row)');
      var idx = 0;
      rows.forEach(function (row) {
        if (idx < prev.tasks.length) {
          var t = prev.tasks[idx];
          var select = row.querySelector('.task-result');
          var partInput = row.querySelector('.task-part');
          var qtyInput = row.querySelector('.task-qty');
          if (select) { select.value = ''; select.classList.remove('result-yes', 'result-no', 'result-na', 'result-pending'); }
          if (partInput) partInput.value = t.partNumber || '';
          if (qtyInput) qtyInput.value = t.quantity || '';
        }
        idx++;
      });
    }

    // Clear photos
    window.PHOTOS.forEach(function (p) {
      var previewDiv = document.getElementById('preview-wrapper-' + p.id);
      if (previewDiv) previewDiv.innerHTML = '';
      var stored = document.getElementById('preview-' + p.id);
      if (stored) stored.src = '';
    });

    // Clear signatures
    window.SIGNATURES.forEach(function (s) {
      var canvas = document.getElementById(s.id);
      if (canvas) clearCanvas(canvas);
    });

    renderSpareParts([]);

    document.querySelectorAll('.field-error').forEach(function (el) {
      el.classList.remove('field-error');
    });

    setStatus('Pauta anterior duplicada');
    showToast('Pauta anterior duplicada. Complete el horómetro y la fecha.', 'success');
    horometro.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== HISTORY =====
  function getHistory() {
    try {
      var stored = localStorage.getItem(window.HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function addToHistory(data) {
    var history = getHistory();
    var entry = {
      id: Date.now(),
      fecha: data.fecha,
      equipo: data.equipo,
      tecnico: data.tecnico,
      horometro: data.horometro,
      estado: data.estado,
      ubicacion: data.ubicacion,
      orden: data.orden,
      intervalo: data.intervalo,
      observaciones: data.observaciones,
      tasks: data.tasks,
      spareParts: data.spareParts,
      timestamp: new Date().toISOString()
    };

    history.unshift(entry);
    if (history.length > window.MAX_HISTORY) {
      history = history.slice(0, window.MAX_HISTORY);
    }

    try {
      localStorage.setItem(window.HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      // Storage full - remove oldest entries
      try {
        while (history.length > 5) history.pop();
        localStorage.setItem(window.HISTORY_KEY, JSON.stringify(history));
      } catch (e2) { /* ignore */ }
    }

    renderHistory();
  }

  function renderHistory() {
    var history = getHistory();
    historyList.innerHTML = '';

    if (history.length === 0) {
      var empty = document.createElement('p');
      empty.style.color = '#888';
      empty.style.fontSize = '0.85rem';
      empty.style.textAlign = 'center';
      empty.style.padding = '1rem 0';
      empty.textContent = 'No hay pautas guardadas aún.';
      historyList.appendChild(empty);
      return;
    }

    history.forEach(function (entry) {
      var item = document.createElement('div');
      item.className = 'history-item';

      var dateSpan = document.createElement('span');
      dateSpan.className = 'history-date';
      dateSpan.textContent = entry.fecha || '—';

      var infoSpan = document.createElement('span');
      infoSpan.className = 'history-info';
      infoSpan.textContent = (entry.equipo || 'S/N') + ' | ' + (entry.tecnico || '—') + ' | ' + (entry.horometro || '0') + 'h';

      var loadBtn = document.createElement('button');
      loadBtn.className = 'btn btn-sm btn-primary history-load';
      loadBtn.textContent = 'Cargar';
      loadBtn.addEventListener('click', function () {
        loadHistoryEntry(entry);
      });

      item.appendChild(dateSpan);
      item.appendChild(infoSpan);
      item.appendChild(loadBtn);
      historyList.appendChild(item);
    });
  }

  function loadHistoryEntry(entry) {
    showConfirm(
      'Cargar pauta',
      '¿Cargar esta pauta? Se reemplazarán los datos actuales. El historial no se modificará.',
      function (confirmed) {
        if (!confirmed) return;

        fecha.value = todayStr();
        equipo.value = entry.equipo || '';
        tecnico.value = entry.tecnico || '';
        horometro.value = '';
        intervalo.value = entry.intervalo || '250';
        ubicacion.value = entry.ubicacion || '';
        orden.value = entry.orden || '';
        estado.value = '';
        observaciones.value = entry.observaciones || '';
        calcProximo();

        if (entry.tasks && entry.tasks.length > 0) {
          var rows = maintBody.querySelectorAll('tr:not(.section-row)');
          var idx = 0;
          rows.forEach(function (row) {
            if (idx < entry.tasks.length) {
              var t = entry.tasks[idx];
              var select = row.querySelector('.task-result');
              var obsInput = row.querySelector('.task-obs');
              var partInput = row.querySelector('.task-part');
              var qtyInput = row.querySelector('.task-qty');
              if (select) { select.value = ''; select.classList.remove('result-yes', 'result-no', 'result-na', 'result-pending'); }
              if (obsInput) obsInput.value = t.obs || '';
              if (partInput) partInput.value = t.partNumber || '';
              if (qtyInput) qtyInput.value = t.quantity || '';
            }
            idx++;
          });
        }

        if (entry.spareParts && entry.spareParts.length > 0) {
          renderSpareParts(entry.spareParts);
        } else {
          renderSpareParts([]);
        }

        window.PHOTOS.forEach(function (p) {
          var previewDiv = document.getElementById('preview-wrapper-' + p.id);
          if (previewDiv) previewDiv.innerHTML = '';
        });

        window.SIGNATURES.forEach(function (s) {
          var canvas = document.getElementById(s.id);
          if (canvas) clearCanvas(canvas);
        });

        document.querySelectorAll('.field-error').forEach(function (el) {
          el.classList.remove('field-error');
        });

        setStatus('Pauta cargada del historial');
        showToast('Pauta cargada del historial. Complete los datos pendientes.', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    );
  }

  function clearHistory() {
    showConfirm(
      'Limpiar historial',
      '¿Eliminar todo el historial de pautas? Esta acción no se puede deshacer.',
      function (confirmed) {
        if (!confirmed) return;
        try {
          localStorage.removeItem(window.HISTORY_KEY);
        } catch (e) { /* ignore */ }
        renderHistory();
        showToast('Historial limpiado', 'info');
      }
    );
  }

  clearHistoryBtn.addEventListener('click', clearHistory);

  // ===== SAVE DRAFT ON DEMAND =====
  function handleSaveDraft() {
    saveDraft(false);
    showToast('Borrador guardado', 'success');
  }

  // ===== LOAD PERSISTENT EMAIL =====
  function loadPersistentEmail() {
    try {
      var saved = localStorage.getItem(window.EMAIL_KEY);
      if (saved) {
        correo.value = saved;
      }
    } catch (e) { /* ignore */ }
  }

  function savePersistentEmail() {
    try {
      localStorage.setItem(window.EMAIL_KEY, correo.value);
    } catch (e) { /* ignore */ }
  }

  // Save email on change
  correo.addEventListener('change', savePersistentEmail);
  correo.addEventListener('input', savePersistentEmail);

  // ===== REGISTER SERVICE WORKER =====
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(function () {
        // registered
      }).catch(function () {
        // failed to register
      });
    }
  }

  // ===== INITIALIZATION =====
  function init() {
    renderTasks();
    renderPhotos();
    renderSignatures();
    renderSpareParts([]);
    setupAutoSaveTriggers();
    renderHistory();
    loadPersistentEmail();

    // Set today's date
    fecha.value = todayStr();
    calcProximo();

    // Load draft (this will overwrite date if saved)
    var hasDraft = loadDraft();

    if (!hasDraft) {
      setStatus('Listo');
    }

    // Buttons
    saveDraftBtn.addEventListener('click', handleSaveDraft);
    downloadPdfBtn.addEventListener('click', handleDownloadPdf);
    sharePdfBtn.addEventListener('click', handleSharePdf);
    emailBtn.addEventListener('click', handleSendEmail);
    clearBtn.addEventListener('click', handleClear);
    duplicateBtn.addEventListener('click', handleDuplicate);

    // Register PWA service worker
    registerSW();

    // Auto-save history when generating PDF (done in PDF generation flow)
    // Patch generatePdf to add history
    var origGeneratePdf = window.generatePdf;
    var newGeneratePdf = function (data) {
      return origGeneratePdf(data).then(function (result) {
        addToHistory(data);
        return result;
      });
    };
    window.generatePdf = newGeneratePdf;
  }

  // Start
  document.addEventListener('DOMContentLoaded', init);
})();
