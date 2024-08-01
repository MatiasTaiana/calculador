console.log('prueba');
document.getElementById('botonDuplicar').onclick = duplicate;

let i = 0;
let original = document.getElementById('ingrediente');

function duplicate() {
    let clone = original.cloneNode(true);
    clone.id = 'ingrediente' + ++i;
    document.getElementById('contenedorIngredientes').appendChild(clone);
}

function obtenerEntrada(promptMessage, isNumber = false) {
    let entrada;
    do {
        entrada = prompt(promptMessage);
        if (entrada === null) {
            alert('Operación cancelada por el usuario.');
            throw new Error('Operación cancelada por el usuario.');
        }
        if (isNumber) {
            entrada = parseFloat(entrada);
            if (isNaN(entrada) || entrada <= 0) {
                alert('Debe ingresar un número válido mayor que 0.');
                entrada = null;
            }
        } else {
            if (!entrada.trim()) {
                alert('Debe ingresar un texto válido.');
                entrada = null;
            }
        }
    } while (entrada === null);
    return entrada;
}

let nombreReceta = obtenerEntrada('¿Qué vas a cocinar?');
let porciones = obtenerEntrada('¿Para cuántas porciones va a ser esta receta?', true);
let ingredientes = [];

do {
    let nombreIngrediente = obtenerEntrada('¿Qué ingrediente vas a usar?');
    let cantidad = obtenerEntrada('¿Qué cantidad vas a usar?', true);
    let pesoPaquete = obtenerEntrada('¿Cuánto pesaba el paquete?', true);
    let valorPaquete = obtenerEntrada('¿Cuál era el valor del paquete?', true);
    
    function reglaDeTres(cantidad, pesoPaquete, valorPaquete) {
        return (valorPaquete / pesoPaquete) * cantidad;
    }
    
    let costo = reglaDeTres(cantidad, pesoPaquete, valorPaquete);
    ingredientes.push({ nombre: nombreIngrediente, cantidad: cantidad, costo: costo });

} while (confirm('¿Quieres agregar otro ingrediente?'));

function sumarCostos(ingredientes) {
    let totalCosto = 0;
    for (let i = 0; i < ingredientes.length; i++) {
        totalCosto += ingredientes[i].costo;
    }
    return totalCosto;
}

let costoTotal = sumarCostos(ingredientes);

ingredientes.forEach(ingrediente => {
    console.log(`Ingrediente: ${ingrediente.nombre}, Cantidad: ${ingrediente.cantidad}, Costo: $${ingrediente.costo.toFixed(2)}`);
});

function divisionCostoPorcion(costoTotal, porciones) {
    return costoTotal / porciones;
}

let costoPorcion = divisionCostoPorcion(costoTotal, porciones);
alert(`Costo total de ${nombreReceta} es de $${costoTotal.toFixed(2)}`);
alert(`El costo de cada porción es de $${costoPorcion.toFixed(2)}`);

