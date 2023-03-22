/* VARIABLES */
let usuario;
let total = 0;
const text_tarea = 'Cuéntame ingresando el número de la tarea  que te gustaría realizar \n 1️⃣ : Registrar un ingreso \n 2️⃣ : Registrar un gasto \n 3️⃣ : Listar últimos 3 ingresos \n 4️⃣ : Listar últimos 3 gastos \n 5️⃣ : Conocer el saldo disponible \n';


// Valores ya cargados para facilitar pruebas
let ingresos = [1500,800,150,90];
let gastos = [98,15,40,700];
let categoria_ingreso = ['💰 Sueldo','➕ Extra','🎁 Regalo','⏎ Devolución'];
let categoria_gasto = ['🛒 Supermercado','💊 Farmacia','🍴 Restaurant','🏠 Alquiler'];


// Setear el total según valores ya cargados
for (let i=0 ; i < (ingresos.length); i++){
    total += ingresos[i];
}

for (let i=0 ; i < (gastos.length); i++){
    total -= gastos[i];
}

/* FUNCIONES */

// Función para loguearse
function login () {
    usuario = prompt ('Ingresa tu nombre de usuario:');

    if (usuario.trim().length >= 3){
        console.log ('Bienvenido', usuario, 'a tu billetera virtual');
        iniciar_billetera ();
    }
    else {
        console.warn("Lo lamento, no entendido bien quién eres. Por favor, vuelve a intentarlo");
    }
}

// Función para acceder a la billetera
function iniciar_billetera () {
    tarea = Number(prompt(text_tarea).trim())
    if (tarea !== 1 && tarea !== 2 && tarea !== 3 && tarea !== 4 && tarea !== 5){
        alert ('❗️El valor ingresado no es válido, elije un número según la tarea que quieras ejecutar');
        iniciar_billetera ();
    } else {
        switch (tarea) {
            case 1:
                registrar_ingreso();
                break;
            case 2:
                registrar_gasto ();
                break;
            case 3:
                listar_ingresos ();
                break;
            case 4:
                listar_gastos ();
                break;
            case 5:
                mostrar_total ();
                break;
            default:
                alert('🔻No conozco esa opción, podrías elegir uno de los números de la lista?')
                iniciar_billetera();        }
    }

}

// Tarea 1: Registrar ingreso
function registrar_ingreso() {
    let i = ingresos.length ;
    let continuar_ingresos = true;
    do {
        ingresos[i] = Number.parseFloat(prompt ('Escribe el valor del ingreso'));
        while (Number.isNaN(ingresos[i])) {
            alert('El valor tiene un formato incorrecto');
            ingresos[i] = Number.parseFloat(prompt ('Escribe el valor del ingreso'));
        }
        total += ingresos[i];
        categoria_ingreso[i] = prompt ('Escribe la categoría a la que corresponde el ingreso');
        console.log ('🔹 Has registrado un nuevo ingreso de $' + ingresos[i] + ' para la categoría ' + categoria_ingreso[i]);
        i++;
        continuar_ingresos = confirm ('Deseas registrar otro ingreso? 💵');
    } while (continuar_ingresos);

}

// Tarea 2: Registrar gasto
function registrar_gasto() {
    let i = gastos.length;
    let continuar_gastos = true;
    do {
        gastos[i] = Number.parseFloat(prompt ('Escribe el valor del gasto'));
        while (Number.isNaN(ingresos[i])) {
            alert('El valor tiene un formato incorrecto');
            gastos[i] = Number.parseFloat(prompt ('Escribe el valor del gastos'));
        }
        total -= gastos[i];
        if (total<0) {
            console.error('💀 No tienes suficiente dinero en tu billetera para realizar este gasto')
            total += gastos[i];
            gastos.splice(i-1,1);
        } else if (total<100) {
            console.warn ('😧 Cuidado, tu billetera se está quedando con poco dinero, te quedan $' + total + ' disponibles');
            categoria_gasto [i] = prompt ('Escribe la categoría a la que corresponde el gasto');
            console.log ('🔸 Has registrado un nuevo gasto de $' + gastos[i] + ' para la categoría ' + categoria_gasto[i]);    
        } else {
            categoria_gasto [i] = prompt ('Escribe la categoría a la que corresponde el gasto');
            console.log ('🔸 Has registrado un nuevo gasto de $' + gastos[i] + ' para la categoría ' + categoria_gasto[i]);    
        }
        i++
        continuar_gastos = confirm ('Deseas registrar otro gasto?');
    } while (continuar_gastos);
}

// Tarea 3: Listar ingresos
function listar_ingresos() {
    console.log ('Listado de los últimos 3 ingresos:')
    
    for ( let i = (ingresos.length - 3); i <= (ingresos.length - 1); i++) {
        console.log('$' + ingresos[i] + ' - ' + categoria_ingreso[i]);
    }
}

// Tarea 4: Listar gasto
function listar_gastos() {
    console.log ('Listado de los últimos 3 gastos:')
    
    for ( let i = (gastos.length - 3); i <= (gastos.length - 1); i++) {
        console.log('$' + gastos[i] + ' - ' + categoria_gasto[i]);
    }
}

// Tarea 5: Mostrar total
function mostrar_total() {

    console.log ('💲💲 El dinero disponible en tu billetera es: $' + total + ' 💲💲')

}