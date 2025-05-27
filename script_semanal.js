window.onload = function() {
    console.log("Página cargada, inicializando...");

    loadBlocksFromLocalStorage(); // Carga los bloques
    loadTitlesFromLocalStorage(); // Carga los títulos

    const storedLockState = localStorage.getItem('isLocked');
    if (storedLockState !== null) {
        isLocked = JSON.parse(storedLockState);
        toggleLock(); // Aplicar el estado de bloqueo guardado
    }
};


let blockCount = 1; // Inicializa el contador en 1 para el primer bloque
let draggedElement = null; // Elemento que se está arrastrando
let isLocked = false; // Estado inicial de bloqueo

function autoResize(textarea) {
    textarea.style.height = 'auto'; // Resetea la altura
    textarea.style.height = (textarea.scrollHeight + 2) + 'px'; // Ajusta la altura con el scrollHeight
}

function validateAndUpdateProgress(input) {
    let value = parseInt(input.value, 10);

    // Verifica si el valor está dentro del rango permitido
    if (isNaN(value) || value < 0) {
        value = 0; // Establecer en 0
    } else if (value > 100) {
        value = 100; // Establecer en 100
    }

    input.value = value; // Actualiza el valor del input

    // Actualiza la barra de progreso
    const progressBar = input.parentNode.querySelector('progress');
    progressBar.value = value;

    saveBlocksToLocalStorage(); // Guarda los bloques después de actualizar
}

function calculateDateDifference(input) {
    const container = input.parentNode;

    // Obtener ambos inputs de tipo fecha en el bloque actual
    const dateInputs = container.querySelectorAll('input[type="date"]');

    // Asegurarnos de que hay dos inputs de tipo fecha
    if (dateInputs.length < 2) {
        return; // Si no hay dos inputs de fecha, salir de la función
    }

    const startDateInput = dateInputs[0]; // Primer input de fecha (inicio)
    const endDateInput = dateInputs[1];   // Segundo input de fecha (fin)

    // Convertir las fechas en objetos Date
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    // Seleccionar el input que muestra la diferencia de fechas
    const dateDiffInput = container.querySelector('input.difference');

    // Asegurarnos de que ambas fechas sean válidas
    if (!isNaN(startDate) && !isNaN(endDate)) {
        const timeDiff = endDate - startDate; // Diferencia en milisegundos
        let dayDiff = timeDiff / (1000 * 60 * 60 * 24); // Convertir milisegundos a días

        // Aumentar en 1 la diferencia en días según lo solicitado
        dayDiff += 1;

        // Asignar el valor calculado al input que muestra la diferencia
        dateDiffInput.value = dayDiff >= 0 ? dayDiff : "Error";
    } else {
        // Si las fechas no son válidas, limpiar el input de diferencia
        dateDiffInput.value = "";
    }

    saveBlocksToLocalStorage(); // Guarda los bloques después de calcular
}

function addBlock() {
    const container = document.createElement('div');
    container.className = 'container';
    container.setAttribute('draggable', 'true');
    container.setAttribute('ondragstart', 'dragStart(event)');
    container.setAttribute('ondragover', 'allowDrop(event)');
    container.setAttribute('ondrop', 'drop(event)');

    // Utiliza blockCount para asignar el número correcto
    container.innerHTML = `
        <label>${blockCount}:</label>
        <input type="checkbox" id="blockCheckbox" class="blockCheckbox">
        <textarea placeholder="Tarea" rows="1" oninput="autoResize(this)"></textarea>
        <input type="text" class="percentage-input" oninput="validateAndUpdateProgress(this)" value="0" placeholder="Porcentaje">
        <progress value="0" max="100"></progress>
        <input type="text" class="difference" readonly placeholder="Días">
        <input type="date" onchange="calculateDateDifference(this)">
        <input type="date" onchange="calculateDateDifference(this)">
        <textarea rows="1" oninput="autoResize(this)" placeholder="Observaciones"></textarea>
    `;
    document.getElementById('blocksContainer').appendChild(container);
    renumberLabels(); // Renumera después de agregar
    saveBlocksToLocalStorage(); // Guarda los bloques después de añadir
}

