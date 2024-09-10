function calcularCostoIngrediente(cantidad = 0, pesoPaquete = 0, valorPaquete = 0 , esPorGramo = false) {
    if (!esPorGramo) {
        return (valorPaquete / pesoPaquete) * cantidad;
    }
    return (valorPaquete / pesoPaquete) * cantidad;
}
function hayCamposVacios(ingredientes = []) {
    return ingredientes.some(ing => {
        return !ing.nombre || !ing.cantidad || !ing.pesoPaquete || !ing.valorPaquete || !ing.unidadCantidad || !ing.unidadPesoPaquete;
    });
}
function calcularCostoTotal() {
    const porciones = parseFloat(document.getElementById('porciones').value);
    const ingredientes = document.querySelectorAll('#contenedorIngredientes .contenedorForm');
    let costoTotal = 0;

    for (let i = 0; i < ingredientes.length; i++) {
        const ingrediente = ingredientes[i];
        const cantidad = ingrediente.querySelector('[placeholder="Gramos o unidades"]').value;
        const pesoPaquete = ingrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value;
        const valorPaquete = ingrediente.querySelector('[placeholder="$$$"]').value;
        const unidadCantidad = ingrediente.querySelectorAll('.selectorUnidades')[0].value;
        const unidadPesoPaquete = ingrediente.querySelectorAll('.selectorUnidades')[1].value;

        if (!cantidad || !pesoPaquete || !valorPaquete || !unidadCantidad || !unidadPesoPaquete) {
            Toastify({

                text: "Por favor completa todos los campos",
                position: "center",
                duration: 5000,
                style: {
                    background: "#ff0000",
                  },
                }).showToast();
            return; 
        }
    }

    ingredientes.forEach(ingrediente => {
        const cantidad = parseFloat(ingrediente.querySelector('[placeholder="Gramos o unidades"]').value);
        const pesoPaquete = parseFloat(ingrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value);
        const valorPaquete = parseFloat(ingrediente.querySelector('[placeholder="$$$"]').value);

        const unidadCantidad = ingrediente.querySelectorAll('.selectorUnidades')[0].value;
        const unidadPesoPaquete = ingrediente.querySelectorAll('.selectorUnidades')[1].value;

        const esPorGramo = unidadCantidad === 'gramos' && unidadPesoPaquete === 'gramos';

        if (!isNaN(cantidad) && !isNaN(pesoPaquete) && !isNaN(valorPaquete) && cantidad > 0 && pesoPaquete > 0 && valorPaquete > 0) {
            const costo = calcularCostoIngrediente(cantidad, pesoPaquete, valorPaquete, esPorGramo);
            costoTotal += costo;
        }
    });

    return { costoTotal, porciones };
}

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

