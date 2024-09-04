// Función para calcular el costo de un ingrediente
function calcularCostoIngrediente(cantidad, pesoPaquete, valorPaquete, esPorGramo) {
    // Si la cantidad está en unidades, el costo se calcula de manera diferente
    if (!esPorGramo) {
        return (valorPaquete / pesoPaquete) * cantidad;
    }
    return (valorPaquete / pesoPaquete) * cantidad;
}
function hayCamposVacios(ingredientes) {
    return ingredientes.some(ing => {
        return !ing.nombre || !ing.cantidad || !ing.pesoPaquete || !ing.valorPaquete || !ing.unidadCantidad || !ing.unidadPesoPaquete;
    });
}
// Función para calcular el costo total de los ingredientes
function calcularCostoTotal() {
    const porciones = parseFloat(document.getElementById('porciones').value);
    const ingredientes = document.querySelectorAll('#contenedorIngredientes .contenedor_form');
    let costoTotal = 0;

    // Validación de campos vacíos
    for (let i = 0; i < ingredientes.length; i++) {
        const ingrediente = ingredientes[i];
        const cantidad = ingrediente.querySelector('[placeholder="Gramos o unidades"]').value;
        const pesoPaquete = ingrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value;
        const valorPaquete = ingrediente.querySelector('[placeholder="$$$"]').value;
        const unidadCantidad = ingrediente.querySelectorAll('.unit-select')[0].value;
        const unidadPesoPaquete = ingrediente.querySelectorAll('.unit-select')[1].value;

        // Verificar si alguno de los campos está vacío o es inválido
        if (!cantidad || !pesoPaquete || !valorPaquete || !unidadCantidad || !unidadPesoPaquete) {
            alert('Por favor, completa todos los campos antes de calcular.');
            return; // Detener la ejecución si hay campos vacíos
        }
    }

    // Cálculo del costo total
    ingredientes.forEach(ingrediente => {
        const cantidad = parseFloat(ingrediente.querySelector('[placeholder="Gramos o unidades"]').value);
        const pesoPaquete = parseFloat(ingrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value);
        const valorPaquete = parseFloat(ingrediente.querySelector('[placeholder="$$$"]').value);

        // Verificar las unidades seleccionadas
        const unidadCantidad = ingrediente.querySelectorAll('.unit-select')[0].value; // 'gramos' o 'unidades'
        const unidadPesoPaquete = ingrediente.querySelectorAll('.unit-select')[1].value; // 'gramos' o 'unidades'

        // Si alguna de las unidades es 'unidades', ajustamos la lógica del cálculo
        const esPorGramo = unidadCantidad === 'gramos' && unidadPesoPaquete === 'gramos';

        if (!isNaN(cantidad) && !isNaN(pesoPaquete) && !isNaN(valorPaquete) && cantidad > 0 && pesoPaquete > 0 && valorPaquete > 0) {
            const costo = calcularCostoIngrediente(cantidad, pesoPaquete, valorPaquete, esPorGramo);
            costoTotal += costo;
        }
    });

    return { costoTotal, porciones };
}

// Función para comparar dos listas de ingredientes
function sonIngredientesIguales(ingredientes1, ingredientes2) {
    if (ingredientes1.length !== ingredientes2.length) return false;
    
    return ingredientes1.every((ing1, index) => {
        const ing2 = ingredientes2[index];
        return ing1.nombre === ing2.nombre &&
               ing1.cantidad === ing2.cantidad &&
               ing1.pesoPaquete === ing2.pesoPaquete &&
               ing1.valorPaquete === ing2.valorPaquete &&
               ing1.unidadCantidad === ing2.unidadCantidad &&
               ing1.unidadPesoPaquete === ing2.unidadPesoPaquete;
    });
}

