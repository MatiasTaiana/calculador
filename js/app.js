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

    resultadosAnterioresDiv.style.display = 'block'; // Mostrar el div
}

// Función para mostrar detalles de los ingredientes
function mostrarDetallesIngredientes(ingredientes, recetaDiv, botonDetalles) {
    let detallesHTML = '<h4>Detalles de ingredientes:</h4>';

    ingredientes.forEach(ingrediente => {
        const costo = calcularCostoIngrediente(ingrediente.cantidad, ingrediente.pesoPaquete, ingrediente.valorPaquete);
        detallesHTML += `
            <p>Ingrediente: ${ingrediente.nombre}</p>
            <p>Cantidad: ${ingrediente.cantidad}g</p>
            <p>Costo: $${costo.toFixed(2)}</p>
            <hr>
        `;
    });

    recetaDiv.innerHTML += detallesHTML;
    botonDetalles.style.display = 'none'; // Ocultar botón después de mostrar detalles
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

    if (ingredientes.length > 0) {
        // Elimina el último ingrediente en la lista
        contenedorIngredientes.removeChild(ingredientes[ingredientes.length - 1]);
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
    mostrarResultadosAnteriores();
});



// function obtenerEntrada(promptMessage, isNumber = false) {
//     let entrada;
//     do {
//         entrada = prompt(promptMessage);
//         if (entrada === null) {
//             alert('Operación cancelada por el usuario.');
//             throw new Error('Operación cancelada por el usuario.');
//         }
//         if (isNumber) {
//             entrada = parseFloat(entrada);
//             if (isNaN(entrada) || entrada <= 0) {
//                 alert('Debe ingresar un número válido mayor que 0.');
//                 entrada = null;
//             }
//         } else {
//             if (!entrada.trim()) {
//                 alert('Debe ingresar un texto válido.');
//                 entrada = null;
//             }
//         }
//     } while (entrada === null);
//     return entrada;
// }

// let nombreReceta = obtenerEntrada('¿Qué vas a cocinar?');
// let porciones = obtenerEntrada('¿Para cuántas porciones va a ser esta receta?', true);
// let ingredientes = [];

// do {
//     let nombreIngrediente = obtenerEntrada('¿Qué ingrediente vas a usar?');
//     let cantidad = obtenerEntrada('¿Qué cantidad vas a usar?', true);
//     let pesoPaquete = obtenerEntrada('¿Cuánto pesaba el paquete?', true);
//     let valorPaquete = obtenerEntrada('¿Cuál era el valor del paquete?', true);
    
//     function reglaDeTres(cantidad, pesoPaquete, valorPaquete) {
//         return (valorPaquete / pesoPaquete) * cantidad;
//     }
    
//     let costo = reglaDeTres(cantidad, pesoPaquete, valorPaquete);
//     ingredientes.push({ nombre: nombreIngrediente, cantidad: cantidad, costo: costo });

// } while (confirm('¿Quieres agregar otro ingrediente?'));

// function sumarCostos(ingredientes) {
//     let totalCosto = 0;
//     for (let i = 0; i < ingredientes.length; i++) {
//         totalCosto += ingredientes[i].costo;
//     }
//     return totalCosto;
// }

// let costoTotal = sumarCostos(ingredientes);

// ingredientes.forEach(ingrediente => {
//     console.log(`Ingrediente: ${ingrediente.nombre}, Cantidad: ${ingrediente.cantidad}, Costo: $${ingrediente.costo.toFixed(2)}`);
// });

// function divisionCostoPorcion(costoTotal, porciones) {
//     return costoTotal / porciones;
// }

// let costoPorcion = divisionCostoPorcion(costoTotal, porciones);
// alert(`Costo total de ${nombreReceta} es de $${costoTotal.toFixed(2)}`);
// alert(`El costo de cada porción es de $${costoPorcion.toFixed(2)}`);