function guardarResultado(nombreReceta = '', costoTotal = 0, costoPorcion = 0, ingredientes = []) {
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];

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
        
        return;
    }

    resultados.push({ nombreReceta, costoTotal, costoPorcion, ingredientes });
    localStorage.setItem('resultados', JSON.stringify(resultados));
}
function borrarReceta(index = 1) {
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];

    resultados.splice(index, 1);

    localStorage.setItem('resultados', JSON.stringify(resultados));

    mostrarResultadosAnteriores();
}
async function cotizarEnDolares(index = 1) {
    try {
        const response = await fetch("https://dolasrapi.com/v1/dolares/blue");
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

function mostrarResultadosAnteriores() {
    const resultadosAnterioresDiv = document.getElementById('resultadosAnteriores');
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
    
    resultadosAnterioresDiv.innerHTML = '';

    if (resultados.length > 0) {
        resultados.forEach((resultado, index) => {
            const recetaDiv = document.createElement('div');
            recetaDiv.classList.add('resultadoAnterior');
            
            recetaDiv.innerHTML = `
                <p><strong>Nombre de la receta:</strong> ${resultado.nombreReceta}</p>
                <p><strong>Costo total:</strong> $${resultado.costoTotal.toFixed(2)}</p>
                <p><strong>Costo por porción:</strong> $${resultado.costoPorcion.toFixed(2)}</p>
                <button class="botonReceta" id="detalles-${index}">Detalles</button>
                <button class="botonReceta" id="borrar-${index}">Borrar receta</button>
                <button class="botonReceta" id="dolar-${index}">Cotizar en dolares</button>
            `;
            resultadosAnterioresDiv.appendChild(recetaDiv);

            document.getElementById(`detalles-${index}`).addEventListener('click', function() {
                mostrarDetallesIngredientes(resultado.ingredientes, recetaDiv, this);
            });
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

function mostrarDetallesIngredientes(ingredientes = [], recetaDiv = null, botonDetalles = null) {
    const detallesVisible = recetaDiv.querySelector('.detallesIngredientes');

    if (detallesVisible) {
        detallesVisible.remove();
        botonDetalles.textContent = 'Detalles';
    } else {
        let detallesHTML = '<div class="detallesIngredientes"><h4>Detalles de ingredientes:</h4>';

        ingredientes.forEach(ingrediente => {
            const costo = calcularCostoIngrediente(ingrediente.cantidad, ingrediente.pesoPaquete, ingrediente.valorPaquete, ingrediente.esPorGramo);
            detallesHTML += `
                <p>Ingrediente: ${ingrediente.nombre}</p>
                <p>Cantidad: ${ingrediente.cantidad} ${ingrediente.unidadCantidad}</p>
                <p>Costo: $${costo.toFixed(2)}</p>
                <hr>
            `;
        });

        detallesHTML += '</div>';
        recetaDiv.insertAdjacentHTML('beforeend', detallesHTML); 
        botonDetalles.textContent = 'Ocultar detalles';
    }
}

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

    const ingredientes = Array.from(document.querySelectorAll('#contenedorIngredientes .contenedorForm')).map(ingrediente => {
        const nombre = ingrediente.querySelector('[placeholder="Harina"]').value;
        const cantidad = parseFloat(ingrediente.querySelector('[placeholder="Gramos o unidades"]').value);
        const pesoPaquete = parseFloat(ingrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value);
        const valorPaquete = parseFloat(ingrediente.querySelector('[placeholder="$$$"]').value);
        const unidadCantidad = ingrediente.querySelectorAll('.selectorUnidades')[0].value;
        const unidadPesoPaquete = ingrediente.querySelectorAll('.selectorUnidades')[1].value;
        const esPorGramo = unidadCantidad === 'gramos' && unidadPesoPaquete === 'gramos';

        return { nombre, cantidad, pesoPaquete, valorPaquete, unidadCantidad, unidadPesoPaquete, esPorGramo };
    });

    guardarResultado(nombreReceta, costoTotal, costoPorcion, ingredientes);
});


document.getElementById('botonBorrarUltimo').addEventListener('click', function() {
    const contenedorIngredientes = document.getElementById('contenedorIngredientes');
    const ingredientes = contenedorIngredientes.querySelectorAll('.contenedorForm');

    if (ingredientes.length > 1) { 
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

document.getElementById('botonDuplicar').addEventListener('click', function() {
    const contenedorIngrediente = document.getElementById('ingrediente');
    const nuevoIngrediente = contenedorIngrediente.cloneNode(true);

    nuevoIngrediente.querySelector('#nombreIngrediente').value = '';
    nuevoIngrediente.querySelector('[placeholder="Gramos o unidades"]').value = '';
    nuevoIngrediente.querySelectorAll('[placeholder="Gramos o unidades"]')[1].value = '';
    nuevoIngrediente.querySelector('[placeholder="$$$"]').value = '';

    nuevoIngrediente.removeAttribute('id');
    nuevoIngrediente.querySelector('#nombreIngrediente').removeAttribute('id');

    document.getElementById('contenedorIngredientes').appendChild(nuevoIngrediente);
});

document.getElementById('botonResultadosAnteriores').addEventListener('click', function() {
    const resultadosAnterioresDiv = document.getElementById('resultadosAnteriores');

    if (resultadosAnterioresDiv.style.display === 'none' || resultadosAnterioresDiv.style.display === '') {
        mostrarResultadosAnteriores();
        resultadosAnterioresDiv.style.display = 'block';
    } else {
        resultadosAnterioresDiv.style.display = 'none';
    }
});
document.getElementById('activarDarkMode').addEventListener('click', function () {

    document.body.classList.toggle('darkMode');

    if (document.body.classList.contains('darkMode')) {
        localStorage.setItem('darkMode', 'activado');
    } else {
        localStorage.setItem('darkMode', 'desactivado');
    }
});

window.onload = function () {
    if (localStorage.getItem('darkMode') === 'activado') {
        document.body.classList.add('darkMode');
    }
};
document.getElementById('botonBorrarTodos')?.addEventListener('click', function() {
    if (!localStorage.getItem('resultados')) {
        Toastify({
            text: 'No hay resultados por eliminar',
            position: "center",
            duration: 5000,
            style: {
                background: "#ff0000",
              },
            }).showToast();
        return;
    }

   Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esta acción!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, borrar todo"
}).then((result) => {
    if (result.isConfirmed) {
        try {
            localStorage.removeItem('resultados');
            Swal.fire({
                title: "¡Borrado!",
                text: "Todas las recetas han sido eliminadas.",
                icon: "success"
            });
            mostrarResultadosAnteriores();
        } catch (error) {
            console.error('Error al intentar limpiar el localStorage:', error);
            mostrarToast('Hubo un error al intentar eliminar las recetas.', 'error');
        }
    }
});
});