// Función para guardar los resultados en el Local Storage
function guardarResultado(nombreReceta, costoTotal, costoPorcion, ingredientes) {
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];

    // Verificar si la receta ya existe
    const recetaExistente = resultados.find(resultado => 
        resultado.nombreReceta === nombreReceta && 
        sonIngredientesIguales(resultado.ingredientes, ingredientes)
    );

    if (recetaExistente) {
        alert('Esta receta ya fue calculada con los mismos ingredientes y cantidades.');
        return;  // Detiene la ejecución si la receta ya existe
    }

    // Si no existe, guardar el nuevo resultado
    resultados.push({ nombreReceta, costoTotal, costoPorcion, ingredientes });
    localStorage.setItem('resultados', JSON.stringify(resultados));
}
// Función para borrar una receta del Local Storage y actualizar la vista
function borrarReceta(index) {
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
    
    // Elimina la receta del array de resultados
    resultados.splice(index, 1);
    
    // Guarda el array actualizado en el Local Storage
    localStorage.setItem('resultados', JSON.stringify(resultados));
    
    // Actualiza la vista
    mostrarResultadosAnteriores();
}
// Función para cotizar el costo en dólares
function cotizarEnDolares(index) {
    fetch("https://dolarapi.com/v1/dolares/blue")
        .then(response => response.json())
        .then(data => {
            const valorDolar = parseFloat(data.venta);
            let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
            const resultado = resultados[index];

            if (!isNaN(valorDolar)) {
                const costoTotalDolares = resultado.costoTotal / valorDolar;
                const costoPorcionDolares = resultado.costoPorcion / valorDolar;

                alert(`Costo total en dólares: $${costoTotalDolares.toFixed(2)}\nCosto por porción en dólares: $${costoPorcionDolares.toFixed(2)}`);
            } else {
                alert('No se pudo obtener el valor del dólar.');
            }
        })
        .catch(error => {
            console.error('Error al obtener el valor del dólar:', error);
            alert('Hubo un error al intentar obtener el valor del dólar.');
        });
}

// Función para mostrar resultados anteriores
function mostrarResultadosAnteriores() {
    const resultadosAnterioresDiv = document.getElementById('resultadosAnteriores');
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
    
    resultadosAnterioresDiv.innerHTML = ''; // Limpiar resultados anteriores

    if (resultados.length > 0) {
        resultados.forEach((resultado, index) => {
            const recetaDiv = document.createElement('div');
            recetaDiv.classList.add('resultadoAnterior');  // Asigna la clase 'resultadoAnterior' al div
            
            recetaDiv.innerHTML = `
                <p><strong>Nombre de la receta:</strong> ${resultado.nombreReceta}</p>
                <p><strong>Costo total:</strong> $${resultado.costoTotal.toFixed(2)}</p>
                <p><strong>Costo por porción:</strong> $${resultado.costoPorcion.toFixed(2)}</p>
                <button class="botonReceta" id="detalles-${index}">Detalles</button>
                <button class="botonReceta" id="borrar-${index}">Borrar receta</button>
                <button class="botonReceta" id="dolar-${index}">Cotizar en dolares</button>
            `;
            resultadosAnterioresDiv.appendChild(recetaDiv);

            // Añadir event listener al botón de detalles
            document.getElementById(`detalles-${index}`).addEventListener('click', function() {
                mostrarDetallesIngredientes(resultado.ingredientes, recetaDiv, this);
            });
            // Añadir event listener al botón de borrar receta
            document.getElementById(`borrar-${index}`).addEventListener('click', function() {
                borrarReceta(index);
            });
            document.getElementById(`dolar-${index}`).addEventListener('click', function() {
                cotizarEnDolares(index);
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
        let detallesHTML = '<div class="detallesIngredientes"><h4>Detalles de ingredientes:</h4>';

        ingredientes.forEach(ingrediente => {
            // Mostrar correctamente la cantidad y las unidades
            const costo = calcularCostoIngrediente(ingrediente.cantidad, ingrediente.pesoPaquete, ingrediente.valorPaquete, ingrediente.esPorGramo);
            detallesHTML += `
                <p>Ingrediente: ${ingrediente.nombre}</p>
                <p>Cantidad: ${ingrediente.cantidad} ${ingrediente.unidadCantidad}</p>
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
        const unidadCantidad = ingrediente.querySelectorAll('.unit-select')[0].value;
        const unidadPesoPaquete = ingrediente.querySelectorAll('.unit-select')[1].value;
        const esPorGramo = unidadCantidad === 'gramos' && unidadPesoPaquete === 'gramos';

        return { nombre, cantidad, pesoPaquete, valorPaquete, unidadCantidad, unidadPesoPaquete, esPorGramo };
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
document.getElementById('toggleDarkMode').addEventListener('click', function () {
    // Alterna la clase 'dark-mode' en el elemento body
    document.body.classList.toggle('dark-mode');
    
    // Guardar la preferencia del usuario en el Local Storage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'enabled');
    } else {
        localStorage.setItem('dark-mode', 'disabled');
    }
});

// Al cargar la página, verifica la preferencia guardada del usuario
window.onload = function () {
    if (localStorage.getItem('dark-mode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
};


