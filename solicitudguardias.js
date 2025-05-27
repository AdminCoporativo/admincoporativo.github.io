    // Obtener elementos del DOM
    const selectElement = document.getElementById('opciones');
    const inputElement = document.getElementById('respuesta');

    // Escuchar el evento de cambio en el select
    selectElement.addEventListener('change', function() {
      // Establecer el valor del input con la opción seleccionada
      inputElement.value = this.value;
    });
    
			// Obtener elementos del DOM
			const selectElement1 = document.getElementById('empresa');
			const imageElement1 = document.getElementById('imagen');
		
			// Escuchar el evento de cambio en el select
			selectElement1.addEventListener('change', function() {
			  // Obtener la opción seleccionada y cambiar la fuente de la imagen
			  imageElement1.src = this.value;
			});
	