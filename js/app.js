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
            Toastify({

                text: "Por favor completa todos los campos",
                position: "center",
                duration: 5000,
                style: {
                    background: "#ff0000",
                  },
                }).showToast();;
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
        Toastify({
        text: "Esta receta ya fue calculada con los mismos ingredientes y cantidades.",
        position: "center",
        duration: 5000,
        style: {
            background: "#ff0000",
          },
        }).showToast();
        
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
// Función para cotizar el costo en dólares
async function cotizarEnDolares(index) {
    try {
        const response = await fetch("https://dolarapi.com/v1/dolares/blue");
        if (!response.ok) {
            throw new Error('Error al obtener el valor del dólar.');
        }
        const data = await response.json();
        const valorDolar = parseFloat(data.venta);
        
        let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
        const resultado = resultados[index];

        if (!isNaN(valorDolar)) {
            const costoTotalDolares = resultado.costoTotal / valorDolar;
            const costoPorcionDolares = resultado.costoPorcion / valorDolar;

            Toastify({
                text: `Costo total en dólares: $${costoTotalDolares.toFixed(2)}\nCosto por porción en dólares: $${costoPorcionDolares.toFixed(2)}`,
                position: "center",
                duration: 10000,
                style: {
                    background: "#ff0000",
                  },
                close: true
            }).showToast();
        } else {
            throw new Error('El valor del dólar no es válido.');
        }
    } catch (error) {
        console.error('Error:', error);
        Toastify({
            text: 'Hubo un error al intentar obtener el valor del dólar.',
            duration: 5000,
            style: {
                background: "#ff0000",
              },
            close: true
        }).showToast();
    }
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
        Toastify({
            text: 'No puedes eliminar el ingrediente original.',
            position: "center",
            duration: 5000,
            style: {
                background: "#ff0000",
              },
            }).showToast();
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


// Clase para representar un ingrediente
// class Ingrediente {
//     constructor(nombre, cantidad, unidadCantidad, pesoPaquete, unidadPesoPaquete, valorPaquete) {
//         this.nombre = nombre;
//         this.cantidad = cantidad;
//         this.unidadCantidad = unidadCantidad;
//         this.pesoPaquete = pesoPaquete;
//         this.unidadPesoPaquete = unidadPesoPaquete;
//         this.valorPaquete = valorPaquete;
//         this.esPorGramo = unidadCantidad === 'gramos' && unidadPesoPaquete === 'gramos';
//     }
// }

// // Función para mostrar notificaciones
// function mostrarToast(mensaje, tipo = 'info') {
//     const colores = {
//         info: '#007bff',
//         success: '#28a745',
//         warning: '#ffc107',
//         error: '#dc3545'
//     };
//     Toastify({
//         text: mensaje,
//         duration: 5000,
//         style: {
//             background: colores[tipo],
            
//         },
//         close: true
//     }).showToast();
// }

// // Validación de campos vacíos
// function validarIngrediente(ingrediente) {
//     const { nombre, cantidad, pesoPaquete, valorPaquete } = ingrediente;
//     let errores = [];
//     if (!nombre) errores.push("El nombre del ingrediente es obligatorio.");
//     if (isNaN(cantidad) || cantidad <= 0) errores.push("La cantidad debe ser un número positivo.");
//     if (isNaN(pesoPaquete) || pesoPaquete <= 0) errores.push("El peso del paquete debe ser un número positivo.");
//     if (isNaN(valorPaquete) || valorPaquete <= 0) errores.push("El valor del paquete debe ser un número positivo.");
//     return errores;
// }

// // Función para calcular el costo de un ingrediente
// function calcularCostoIngrediente(ingrediente) {
//     return (ingrediente.valorPaquete / ingrediente.pesoPaquete) * ingrediente.cantidad;
// }

// // Función para calcular el costo total de los ingredientes
// function calcularCostoTotal() {
//     const porciones = parseFloat(document.getElementById('porciones').value);
//     const ingredientesForms = document.querySelectorAll('#contenedorIngredientes .contenedor_form');
//     let costoTotal = 0;

//     for (const form of ingredientesForms) {
//         const ingrediente = obtenerDatosIngrediente(form);
//         const errores = validarIngrediente(ingrediente);

//         if (errores.length) {
//             mostrarToast(errores.join(' '), 'error');
//             return null;
//         }

//         const costo = calcularCostoIngrediente(ingrediente);
//         costoTotal += costo;
//     }

//     return { costoTotal, porciones };
// }

// // Función para obtener datos de un ingrediente desde un formulario
// function obtenerDatosIngrediente(form) {
//     const nombre = form.querySelector('[placeholder="Harina"]').value;
//     const cantidad = parseFloat(form.querySelector('[placeholder="Gramos o unidades"]').value);
//     const pesoPaquete = parseFloat(form.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value);
//     const valorPaquete = parseFloat(form.querySelector('[placeholder="$$$"]').value);
//     const unidadCantidad = form.querySelectorAll('.unit-select')[0].value;
//     const unidadPesoPaquete = form.querySelectorAll('.unit-select')[1].value;

//     return new Ingrediente(nombre, cantidad, unidadCantidad, pesoPaquete, unidadPesoPaquete, valorPaquete);
// }

// // Función para guardar los resultados en el Local Storage
// function guardarResultado(nombreReceta, costoTotal, costoPorcion, ingredientes) {
//     let resultados = JSON.parse(localStorage.getItem('resultados')) || [];

//     const recetaExistente = resultados.find(resultado => 
//         resultado.nombreReceta === nombreReceta && 
//         sonIngredientesIguales(resultado.ingredientes, ingredientes)
//     );

//     if (recetaExistente) {
//         mostrarToast("Esta receta ya fue calculada con los mismos ingredientes y cantidades.", 'warning');
//         return;
//     }

//     resultados.push({ nombreReceta, costoTotal, costoPorcion, ingredientes });
//     localStorage.setItem('resultados', JSON.stringify(resultados));
// }

// // Función para comparar dos listas de ingredientes
// function sonIngredientesIguales(ingredientes1, ingredientes2) {
//     if (ingredientes1.length !== ingredientes2.length) return false;
//     return ingredientes1.every((ing1, index) => {
//         const ing2 = ingredientes2[index];
//         return ing1.nombre === ing2.nombre &&
//                ing1.cantidad === ing2.cantidad &&
//                ing1.pesoPaquete === ing2.pesoPaquete &&
//                ing1.valorPaquete === ing2.valorPaquete &&
//                ing1.unidadCantidad === ing2.unidadCantidad &&
//                ing1.unidadPesoPaquete === ing2.unidadPesoPaquete;
//     });
// }

// // Función para borrar una receta del Local Storage y actualizar la vista
// function borrarReceta(index) {
//     let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
//     resultados.splice(index, 1);
//     localStorage.setItem('resultados', JSON.stringify(resultados));
//     mostrarResultadosAnteriores();
// }

// // Función para cotizar el costo en dólares
// async function cotizarEnDolares(index) {
//     const valorDolarCache = localStorage.getItem('valorDolar');
//     const tiempoCache = localStorage.getItem('tiempoCache');
//     const ahora = Date.now();

//     if (valorDolarCache && tiempoCache && (ahora - tiempoCache) < 3600000) {
//         mostrarCotizacionEnDolares(valorDolarCache, index);
//     } else {
//         try {
//             const response = await fetch("https://dolarapi.com/v1/dolares/blue");
//             if (!response.ok) throw new Error('Error al obtener el valor del dólar.');
//             const data = await response.json();
//             const valorDolar = parseFloat(data.venta);
//             localStorage.setItem('valorDolar', valorDolar);
//             localStorage.setItem('tiempoCache', ahora);
//             mostrarCotizacionEnDolares(valorDolar, index);
//         } catch (error) {
//             mostrarToast('Hubo un error al intentar obtener el valor del dólar.', 'error');
//         }
//     }
// }

// function mostrarCotizacionEnDolares(valorDolar, index) {
//     let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
//     const resultado = resultados[index];
//     const costoTotalDolares = resultado.costoTotal / valorDolar;
//     const costoPorcionDolares = resultado.costoPorcion / valorDolar;

//     mostrarToast(`Costo total en dólares: $${costoTotalDolares.toFixed(2)}\nCosto por porción en dólares: $${costoPorcionDolares.toFixed(2)}`, 'success');
// }

// // Función para mostrar resultados anteriores
// function mostrarResultadosAnteriores() {
//     const resultadosAnterioresDiv = document.getElementById('resultadosAnteriores');
//     let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
//     resultadosAnterioresDiv.innerHTML = '';

//     if (resultados.length > 0) {
//         resultados.forEach((resultado, index) => {
//             const recetaDiv = document.createElement('div');
//             recetaDiv.classList.add('resultadoAnterior');
//             recetaDiv.innerHTML = `
//                 <p><strong>Nombre de la receta:</strong> ${resultado.nombreReceta}</p>
//                 <p><strong>Costo total:</strong> $${resultado.costoTotal.toFixed(2)}</p>
//                 <p><strong>Costo por porción:</strong> $${resultado.costoPorcion.toFixed(2)}</p>
//                 <button class="botonReceta" id="detalles-${index}">Detalles</button>
//                 <button class="botonReceta" id="borrar-${index}">Borrar receta</button>
//                 <button class="botonReceta" id="dolar-${index}">Cotizar en dolares</button>
//             `;
//             resultadosAnterioresDiv.appendChild(recetaDiv);

//             document.getElementById(`detalles-${index}`).addEventListener('click', function() {
//                 mostrarDetallesIngredientes(resultado.ingredientes, recetaDiv, this);
//             });
//             document.getElementById(`borrar-${index}`).addEventListener('click', function() {
//                 borrarReceta(index);
//             });
//             document.getElementById(`dolar-${index}`).addEventListener('click', function() {
//                 cotizarEnDolares(index);
//             });
//         });
//     } else {
//         resultadosAnterioresDiv.innerHTML = '<p>No hay resultados anteriores.</p>';
//     }
// }

// // Función para mostrar detalles de los ingredientes
// function mostrarDetallesIngredientes(ingredientes, recetaDiv, botonDetalles) {
//     const detallesVisible = recetaDiv.querySelector('.detallesIngredientes');
//     if (detallesVisible) {
//         detallesVisible.remove();
//         botonDetalles.textContent = 'Detalles';
//     } else {
//         let detallesHTML = '<div class="detallesIngredientes"><h4>Detalles de ingredientes:</h4>';
//         ingredientes.forEach(ingrediente => {
//             const costo = calcularCostoIngrediente(ingrediente);
//             detallesHTML += `
//                 <p>Ingrediente: ${ingrediente.nombre}</p>
//                 <p>Cantidad: ${ingrediente.cantidad} ${ingrediente.unidadCantidad}</p>
//                 <p>Costo: $${costo.toFixed(2)}</p>
//                 <hr>
//             `;
//         });
//         detallesHTML += '</div>';
//         recetaDiv.insertAdjacentHTML('beforeend', detallesHTML);
//         botonDetalles.textContent = 'Ocultar detalles';
//     }
// }

// // Event listeners para botones principales
// document.getElementById('botonCalcular').addEventListener('click', function() {
//     const nombreReceta = document.getElementById('nombreReceta').value.trim();
//     const resultadoDiv = document.getElementById('resultado');
//     const { costoTotal, porciones } = calcularCostoTotal();

//     if (!nombreReceta || isNaN(costoTotal) || isNaN(porciones) || porciones <= 0 || costoTotal <= 0) {
//         resultadoDiv.textContent = 'Por favor ingrese todos los campos correctamente.';
//         return;
//     }

//     const costoPorcion = costoTotal / porciones;
//     resultadoDiv.innerHTML = `
//         <p>Costo total de la receta: $${costoTotal.toFixed(2)}</p>
//         <p>Costo por porción: $${costoPorcion.toFixed(2)}</p>
//     `;

//     const ingredientes = Array.from(document.querySelectorAll('#contenedorIngredientes .contenedor_form'))
//         .map(obtenerDatosIngrediente);

//     guardarResultado(nombreReceta, costoTotal, costoPorcion, ingredientes);
// });

// document.getElementById('botonBorrarUltimo').addEventListener('click', function() {
//     const contenedorIngredientes = document.getElementById('contenedorIngredientes');
//     const ingredientes = contenedorIngredientes.querySelectorAll('.contenedor_form');
//     if (ingredientes.length > 1) {
//         contenedorIngredientes.removeChild(ingredientes[ingredientes.length - 1]);
//     } else {
//         mostrarToast('No puedes eliminar el ingrediente original.', 'error');
//     }
// });

// document.getElementById('botonDuplicar').addEventListener('click', function() {
//     const contenedorIngrediente = document.getElementById('ingrediente');
//     const nuevoIngrediente = contenedorIngrediente.cloneNode(true);
//     nuevoIngrediente.querySelector('#nombreIngrediente').value = '';
//     nuevoIngrediente.querySelector('[placeholder="Gramos o unidades"]').value = '';
//     nuevoIngrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value = '';
//     nuevoIngrediente.querySelector('[placeholder="$$$"]').value = '';
//     nuevoIngrediente.removeAttribute('id');
//     nuevoIngrediente.querySelector('#nombreIngrediente').removeAttribute('id');
//     document.getElementById('contenedorIngredientes').appendChild(nuevoIngrediente);
// });

// document.getElementById('botonResultadosAnteriores').addEventListener('click', function() {
//     const resultadosAnterioresDiv = document.getElementById('resultadosAnteriores');
//     if (resultadosAnterioresDiv.style.display === 'none' || resultadosAnterioresDiv.style.display === '') {
//         mostrarResultadosAnteriores();
//         resultadosAnterioresDiv.style.display = 'block';
//     } else {
//         resultadosAnterioresDiv.style.display = 'none';
//     }
// });

// document.getElementById('toggleDarkMode').addEventListener('click', function () {
//     document.body.classList.toggle('dark-mode');
//     localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
// });

// window.onload = function () {
//     if (localStorage.getItem('dark-mode') === 'enabled') {
//         document.body.classList.add('dark-mode');
//     }
// };
