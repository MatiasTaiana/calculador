// Función para calcular el costo de un ingrediente
function calcularCostoIngrediente(cantidad, pesoPaquete, valorPaquete) {
    return (valorPaquete / pesoPaquete) * cantidad;
}

// Función para calcular el costo total de los ingredientes
function calcularCostoTotal() {
    const porciones = parseFloat(document.getElementById('porciones').value);
    const ingredientes = document.querySelectorAll('#contenedorIngredientes .contenedor_form');
    let costoTotal = 0;

    ingredientes.forEach(ingrediente => {
        const cantidad = parseFloat(ingrediente.querySelector('[placeholder="Gramos o unidades"]').value);
        const pesoPaquete = parseFloat(ingrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value);
        const valorPaquete = parseFloat(ingrediente.querySelector('[placeholder="$$$"]').value);

        if (!isNaN(cantidad) && !isNaN(pesoPaquete) && !isNaN(valorPaquete) && cantidad > 0 && pesoPaquete > 0 && valorPaquete > 0) {
            const costo = calcularCostoIngrediente(cantidad, pesoPaquete, valorPaquete);
            costoTotal += costo;
        }
    });

    return { costoTotal, porciones };
}

// Función para guardar los resultados en el Local Storage
function guardarResultado(nombreReceta, costoTotal, costoPorcion, ingredientes) {
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
    resultados.push({ nombreReceta, costoTotal, costoPorcion, ingredientes });
    localStorage.setItem('resultados', JSON.stringify(resultados));
}

// Función para mostrar resultados anteriores
function mostrarResultadosAnteriores() {
    const resultadosAnterioresDiv = document.getElementById('resultadosAnteriores');
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
    
    resultadosAnterioresDiv.innerHTML = ''; // Limpiar resultados anteriores

    if (resultados.length > 0) {
        resultados.forEach((resultado, index) => {
            const recetaDiv = document.createElement('div');
            recetaDiv.innerHTML = `
                <p><strong>Nombre de la receta:</strong> ${resultado.nombreReceta}</p>
                <p><strong>Costo total:</strong> $${resultado.costoTotal.toFixed(2)}</p>
                <p><strong>Costo por porción:</strong> $${resultado.costoPorcion.toFixed(2)}</p>
                <button id="detalles-${index}">Detalles</button>
                <hr>
            `;
            resultadosAnterioresDiv.appendChild(recetaDiv);

            // Añadir event listener al botón de detalles
            document.getElementById(`detalles-${index}`).addEventListener('click', function() {
                mostrarDetallesIngredientes(resultado.ingredientes, recetaDiv, this);
            });
        });
    } else {
        resultadosAnterioresDiv.innerHTML = '<p>No hay resultados anteriores.</p>';
    }
}

// Función para mostrar detalles de los ingredientes
function mostrarDetallesIngredientes(ingredientes, recetaDiv, botonDetalles) {
    // Verifica si los detalles ya están visibles
    const detallesVisible = recetaDiv.querySelector('.detallesIngredientes');

    if (detallesVisible) {
        // Si los detalles ya están visibles, los elimina
        detallesVisible.remove();
        botonDetalles.textContent = 'Detalles'; // Cambia el texto del botón de nuevo a "Detalles"
    } else {
        // Si los detalles no están visibles, los muestra
        let detallesHTML = '<div class="detallesIngredientes"><h4>Detalles de ingredientes:</h4>';

        ingredientes.forEach(ingrediente => {
            const costo = calcularCostoIngrediente(ingrediente.cantidad, ingrediente.pesoPaquete, ingrediente.valorPaquete);
            detallesHTML += `
                <p>Ingrediente: ${ingrediente.nombre}</p>
                <p>Cantidad: ${ingrediente.cantidad}g</p>
                <p>Costo: $${costo.toFixed(2)}</p>
                <hr>
            `;
        });

        detallesHTML += '</div>';
        recetaDiv.insertAdjacentHTML('beforeend', detallesHTML); // Usar insertAdjacentHTML para agregar detalles sin borrar otros elementos
        botonDetalles.textContent = 'Ocultar detalles'; // Cambia el texto del botón a "Ocultar detalles"
    }
}