function deleteSelectedBlocks() {
    const blocksContainer = document.getElementById('blocksContainer');
    const checkboxes = blocksContainer.querySelectorAll('.blockCheckbox');

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            checkbox.parentElement.remove();
        }
    });

    // Renumerar los labels después de eliminar bloques
    renumberLabels();
    saveBlocksToLocalStorage(); // Guarda los bloques después de eliminar
}

function renumberLabels() {
    const containers = document.querySelectorAll('.container');
    blockCount = 1; // Reinicia el contador

    containers.forEach(container => {
        const label = container.querySelector('label');
        label.textContent = `${blockCount}`; // Solo la numeración
        blockCount++; // Incrementa el número de cada bloque
    });

    saveBlocksToLocalStorage(); // Guarda los bloques después de renumerar
}

// Función para guardar los bloques en Local Storage
function saveBlocksToLocalStorage() {
    const blocks = [];
    const containers = document.querySelectorAll('.container');

    containers.forEach(container => {
        const tarea = container.querySelector('textarea').value;
        const porcentaje = container.querySelector('.percentage-input').value;
        const diferencia = container.querySelector('input.difference').value;
        const fechaInicio = container.querySelectorAll('input[type="date"]')[0].value;
        const fechaFin = container.querySelectorAll('input[type="date"]')[1].value;
        const observaciones = container.querySelector('textarea:last-of-type').value;

        blocks.push({
            tarea,
            porcentaje,
            diferencia,
            fechaInicio,
            fechaFin,
            observaciones
        });
    });

    // Verificar si existen títulos en la página antes de sobrescribir
    const titleContainers = document.querySelectorAll('.title-container');
    if (titleContainers.length > 0) {
        const titles = [];
        titleContainers.forEach((titleContainer) => {
            const titleText = titleContainer.querySelector('input[type="text"]').value;
            const position = Array.from(titleContainer.parentNode.children).indexOf(titleContainer);
            titles.push({ titleText, position });
        });
        localStorage.setItem('titles', JSON.stringify(titles));
    }

    localStorage.setItem('blocks', JSON.stringify(blocks));
    console.log("Títulos guardados en localStorage:", JSON.stringify(localStorage.getItem('titles')));
}

// Función para cargar los bloques desde Local Storage
function loadBlocksFromLocalStorage() {
    const storedBlocks = localStorage.getItem('blocks');
    if (storedBlocks) {
        const blocks = JSON.parse(storedBlocks);
        blocks.forEach(block => {
            const container = document.createElement('div');
            container.className = 'container';
            container.setAttribute('draggable', 'true');
            container.setAttribute('ondragstart', 'dragStart(event)');
            container.setAttribute('ondragover', 'allowDrop(event)');
            container.setAttribute('ondrop', 'drop(event)');

            // Crear los elementos dentro del bloque
            const label = document.createElement('label');
            label.textContent = `${blockCount}:`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'blockCheckbox';

            const tareaTextarea = document.createElement('textarea');
            tareaTextarea.placeholder = "Tarea";
            tareaTextarea.rows = 1;
            tareaTextarea.oninput = function() { autoResize(this); };
            tareaTextarea.value = block.tarea;

            const porcentajeInput = document.createElement('input');
            porcentajeInput.type = 'text';
            porcentajeInput.className = 'percentage-input';
            porcentajeInput.placeholder = 'Porcentaje';
            porcentajeInput.value = block.porcentaje;
            porcentajeInput.oninput = function() { validateAndUpdateProgress(this); };

            const progress = document.createElement('progress');
            progress.value = block.porcentaje;
            progress.max = 100;

            const diferenciaInput = document.createElement('input');
            diferenciaInput.type = 'text';
            diferenciaInput.className = 'difference';
            diferenciaInput.readOnly = true;
            diferenciaInput.placeholder = 'Días';
            diferenciaInput.value = block.diferencia;

            const fechaInicioInput = document.createElement('input');
            fechaInicioInput.type = 'date';
            fechaInicioInput.value = block.fechaInicio;
            fechaInicioInput.onchange = function() { calculateDateDifference(this); };

            const fechaFinInput = document.createElement('input');
            fechaFinInput.type = 'date';
            fechaFinInput.value = block.fechaFin;
            fechaFinInput.onchange = function() { calculateDateDifference(this); };

            const observacionesTextarea = document.createElement('textarea');
            observacionesTextarea.placeholder = "Observaciones";
            observacionesTextarea.rows = 1;
            observacionesTextarea.oninput = function() { autoResize(this); };
            observacionesTextarea.value = block.observaciones;

            // Añadir todos los elementos al contenedor
            container.appendChild(label);
            container.appendChild(checkbox);
            container.appendChild(tareaTextarea);
            container.appendChild(porcentajeInput);
            container.appendChild(progress);
            container.appendChild(diferenciaInput);
            container.appendChild(fechaInicioInput);
            container.appendChild(fechaFinInput);
            container.appendChild(observacionesTextarea);

            // Agregar el bloque al contenedor de bloques
            document.getElementById('blocksContainer').appendChild(container);
            blockCount++; // Incrementa el contador solo al agregar bloques

            // Ajustar la altura de los textareas después de cargarlos
            autoResize(tareaTextarea);
            autoResize(observacionesTextarea);
        });

        renumberLabels(); // Renumerar los bloques cargados
    }

    // Restaurar el estado de bloqueo
    const storedLockState = localStorage.getItem('isLocked');
    if (storedLockState !== null) {
        isLocked = JSON.parse(storedLockState);
        const button = document.getElementById('toggleLock');
        button.textContent = isLocked ? 'Desbloquear' : 'Bloquear';

        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            if (isLocked) {
                container.classList.add('locked');
            } else {
                container.classList.remove('locked');
            }
        });
    }
}

