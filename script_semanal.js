let blockCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#fechaActual", {
        locale: "es",
        dateFormat: "d/m/Y",
        defaultDate: "today",
        onReady: (dates, str, inst) => inst.input.value = formatearFecha(dates[0]),
        onChange: (dates, str, inst) => inst.input.value = formatearFecha(dates[0])
    });
    if (blockCount === 0) addBlock();
});

function formatearFecha(fecha) {
    const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let f = fecha.toLocaleDateString('es-ES', opciones);
    f = f.charAt(0).toUpperCase() + f.slice(1);
    return f.replace(/ de (\d{4})/, " del $1");
}

function addBlock() {
    blockCount++;
    const container = document.getElementById('blocksContainer');
    const row = document.createElement('div');
    row.className = 'grid-row task-row';
    row.innerHTML = `
        <div><label class="item-number">${blockCount}</label></div>
        <div><input type="checkbox" class="blockCheckbox"></div>
        <div><textarea placeholder="Tarea" oninput="autoResize(this)"></textarea></div>
        <div><input type="number" value="0" min="0" max="100" oninput="updateProg(this)"></div>
        <div><div class="progress-container"><div class="progress-bar"></div></div></div>
        <div><input type="text" class="diff" readonly value="0"></div>
        <div><input type="date" onchange="calcDiff(this)"></div>
        <div><input type="date" onchange="calcDiff(this)"></div>
        <div><textarea placeholder="Observaciones" oninput="autoResize(this)"></textarea></div>
    `;
    container.appendChild(row);
    renumerarItems();
}

function deleteSelectedBlocks() {
    document.querySelectorAll('.blockCheckbox:checked').forEach(cb => cb.closest('.grid-row').remove());
    renumerarItems();
}

function renumerarItems() {
    document.querySelectorAll('.task-row').forEach((row, i) => {
        row.querySelector('.item-number').textContent = i + 1;
    });
}

function addTitle() {
    const container = document.getElementById('blocksContainer');
    const titleDiv = document.createElement('div');
    titleDiv.className = 'title-section';
    titleDiv.innerHTML = `
        <input type="text" placeholder="Título de sección..." style="font-weight:bold; width:90%">
        <button onclick="this.parentElement.remove()" class="no-print" style="border:none; background:none; cursor:pointer; color:red;">&times;</button>
    `;
    container.appendChild(titleDiv);
}

function autoResize(t) { 
    t.style.height = 'auto'; 
    t.style.height = (t.scrollHeight > 20 ? t.scrollHeight : 20) + 'px'; 
}

function updateProg(input) {
    let val = Math.min(100, Math.max(0, input.value));
    input.value = val;
    input.closest('.grid-row').querySelector('.progress-bar').style.width = val + '%';
}

function calcDiff(i) {
    const r = i.closest('.grid-row');
    const d = r.querySelectorAll('input[type="date"]');
    if (d[0].value && d[1].value) {
        const s = new Date(d[0].value);
        const e = new Date(d[1].value);
        const res = Math.ceil((e - s) / 86400000) + 1;
        r.querySelector('.diff').value = res > 0 ? res : "!";
    }
}

function printPage() { window.print(); }

// ... (mantenemos las funciones anteriores: addBlock, addTitle, deleteSelectedBlocks, etc.) ...

function downloadPDF() {
    const element = document.getElementById('reporte-completo');
    
    // Configuración para una captura limpia
    const opt = {
        margin: [10, 5, 10, 5],
        filename: `Reporte_${document.getElementById('nombre').value || 'Semanal'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            // Ignora botones y el contenedor de acciones en la "foto" del PDF
            ignoreElements: (el) => el.classList.contains('no-print') || el.tagName === 'BUTTON'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    if (typeof html2pdf === 'undefined') {
        alert("Error: Librería PDF no cargada.");
        return;
    }

    html2pdf().set(opt).from(element).save();
}

// Mantenemos la función de renumerar corregida anteriormente
function renumerarItems() {
    const rows = document.querySelectorAll('.task-row');
    rows.forEach((row, index) => {
        const label = row.querySelector('.item-number');
        if (label) label.textContent = index + 1;
    });
    blockCount = rows.length;
}