// Event listener para el botón "Calcular"
document.getElementById('botonCalcular').addEventListener('click', function() {
    const nombreReceta = document.getElementById('nombreReceta').value.trim();
    const { costoTotal, porciones } = calcularCostoTotal();
    const resultadoDiv = document.getElementById('resultado');

    if (!nombreReceta || isNaN(costoTotal) || isNaN(porciones) || porciones <= 0 || isNaN(costoTotal) || costoTotal <= 0) {
        resultadoDiv.textContent = 'Por favor ingrese todos los campos correctamente.';
        return;
    }

    const costoPorcion = costoTotal / porciones;

    resultadoDiv.innerHTML = `
        <p>Costo total de la receta: $${costoTotal.toFixed(2)}</p>
        <p>Costo por porción: $${costoPorcion.toFixed(2)}</p>
    `;

    // Guardar resultado en Local Storage
    const ingredientes = Array.from(document.querySelectorAll('#contenedorIngredientes .contenedor_form')).map(ingrediente => {
        const nombre = ingrediente.querySelector('[placeholder="Harina"]').value;
        const cantidad = parseFloat(ingrediente.querySelector('[placeholder="Gramos o unidades"]').value);
        const pesoPaquete = parseFloat(ingrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value);
        const valorPaquete = parseFloat(ingrediente.querySelector('[placeholder="$$$"]').value);

        return { nombre, cantidad, pesoPaquete, valorPaquete };
    });

    guardarResultado(nombreReceta, costoTotal, costoPorcion, ingredientes);
});

// Event listener para el botón "Borrar último ingrediente"
document.getElementById('botonBorrarUltimo').addEventListener('click', function() {
    const contenedorIngredientes = document.getElementById('contenedorIngredientes');
    const ingredientes = contenedorIngredientes.querySelectorAll('.contenedor_form');

    if (ingredientes.length > 1) {  // Verifica que haya más de un ingrediente antes de borrar
        // Elimina el último ingrediente en la lista
        contenedorIngredientes.removeChild(ingredientes[ingredientes.length - 1]);
    } else {
        alert('No puedes eliminar el ingrediente original.');
    }
});


// Event listener para el botón "Agregar ingrediente"
document.getElementById('botonDuplicar').addEventListener('click', function() {
    const contenedorIngrediente = document.getElementById('ingrediente');
    const nuevoIngrediente = contenedorIngrediente.cloneNode(true);

    // Limpia los campos del nuevo ingrediente clonado
    nuevoIngrediente.querySelector('#nombreIngrediente').value = '';
    nuevoIngrediente.querySelector('[placeholder="Gramos o unidades"]').value = '';
    nuevoIngrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value = '';
    nuevoIngrediente.querySelector('[placeholder="$$$"]').value = '';

    // Elimina el ID del nuevo ingrediente clonado para evitar duplicados
    nuevoIngrediente.removeAttribute('id');
    nuevoIngrediente.querySelector('#nombreIngrediente').removeAttribute('id');

    // Añade el nuevo ingrediente clonado al contenedor principal
    document.getElementById('contenedorIngredientes').appendChild(nuevoIngrediente);
});

// Event listener para el botón "Resultados anteriores"
document.getElementById('botonResultadosAnteriores').addEventListener('click', function() {
    const resultadosAnterioresDiv = document.getElementById('resultadosAnteriores');

    if (resultadosAnterioresDiv.style.display === 'none' || resultadosAnterioresDiv.style.display === '') {
        mostrarResultadosAnteriores();  // Llenar contenido solo si se va a mostrar
        resultadosAnterioresDiv.style.display = 'block';
    } else {
        resultadosAnterioresDiv.style.display = 'none';
    }
});