// Inicializar Flatpickr con formato personalizado
// Diccionario de días y meses en español
const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Función para formatear la fecha completa
function formatearFechaCompleta(fecha) {
    const diaSemana = diasSemana[fecha.getDay()]; // Día de la semana
    const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
    const mes = meses[fecha.getMonth()]; // Mes en letras
    const anio = fecha.getFullYear(); // Año
    return `${diaSemana}, ${dia} de ${mes} del ${anio}`;
}

// Inicializar Flatpickr con la fecha actual al cargar la página
flatpickr("#fechaActual", {
    // Formato interno para Flatpickr
    dateFormat: "Y-m-d", 
    // Definir la fecha inicial como la fecha actual
    defaultDate: new Date(),
    // Evento para formatear la fecha seleccionada y la fecha actual
    onReady: function(selectedDates, dateStr, instance) {
        // Si hay una fecha seleccionada, formatearla
        const fechaActual = selectedDates.length > 0 ? selectedDates[0] : new Date();
        const fechaFormateada = formatearFechaCompleta(fechaActual);
        instance.input.value = fechaFormateada; // Mostrar la fecha actual formateada
    },
    // Evento para formatear la fecha seleccionada por el usuario
    onChange: function(selectedDates, dateStr, instance) {
        if (selectedDates.length > 0) {
            const fechaSeleccionada = selectedDates[0];
            const fechaFormateada = formatearFechaCompleta(fechaSeleccionada);
            instance.input.value = fechaFormateada; // Mostrar la fecha seleccionada formateada
        }
    },
    locale: {
        firstDayOfWeek: 1, // Iniciar la semana en lunes
        weekdays: {
            shorthand: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
            longhand: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
        },
        months: {
            shorthand: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            longhand: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        }
    }
});


// Funciones para drag & drop
function dragStart(event) {
    if (isLocked) {
        event.preventDefault(); // Previene el arrastre si está bloqueado
        return;
    }
    draggedElement = event.target;
    event.target.classList.add('dragging');
}

function allowDrop(event) {
    event.preventDefault(); // Permite soltar el elemento
}

function drop(event) {
    if (isLocked) return; // Si está bloqueado, no hacer nada
    event.preventDefault();
    
    const targetElement = event.target.closest('.container');

    if (draggedElement && targetElement && draggedElement !== targetElement) {
        const blocksContainer = document.getElementById('blocksContainer');
        const bounding = targetElement.getBoundingClientRect();
        const offset = event.clientY - bounding.top;

        if (offset > bounding.height / 2) {
            blocksContainer.insertBefore(draggedElement, targetElement.nextSibling);
        } else {
            blocksContainer.insertBefore(draggedElement, targetElement);
        }

        draggedElement.classList.remove('dragging');
        draggedElement = null;
        renumberLabels();
    }
}



