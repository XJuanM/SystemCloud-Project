/* ============================================
   reportes.js
   Lógica funcional del panel de Reportes:
   - Generación de reportes (con estado "Generando" -> "Listo")
   - Búsqueda y filtro por tipo
   - Descarga real de archivo (texto plano con el resumen del reporte)
   - Eliminación de reportes
   - Gráfico de reportes generados por mes (Chart.js)
   - Reportes recientes y estadísticas del encabezado
   - Persistencia en localStorage
   ============================================ */

(function () {
    'use strict';

    const STORAGE_KEY = 'sc_reportes_generados';
    const GENERATION_DELAY_MS = 2200; // simula el tiempo de procesamiento

    const TYPE_ICONS = {
        'Financiero': 'fa-sack-dollar',
        'Asistencia': 'fa-calendar-check',
        'Clientes': 'fa-users',
        'Rendimiento': 'fa-chart-line'
    };

    const DEFAULT_REPORTS = [
        { id: 'r1', name: 'Reporte financiero — Junio', type: 'Financiero', from: '2026-06-01', to: '2026-06-30', format: 'PDF', status: 'listo', createdAt: '2026-07-01T09:12:00' },
        { id: 'r2', name: 'Asistencia semanal — Sem. 27', type: 'Asistencia', from: '2026-06-29', to: '2026-07-05', format: 'Excel', status: 'listo', createdAt: '2026-07-01T15:40:00' },
        { id: 'r3', name: 'Altas y bajas de clientes — Junio', type: 'Clientes', from: '2026-06-01', to: '2026-06-30', format: 'CSV', status: 'listo', createdAt: '2026-06-30T11:05:00' },
        { id: 'r4', name: 'Rendimiento de rutinas — Q2', type: 'Rendimiento', from: '2026-04-01', to: '2026-06-30', format: 'PDF', status: 'listo', createdAt: '2026-06-28T08:20:00' }
    ];

    let reports = [];

    // ---------- Referencias del DOM ----------

    const tableBody = document.getElementById('reportsTableBody');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const recentReportsList = document.getElementById('recentReportsList');

    const statTotalReports = document.getElementById('statTotalReports');
    const statMonthReports = document.getElementById('statMonthReports');
    const statPendingReports = document.getElementById('statPendingReports');
    const statTopFormat = document.getElementById('statTopFormat');
    const headerSummary = document.getElementById('headerSummary');

    const modalOverlay = document.getElementById('modalOverlay');
    const formError = document.getElementById('formError');

    const inputReportType = document.getElementById('inputReportType');
    const inputDateFrom = document.getElementById('inputDateFrom');
    const inputDateTo = document.getElementById('inputDateTo');
    const inputFormat = document.getElementById('inputFormat');

    const btnGenerateReport = document.getElementById('btnGenerateReport');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnSaveReport = document.getElementById('btnSaveReport');

    const toast = document.getElementById('toast');

    let chartInstance = null;

    // ---------- Persistencia ----------

    function loadReports() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                reports = JSON.parse(raw);
                return;
            } catch (e) {
                reports = [];
            }
        }
        reports = DEFAULT_REPORTS.slice();
        saveReports();
    }

    function saveReports() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }

    // ---------- Utilidades ----------

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDateShort(isoDate) {
        const d = new Date(isoDate + 'T00:00:00');
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    }

    function formatDateTime(isoDateTime) {
        const d = new Date(isoDateTime);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) +
            ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }

    function getIcon(type) {
        return TYPE_ICONS[type] || 'fa-file-lines';
    }

    function showToast(message, icon) {
        toast.innerHTML = '<i class="fa-solid ' + (icon || 'fa-circle-check') + '"></i><span>' + message + '</span>';
        toast.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
            toast.classList.remove('show');
        }, 2600);
    }

    function isSameMonth(dateStr, ref) {
        const d = new Date(dateStr);
        return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
    }

    // ---------- Render: tabla de reportes ----------

    function renderTable() {
        const query = (searchInput.value || '').trim().toLowerCase();
        const type = filterType.value;

        const filtered = reports
            .filter(function (r) {
                const matchesQuery = r.name.toLowerCase().includes(query) || r.type.toLowerCase().includes(query);
                const matchesType = type === 'todos' || r.type === type;
                return matchesQuery && matchesType;
            })
            .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

        tableBody.innerHTML = '';
        emptyState.style.display = filtered.length === 0 ? 'block' : 'none';

        filtered.forEach(function (r) {
            const tr = document.createElement('tr');
            const isReady = r.status === 'listo';

            tr.innerHTML =
                '<td>' +
                    '<div class="report-name-cell">' +
                        '<div class="report-type-icon"><i class="fa-solid ' + getIcon(r.type) + '"></i></div>' +
                        '<span class="product-name">' + escapeHTML(r.name) + '</span>' +
                    '</div>' +
                '</td>' +
                '<td>' + escapeHTML(r.type) + '</td>' +
                '<td><span class="report-range">' + formatDateShort(r.from) + ' – ' + formatDateShort(r.to) + '</span></td>' +
                '<td><span class="format-tag">' + escapeHTML(r.format) + '</span></td>' +
                '<td>' +
                    '<span class="status-dot ' + (isReady ? 'status-listo' : 'status-generando') + '">' +
                        (isReady ? 'Listo' : 'Generando') +
                    '</span>' +
                '</td>' +
                '<td><span class="report-date">' + formatDateTime(r.createdAt) + '</span></td>' +
                '<td>' +
                    '<div class="row-actions">' +
                        '<button class="btn-download" title="Descargar" data-id="' + r.id + '" ' + (isReady ? '' : 'disabled') + '>' +
                            '<i class="fa-solid fa-download"></i>' +
                        '</button>' +
                        '<button class="btn-delete" title="Eliminar" data-id="' + r.id + '">' +
                            '<i class="fa-solid fa-trash"></i>' +
                        '</button>' +
                    '</div>' +
                '</td>';

            tableBody.appendChild(tr);
        });

        tableBody.querySelectorAll('.btn-download').forEach(function (btn) {
            btn.addEventListener('click', function () { downloadReport(btn.getAttribute('data-id')); });
        });

        tableBody.querySelectorAll('.btn-delete').forEach(function (btn) {
            btn.addEventListener('click', function () { deleteReport(btn.getAttribute('data-id')); });
        });
    }

    // ---------- Render: reportes recientes ----------

    function renderRecent() {
        const recent = reports
            .slice()
            .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
            .slice(0, 5);

        recentReportsList.innerHTML = '';

        if (recent.length === 0) {
            recentReportsList.innerHTML = '<p class="empty-state">Aún no has generado reportes.</p>';
            return;
        }

        recent.forEach(function (r) {
            const isReady = r.status === 'listo';
            const div = document.createElement('div');
            div.className = 'recent-report-card';
            div.innerHTML =
                '<div class="recent-report-icon"><i class="fa-solid ' + getIcon(r.type) + '"></i></div>' +
                '<div class="recent-report-info">' +
                    '<h4>' + escapeHTML(r.name) + '</h4>' +
                    '<span>' + escapeHTML(r.type) + ' · ' + escapeHTML(r.format) + '</span>' +
                '</div>' +
                '<div class="recent-report-meta">' +
                    '<small>' + formatDateShort(r.createdAt.slice(0, 10)) + '</small>' +
                    '<span class="status-dot ' + (isReady ? 'status-listo' : 'status-generando') + '">' +
                        (isReady ? 'Listo' : 'Generando') +
                    '</span>' +
                '</div>';
            recentReportsList.appendChild(div);
        });
    }

    // ---------- Render: estadísticas ----------

    function renderStats() {
        const now = new Date();
        const total = reports.length;
        const thisMonth = reports.filter(function (r) { return isSameMonth(r.createdAt, now); }).length;
        const pending = reports.filter(function (r) { return r.status !== 'listo'; }).length;

        const formatCounts = {};
        reports.forEach(function (r) { formatCounts[r.format] = (formatCounts[r.format] || 0) + 1; });
        const topFormat = Object.keys(formatCounts).sort(function (a, b) {
            return formatCounts[b] - formatCounts[a];
        })[0] || '—';

        statTotalReports.textContent = total;
        statMonthReports.textContent = thisMonth;
        statPendingReports.textContent = pending;
        statTopFormat.textContent = topFormat;

        headerSummary.textContent =
            'Has generado ' + total + ' reporte' + (total === 1 ? '' : 's') + ' en total, ' +
            thisMonth + ' este mes' +
            (pending > 0 ? ' y ' + pending + ' aún se está' + (pending === 1 ? '' : 'n') + ' procesando.' : '.');
    }

    // ---------- Render: gráfico ----------

    function renderChart() {
        const months = [];
        const counts = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d.toLocaleDateString('es-CO', { month: 'short' }));
            const count = reports.filter(function (r) { return isSameMonth(r.createdAt, d); }).length;
            counts.push(count);
        }

        const ctx = document.getElementById('reportsChart').getContext('2d');

        if (chartInstance) {
            chartInstance.data.labels = months;
            chartInstance.data.datasets[0].data = counts;
            chartInstance.update();
            return;
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, 'rgba(0,255,220,.55)');
        gradient.addColorStop(1, 'rgba(0,150,150,.05)');

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Reportes generados',
                    data: counts,
                    backgroundColor: gradient,
                    borderRadius: 8,
                    maxBarThickness: 42
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        ticks: { color: 'rgb(190,190,190)' },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'rgb(190,190,190)', stepSize: 1 },
                        grid: { color: 'rgba(255,255,255,.06)' }
                    }
                }
            }
        });
    }

    // ---------- Render general ----------

    function renderAll() {
        renderTable();
        renderRecent();
        renderStats();
        renderChart();
    }

    // ---------- Modal: generar reporte ----------

    function openModal() {
        formError.textContent = '';
        inputReportType.value = 'Financiero';
        inputFormat.value = 'PDF';

        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        inputDateFrom.value = firstDay.toISOString().slice(0, 10);
        inputDateTo.value = today.toISOString().slice(0, 10);

        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    function generateReportFromForm() {
        const type = inputReportType.value;
        const from = inputDateFrom.value;
        const to = inputDateTo.value;
        const format = inputFormat.value;

        if (!from || !to) {
            formError.textContent = 'Selecciona el rango de fechas.';
            return;
        }
        if (new Date(from) > new Date(to)) {
            formError.textContent = 'La fecha "Desde" no puede ser posterior a "Hasta".';
            return;
        }

        const id = 'r' + Date.now();
        const name = type + ' — ' + formatDateShort(from) + ' a ' + formatDateShort(to);

        reports.push({
            id: id,
            name: name,
            type: type,
            from: from,
            to: to,
            format: format,
            status: 'generando',
            createdAt: new Date().toISOString()
        });

        saveReports();
        closeModal();
        renderAll();
        showToast('Generando reporte...', 'fa-hourglass-half');

        // Simula el tiempo de procesamiento del reporte
        setTimeout(function () {
            const r = reports.find(function (item) { return item.id === id; });
            if (!r) return;
            r.status = 'listo';
            saveReports();
            renderAll();
            showToast('Reporte listo para descargar', 'fa-circle-check');
        }, GENERATION_DELAY_MS);
    }

    function deleteReport(id) {
        const r = reports.find(function (item) { return item.id === id; });
        if (!r) return;

        const confirmed = window.confirm('¿Eliminar "' + r.name + '"?');
        if (!confirmed) return;

        reports = reports.filter(function (item) { return item.id !== id; });
        saveReports();
        showToast('Reporte eliminado', 'fa-trash');
        renderAll();
    }

    // ---------- Descarga real de archivo ----------

    function downloadReport(id) {
        const r = reports.find(function (item) { return item.id === id; });
        if (!r || r.status !== 'listo') return;

        const content =
            'SYSTEM CLOUD — REPORTE\n' +
            '========================\n\n' +
            'Nombre: ' + r.name + '\n' +
            'Tipo: ' + r.type + '\n' +
            'Rango: ' + r.from + ' a ' + r.to + '\n' +
            'Formato solicitado: ' + r.format + '\n' +
            'Generado: ' + formatDateTime(r.createdAt) + '\n\n' +
            'Este archivo es una exportación generada automáticamente\n' +
            'desde el panel de Reportes de System Cloud.\n';

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = r.name.replace(/\s+/g, '_') + '.' + (r.format === 'CSV' ? 'csv' : 'txt');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Descargando reporte...', 'fa-download');
    }

    // ---------- Eventos ----------

    btnGenerateReport.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    btnSaveReport.addEventListener('click', generateReportFromForm);

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    });

    searchInput.addEventListener('input', renderTable);
    filterType.addEventListener('change', renderTable);

    // ---------- Inicio ----------

    loadReports();
    renderAll();

})();
