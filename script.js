// Seleccionamos el contenedor donde se agregarán las líneas de inputs
const inputContainer = document.getElementById('input-container');
const addButton = document.getElementById('addButton');

// Función para crear una nueva línea de inputs
function crearLineaInput() {
    // Crear un div para contener los inputs y el botón de eliminar
    const div = document.createElement('div');
    div.classList.add('linea-input');

    // Crear el input
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ingresa un valor';

    // Crear el botón de eliminar
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Eliminar';

    // Agregar el evento para eliminar la línea de inputs
    deleteButton.addEventListener('click', function() {
        div.remove();
    });

    // Agregar el input y el botón de eliminar al div
    div.appendChild(input);
    div.appendChild(deleteButton);

    // Agregar el div al contenedor de inputs
    inputContainer.appendChild(div);
}

// Agregar evento al botón de agregar para crear una nueva línea de inputs
addButton.addEventListener('click', crearLineaInput);
