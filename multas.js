document.addEventListener('DOMContentLoaded', () => {
    const elementContainer = document.getElementById('element-container');
    const addBlockBtn = document.getElementById('add-block-btn');
    const deleteCheckedBtn = document.getElementById('delete-checked-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const printBtn = document.getElementById('print-btn');
    const totalLabel = document.getElementById('total-label');
    let blockCount = 0;

    // Función para calcular la suma total de los resultados
    const calculateTotal = () => {
        const resultados = document.querySelectorAll('.resultado');
        let sum = 0;
        resultados.forEach(input => {
            const value = parseFloat(input.value) || 0; // Convertir el valor a número
            sum += value;
        });
        totalLabel.textContent = `Total Multas: ${sum.toFixed(2)}`; // Actualizar el label
    };

    // Función para agregar un nuevo bloque
    const addNewBlock = (data = {}) => {
        blockCount++;

        // Crear el contenedor del bloque
        const block = document.createElement('div');
        block.classList.add('block');

        // Crear el label con numeración automática
        const label = document.createElement('label');
        label.textContent = `${blockCount}`;
        label.classList.add('label-numerado');

        // Crear el checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        // Crear el select adicional después del checkbox
        const selectElement = document.createElement('select');
        selectElement.innerHTML = `
            <option>SELECCIONAR UNA OPCIÓN:</option>
            <option>LAAR</option>
            <option>SECURITAS</option>
            <option>JARASEGURIDAD</option>
            <option>INVIN</option>
            <option>OCEANSECURITY</option>
        `;

        // Crear los inputs de texto
        const inputText1 = document.createElement('input');
        inputText1.type = 'text';
        inputText1.placeholder = 'Código';
        inputText1.classList.add('input-text-1');

        const inputText2 = document.createElement('input');
        inputText2.type = 'text';
        inputText2.placeholder = 'Ubicación';
        inputText2.classList.add('input-text-2');

        const inputText3 = document.createElement('input');
        inputText3.type = 'text';
        inputText3.placeholder = 'Nombre Guardia';
        inputText3.classList.add('input-text-3');

        // Crear el input de tipo fecha
        const inputDate = document.createElement('input');
        inputDate.type = 'date';

        // Crear el select personalizado
        const customSelect = document.createElement('div');
        customSelect.classList.add('custom-select');
        customSelect.style.width = '400px';
        customSelect.innerHTML = `
            <input type="text" class="selected-option" placeholder="Buscar y seleccionar..." autocomplete="off">
            <div class="options">
                <div data-value="100">1) Guardia que no se presenta a su turno, o se reemplaze con otro guardia que este en el mismo proyecto, peaje o ubicación trabajando para la empresa.</div>
                <div data-value="50">2) Abandonar el puesto de guardia. </div>
                <div data-value="50">3) Guardia que dobla turno de trabajo.</div>
                <div data-value="50">4) Incumplimiento de procedimientos ante acciones de emergencia (accidentes, volcamiento de maquinaria, deslaves, uso de explosivos).</div>
                <div data-value="50">5) No entregar, o entregar fuera de las fechas acordadas,a la Empresa Auditora contratada la documentación necesaria para el informe de personal.</div>
                <div data-value="50">6) No registrar debidamente la información en los libros de control o adulterar datos en los libros.</div>
                <div data-value="50">7) No usar el EPP necesario en el puesto de vigilancia o bandera.</div>
                <div data-value="50">8) Permitir el ingreso de personas armadas.</div>
                <div data-value="50">9) Permitir el ingreso de personas no autorizadas.</div>
                <div data-value="50">10) Permitir el paso de vehículos o personas no autorizadas a los frentes de trabajo.</div>
                <div data-value="50">11) Personal de vigilancia conduciendo cualquier tipo de vehículo de LA CONTRATANTE sin la autorización respectiva de esta.</div>
                <div data-value="50">12) Personal de vigilancia en estado etílico o que sea encontrado ingiriendo licor en el puesto de trabajo .</div>
                <div data-value="50">13) Proporcionar información sobre Empleados, Operaciones, Vehículos, Instalaciones, números telefónicos a personas ajenas a la Empresa.</div>
                <div data-value="50">14) Puertas peatonales y/o vehiculares abiertas sin justificación válida.</div>
                <div data-value="50">15) Puesto de servicio no cubierto durante más de 60 minutos.</div>
                <div data-value="50">16) Arma con permiso caducado.</div>
                <div data-value="50">17) Ausencia de registro en las bitácoras de datos de personal y/o vehículos que ingresan y/o salen de las instalaciones.</div>
                <div data-value="40">18) Falta de reporte de guardianía a la estación de peaje asignada.</div>
                <div data-value="40">19) No reportar a  la Administración el ingreso a las instalaciones de Empleados de la Empresa que están en estado etílico evidente.</div>
                <div data-value="40">20) No usar adecuadamente la señalización en las vías para control de tráfico durante los trabajos de los frentes de construcción y/o mantenimiento.</div>
                <div data-value="40">22) Permitir el ingreso de personas externas a la empresa, que estén en estado etílico evidente.</div>
                <div data-value="40">23) Personal de la empresa de seguridad en áreas no autorizadas.</div>
                <div data-value="40">24) Personal de vigilancia que sea encontrado durmiendo en el puesto de trabajo.</div>
                <div data-value="40">25) Recibir notificaciones dirigidas a la Empresa o sus Representantes.</div>
                <div data-value="40">26) Reemplazar personal de vigilancia sin la autorización de LA CONTRATANTEA. Aún tratándose de casos de emergencia</div>
                <div data-value="40">27) Retirar sin autorización los elementos de señalización de vías.</div>
                <div data-value="30">28) Ausencia del Supervisor en fechas y  horas acordadas(Servirá como fuente  de información los registros en las bitácoras de guardianía).</div>
                <div data-value="30">29) Equipo de comunicaciones sin funcionar.</div>
                <div data-value="30">30) No presentar a la Jefatura de Seguridad de LA CONTRATANTE el informe de las investigaciones solicitadas dentro de las 48 horas laborables siguientes a la ocurrencia de un asalto, robo, sabotaje, secuestro, acto de terrorismo,  siniestro u otro similar, ocurridos en los sitios de vigilancia contratada y que pueda afectar a la integridad de personas, bienes o instalaciones.</div>
                <div data-value="30">31) No registrar adecuadamente los datos y condiciones de la maquinaria que queda a su cargo en las vías.</div>
                <div data-value="30">32) No reportar  a la Jefatura de Seguridad aquellos eventos en los que se puedan presentar afectaciones a  la integridad  de  personas, bienes, instalaciones de LA CONTRATANTE conforme lo detallado en este contrato.</div>
                <div data-value="30">33) Permitir el ingreso de cámaras, filmadoras sin autorización.</div>
                <div data-value="30">34) Retraso en la asistencia al puesto de servicio, menor a 60 minutos.</div>
                <div data-value="30">35) Usar equipos no autorizados durante horas de trabajo (celulares, audífonos, gafas, libros, revistas, televisiones,  y otros).</div>
                <div data-value="20">36) Uso de vehículos sin logotipos de la empresa de seguridad durante la supervisión a los puestos de vigilancia.</div>
                <div data-value="20">37) Arma defectuosa en el funcionamiento.</div>
                <div data-value="20">38) Comportamiento inadecuado con Trabajadores, Usuarios, otros Guardias, etc.</div>
                <div data-value="20">39) Dejar abandonados los implementos para control  de tráfico en carreteras (bastón luminoso, paleta señalizadora, señalización, conos de seguridad).</div>
                <div data-value="20">40) Permitir el  ingreso de familiares de los empleados sin autorización de la Administración.</div>
                <div data-value="20">41) Permitir la presencia de personas no autorizadas en el puesto de control.</div>
                <div data-value="20">42) Guardia de estación de peaje que no se presenta en las horas señaladas ante la Administración para el control correspondiente.</div>
                <div data-value="10">43) No comunicar a conductores de motocicletas que usen el casco de seguridad para salir de las instalaciones.</div>
                <div data-value="10">44) No comunicar a conductores de vehículos pesados, maquinaria y otros vehículos que usen el cinturón de seguridad y enciendan las luces al ingresar a los centros de operación.</div>
                <div data-value="10">45) Linterna sin funcionar.</div>
                <div data-value="10">46) Mala presentación del guardia de seguridad (uniforme, apariencia personal).</div>
                <div data-value="10">47) No comunicar las novedades del puesto de trabajo al Administrador.</div>
                <div data-value="10">48) No mantener limpio el puesto de trabajo.</div>
                <div data-value="10">49) No mantener limpios los elementos de señalización ubicados en un área de 20 metros alrededor del puesto de trabajo.</div>
                <div data-value="10">50) Recibir visitas durante el turno de trabajo, sin autorización del Administrador.</div>
                <div data-value="10">51) Supervisor de Seguridad que se presenta sin el uniforme de LA CONTRATISTA.</div>
                <div data-value="10">52) Rondas no marcadas con el dispositivo electrónico de rondas.</div>
                <div data-value="10">53) No reportarse a la central de monitoreo.</div>
                <div data-value="10">54) No realizar el mantenimiento preventivo al arma de dotación.</div>
                <div data-value="10">55) No cumplir con la dotación requerida dentro del plazo máximo de 15 días.</div>
                <div data-value="10">56) Central de monitoreo no responde a los reportes.</div>
                <div data-value="20">57) No cumplir con las disposiciones requeridas por la CONTRATANTE.</div>
                <div data-value="10">58) Portar el chaleco antibalas con láminas de seguridad caducadas.</div>
            </div>
        `;

        // Crear el input de resultado dentro del bloque
        const inputResultado = document.createElement('input');
        inputResultado.type = 'text';
        inputResultado.classList.add('resultado');
        inputResultado.placeholder = '0.00';
        inputResultado.readOnly = true;
        inputResultado.style.width = '50px';
        inputResultado.maxLength = '6'; // Limitar a 6 cifras

        // Lógica de selección para el select personalizado
        const selectedOption = customSelect.querySelector('.selected-option');
        const options = customSelect.querySelector('.options');

        selectedOption.addEventListener('input', () => {
    const filter = selectedOption.value.toLowerCase();
    const allOptions = options.querySelectorAll('div[data-value]');
    
    allOptions.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(filter) ? 'block' : 'none';
    });

    customSelect.classList.add('show');
});

options.addEventListener('click', (e) => {
    if (e.target.matches('[data-value]')) {
        selectedOption.value = e.target.textContent;
        customSelect.classList.remove('show');

        const valorSeleccionado = parseFloat(e.target.getAttribute('data-value'));
        inputResultado.value = valorSeleccionado.toFixed(2);
        calculateTotal();
    }
});

        // Cerrar el select cuando se hace clic fuera de él
        document.addEventListener('click', function(event) {
            if (!customSelect.contains(event.target)) {
                customSelect.classList.remove('show');
            }
        });

        // Si hay datos, llenar los inputs
        if (data) {
            checkbox.checked = data.checkbox || false;
            selectElement.value = data.selectValue || "SELECCIONAR UNA OPCIÓN:";
            inputText1.value = data.inputText1Value || '';
            inputText2.value = data.inputText2Value || '';
            inputText3.value = data.inputText3Value || '';
            inputDate.value = data.inputDateValue || '';
            inputResultado.value = data.resultadoValue || '0.00';
            selectedOption.textContent = data.selectedOption || '-- Elige una opción --';
        }

        // Añadir los elementos al bloque
        block.appendChild(label);
        block.appendChild(checkbox);
        block.appendChild(selectElement); // Añadir el select adicional
        block.appendChild(inputText1);
        block.appendChild(inputText2);
        block.appendChild(inputText3); // Añadir el nuevo input al lado de Texto 2
        block.appendChild(inputDate);
        block.appendChild(customSelect); // Añadir el select personalizado
        block.appendChild(inputResultado); // Añadir el resultado al bloque

        // Añadir el bloque al contenedor de bloques
        elementContainer.appendChild(block);

        // Guardar el estado en localStorage
        saveBlocksToLocalStorage();
    };

    // Función para guardar los bloques en localStorage
    const saveBlocksToLocalStorage = () => {
        const blocksData = [];
        const blocks = document.querySelectorAll('.block');

        blocks.forEach(block => {
            const checkbox = block.querySelector('input[type="checkbox"]').checked;
            const selectValue = block.querySelector('select').value;
            const inputText1Value = block.querySelector('.input-text-1').value;
            const inputText2Value = block.querySelector('.input-text-2').value;
            const inputText3Value = block.querySelector('.input-text-3').value; // Asegúrate de acceder correctamente
            const inputDateValue = block.querySelector('input[type="date"]').value;
            const resultadoValue = block.querySelector('.resultado').value;
            const selectedOption = block.querySelector('.selected-option').textContent;

            blocksData.push({
                checkbox,
                selectValue,
                inputText1Value,
                inputText2Value,
                inputText3Value,
                inputDateValue,
                resultadoValue,
                selectedOption
            });
        });

        localStorage.setItem('blocksData', JSON.stringify(blocksData));
    };

    // Función para cargar los bloques desde localStorage
    const loadBlocksFromLocalStorage = () => {
        const blocksData = JSON.parse(localStorage.getItem('blocksData'));

        if (blocksData) {
            blocksData.forEach(data => {
                addNewBlock(data); // Pasar los datos al agregar el bloque
            });
            calculateTotal(); // Calcular el total después de cargar los bloques
        }
    };

    // Función para eliminar los bloques con checkbox seleccionado
    const deleteCheckedBlocks = () => {
        const blocks = document.querySelectorAll('.block');

        blocks.forEach(block => {
            const checkbox = block.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                block.remove();
            }
        });

        // Reenumerar los bloques restantes
        renumberBlocks();
        calculateTotal(); // Actualizar la suma después de eliminar bloques
        saveBlocksToLocalStorage(); // Guardar el estado actualizado en localStorage
    };

    // Función para reenumerar los bloques
    const renumberBlocks = () => {
        const blocks = document.querySelectorAll('.block');
        blocks.forEach((block, index) => {
            const label = block.querySelector('label');
            label.textContent = `${index + 1}`; // Reasignar el número del bloque
        });
        blockCount = blocks.length; // Actualizar el contador total de bloques
    };

    // Función para seleccionar todos los checkboxes
    const toggleSelectAll = () => {
        const blocks = document.querySelectorAll('.block');
        const selectAllCheckbox = selectAllBtn.querySelector('input[type="checkbox"]');

        blocks.forEach(block => {
            const checkbox = block.querySelector('input[type="checkbox"]');
            checkbox.checked = selectAllCheckbox.checked; // Sincronizar el estado del checkbox
        });
    };

    // Inicialización de los eventos
    addBlockBtn.addEventListener('click', () => {
        addNewBlock();
    });

    deleteCheckedBtn.addEventListener('click', deleteCheckedBlocks);
    selectAllBtn.querySelector('input[type="checkbox"]').addEventListener('click', toggleSelectAll);
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Cargar los bloques desde localStorage al iniciar
    loadBlocksFromLocalStorage();
});