// Función para bloquear o desbloquear el movimiento de los bloques
function toggleLock() {
    isLocked = !isLocked; // Cambia el estado de bloqueo

    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
        if (isLocked) {
            container.classList.add('locked'); // Agrega clase que indica que el bloque está bloqueado solo para mover
        } else {
            container.classList.remove('locked'); // Elimina la clase si está desbloqueado
        }
    });

    // Cambiar el texto del botón según el estado
    const button = document.getElementById('toggleLock');
    button.textContent = isLocked ? 'Desbloquear' : 'Bloquear';

    // Guardar el estado de bloqueo en localStorage
    localStorage.setItem('isLocked', JSON.stringify(isLocked));
}


function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.blockCheckbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked; // Cambia el estado según si todos están seleccionados o no
    });
}


function printPage() {
    window.print(); // Abre el diálogo de impresión
}


//Añada el mensaje de error cuando el campo sea inválido.
function validateFields() {
    const inputs = document.querySelectorAll('input, textarea');
    let allValid = true;

    inputs.forEach(input => {
        // Limpia el mensaje de error anterior si existe
        if (input.parentElement.querySelector('.tooltip-text')) {
            input.parentElement.querySelector('.tooltip-text').remove();
        }
        
        // Validar si el campo está vacío
        if (input.value === '') {
            allValid = false;
            input.classList.add('error'); // Añade la clase de error

            // Crear el tooltip de error
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-text';
            tooltip.textContent = 'Este campo es obligatorio';
            
            const wrapper = document.createElement('div');
            wrapper.className = 'tooltip-error';
            input.parentElement.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            wrapper.appendChild(tooltip);
        } else {
            input.classList.remove('error');
        }
    });

    return allValid;
}

// Creará un nuevo bloque para el título
function addTitle() {
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-container';
    titleContainer.setAttribute('draggable', 'true');
    titleContainer.setAttribute('ondragstart', 'dragStart(event)');
    titleContainer.setAttribute('ondragover', 'allowDrop(event)');
    titleContainer.setAttribute('ondrop', 'drop(event)');

    titleContainer.innerHTML = `
        <input type="text" id="text-title" placeholder="Título" />
        <button id="btn-delete-title" onclick="deleteTitle(this)">Eliminar Título</button>
    `;

    document.getElementById('blocksContainer').appendChild(titleContainer);
    saveBlocksToLocalStorage(); // Guarda el bloque después de agregar
}

// Eliminará el título si el usuario decide que ya no lo necesita.
function deleteTitle(button) {
    const titleContainer = button.parentElement;
    titleContainer.remove(); // Elimina el contenedor del título
    saveBlocksToLocalStorage(); // Guarda los bloques después de eliminar
}


// Cargar los títulos al iniciar la página.
function loadTitlesFromLocalStorage() {
    const storedTitles = localStorage.getItem('titles');
    if (storedTitles) {
        const titles = JSON.parse(storedTitles);
        console.log("Títulos cargados desde localStorage:", titles);

        titles.forEach((title) => {
            const titleContainer = document.createElement('div');
            titleContainer.className = 'title-container';
            titleContainer.setAttribute('draggable', 'true');
            titleContainer.setAttribute('ondragstart', 'dragStart(event)');
            titleContainer.setAttribute('ondragover', 'allowDrop(event)');
            titleContainer.setAttribute('ondrop', 'drop(event)');

            titleContainer.innerHTML = `
                <input type="text" id="text-title" placeholder="Título" value="${title.titleText}" />
                <button id="btn-delete-title" onclick="deleteTitle(this)">Eliminar Título</button>
            `;

            const blocksContainer = document.getElementById('blocksContainer');
            if (title.position >= blocksContainer.children.length) {
                blocksContainer.appendChild(titleContainer);
            } else {
                blocksContainer.insertBefore(titleContainer, blocksContainer.children[title.position]);
            }
        });
    } else {
        console.log("No hay títulos en localStorage.");
    }
}
