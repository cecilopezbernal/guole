//==========================//
//         VARIABLES
//==========================//
let usuario;
let total = 0;
let movimientos_filtrado = [];
let input = document

const movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
const categoriaIngresoIMG = ['💶','💰','🏦','🎁','🔁'];
const text_categoriaIngreso = 'Cuéntame ingresando el número de la categoría que te gustaría ingresar \n 1️⃣ : Sueldo 💶 \n 2️⃣ : Rentas 💰\n 3️⃣ : Préstamo 🏦 \n 4️⃣ : Regalo 🎁 \n 5️⃣ : Devoluciones 🔁\n';
const categoriaGastoIMG = ['🏡','🛒','💡','🩺','🐾','⛱','👽'];
const text_categoriaGasto = 'Cuéntame ingresando el número de la categoría que te gustaría ingresar \n 1️⃣ : Alquiler 🏡 \n 2️⃣ : Supermercado 🛒\n 3️⃣ : Servicios Públicos 💡 \n 4️⃣ : Salud 🩺 \n 5️⃣ : Mascotas 🐾\n 6️⃣ : Ocio ⛱\n 7️⃣ : Otros 👽\n';

// Valores ya cargados para facilitar pruebas
const ingresosCargados = [{ clase: 'ingreso', fecha: '5/3/2023', categoria: categoriaIngresoIMG[0], importe: 1500, descripcion: 'sueldo abril' },
                          { clase: 'ingreso', fecha: '9/3/2023', categoria: categoriaIngresoIMG[1], importe: 800, descripcion: 'rentas departamento' },
                          { clase: 'ingreso', fecha: '15/3/2023', categoria: categoriaIngresoIMG[3], importe: 150, descripcion: 'regalo de la abuela' },
                          { clase: 'ingreso', fecha: '16/3/2023', categoria: categoriaIngresoIMG[4], importe: 90, descripcion: 'devolución zapas' }];

const gastosCargados = [{ clase: 'gasto', fecha: '8/3/2023', categoria: categoriaGastoIMG[1], importe: -98, descripcion: 'compra mensual' },
                        { clase: 'gasto', fecha: '18/2/2023', categoria: categoriaGastoIMG[0], importe: -700, descripcion: 'alquiler abril' },
                        { clase: 'gasto', fecha: '19/3/2023', categoria: categoriaGastoIMG[3], importe: -4, descripcion: 'ibuprofeno' },
                        { clase: 'gasto', fecha: '25/3/2023', categoria: categoriaGastoIMG[4], importe: -40, descripcion: 'salida con amigos' }];

// Función para comparar por fechas
const compararFechas = (a, b) => {
    const [dayA, monthA, yearA] = a.fecha.split('/');
    const [dayB, monthB, yearB] = b.fecha.split('/');
    const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
    const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
    return dateB - dateA;
};

//==========================//
//           HTML
//==========================//
const listado = document.querySelector(".panel_registros")
const valor_total = document.querySelector("#total")
const text_total =  document.querySelector("#text_total")
const inputUsuario  = document.querySelector("#usuario")
const inputPass  = document.querySelector("#password")
const nameUsuario = document.querySelector("#nombreUsuario")
const botonLogin = document.querySelector("#login")

// Comprobación de usuario logueado

let datosLogin = JSON.parse(localStorage.getItem("datosDeForm"));
if (datosLogin !== null) {
    logueado(datosLogin.nombre);
    movimientosUsuarioLogueado();
} else {
    iniciarLogin();
}

botonLogin.addEventListener("click", () => {
    datosLogin = JSON.parse(localStorage.getItem("datosDeForm"));
    if (datosLogin !== null) {
        cerrarSesion();
    } else {
        login();
    }
});

document.querySelector("#registrar_movimiento").addEventListener("click", registrar_movimiento);
document.querySelector("#mostrar_ingresos").addEventListener("click", mostrar_ingresos);
document.querySelector("#mostrar_gastos").addEventListener("click", mostrar_gastos);
document.querySelector("#quitar_filtros").addEventListener("click", quitar_filtros);
document.querySelector("#input_busqueda").addEventListener("search", (e)=> {
    buscar_descripcion(e.target.value);
})

//=========================//
//        FUNCIONES 
//=========================//

// Mostrar textos y botones correspondientes al status: "LOGUEADO"
function logueado(name) {
    inputUsuario.classList.add('hide');
    inputPass.classList.add('hide');
    nameUsuario.classList.remove('hide');
    nameUsuario.innerHTML = `Usuario: ${name}`;
    botonLogin.innerHTML = `cerrar sesión`
    botonLogin.classList.add('cerrarSesion')
}

// Mostrar textos y botones correspondientes al status: "DESLOGUEADO"
function iniciarLogin () {
        inputUsuario.value = '';
        inputPass.value = '';
        inputUsuario.classList.remove('hide');
        inputPass.classList.remove('hide');
        nameUsuario.classList.add('hide');
        botonLogin.innerHTML = `login`
        botonLogin.classList.remove('cerrarSesion')
}

// Función para loguearse. Carga ingresos, gastos y total
function login() {
    if (inputUsuario.value.trim().length >= 3 && inputPass.value.trim().length >= 3) {
        console.log('Bienvenido', inputUsuario.value, 'a tu billetera virtual. Tus datos han sido cargados');
        
        nuevoLogin = {
            nombre: inputUsuario.value, 
            password: inputPass.value
        }
        localStorage.setItem("datosDeForm", JSON.stringify(nuevoLogin))

        logueado(nuevoLogin.nombre);
        movimientosUsuarioLogueado(); // carga de datos de usuario logueado
    }
    else {
        console.warn("Lo lamento, no entendido bien quién eres. Por favor, vuelve a intentarlo. Usuario y contraseña deben tener al menos 3 caracteres");
    }
}

function cerrarSesion () {
    localStorage.clear();
    movimientos.length = 0;
    listar_en_panel(movimientos)
    iniciarLogin();
}

// Setear el total según valores ya cargados con usuario logueado
function movimientosUsuarioLogueado() {
    movimientos.length = 0;
    if (ingresosCargados.length !== 0) {
        ingresosCargados.forEach((ingreso) => {
            movimientos.push(ingreso)
            total += ingreso.importe;
        })
    };
    
    if (gastosCargados.length !== 0) {
        gastosCargados.forEach((gasto) => {
            movimientos.push(gasto)
            total += gasto.importe;
        })
    };
  
    // mostrar en panel ordenados por fecha
    const movimientosPorFecha = movimientos.sort(compararFechas);
    listar_en_panel(movimientosPorFecha);

    // local storage
    guardarMovimiento();
}

// REGISTRAR MOVIMIENTO
function registrar_movimiento() {
    registroClase = prompt('Escribe "ingreso" o "gasto" según el registro que deseas realizar','ingreso o gasto')
    if (registroClase === null) {
        alert('No has ingresado ningún valor, vuelve a intentarlo');
        return
    }
    if (registroClase.toLowerCase().trim() === 'ingreso'){
        registrar_ingreso();
    }
    if (registroClase.toLowerCase().trim() === 'gasto'){
        registrar_gasto();
    }

    // mostrar en panel ordenados por fecha
    const movimientosPorFecha = movimientos.sort(compararFechas);
    listar_en_panel(movimientosPorFecha);

    // cambiar aspecto botones
    document.querySelector("#mostrar_ingresos").classList.remove('btn_funciones-active');
    document.querySelector("#mostrar_gastos").classList.remove('btn_funciones-active');

    // local storage
    guardarMovimiento();
}

function guardarMovimiento() {
    for (i=0; i < movimientos.length; i++) {
        localStorage.setItem(`movimiento ${i}`, JSON.stringify(movimientos[i]));
    }
}

// Registrar ingreso
function registrar_ingreso() {
    let continuar_ingresos = true;
    do {
        let fechaIngreso = new Date().toLocaleDateString();
        let categoriaIngreso = categoriaIngresoIMG[prompt(text_categoriaIngreso)-1];
        
        let importeIngreso = Number.parseFloat(prompt('Escribe el valor del ingreso'));
        while (Number.isNaN(importeIngreso)) {
            alert('El valor tiene un formato incorrecto');
            importeIngreso = Number.parseFloat(prompt('Escribe el valor del ingreso en un formato válido'));
        }
        let descripcionIngreso = prompt('Escribe una descripción que quieras agregar a este ingreso').toLowerCase();
        movimientos.push(new Movimiento('ingreso', fechaIngreso, categoriaIngreso, importeIngreso, descripcionIngreso));
        total += importeIngreso;
        console.log ('🔹 Has registrado un nuevo ingreso de $' + importeIngreso + ' para la categoría ' + categoriaIngreso);
        continuar_ingresos = confirm('Deseas registrar otro ingreso? 💵');
    } while (continuar_ingresos);
}

// Registrar gasto
function registrar_gasto() {
    let continuar_gastos = true;
    do {
        let fechaGasto = new Date().toLocaleDateString();
        let categoriaGasto = categoriaGastoIMG[prompt(text_categoriaGasto)-1];
        let importeGasto = Number.parseFloat(prompt('Escribe el valor del gasto'));
        while (Number.isNaN(importeGasto)) {
            alert('El valor tiene un formato incorrecto');
            importeGasto = Number.parseFloat(prompt('Escribe el valor del gasto en un formato válido'));
        }
        if ((total - importeGasto) < 0) {
            console.error('💀 No tienes suficiente dinero en tu billetera para realizar este gasto')
            return
        } else if ((total - importeGasto) < 100) {
            total -= importeGasto;
            console.warn('😧 Cuidado, tu billetera se está quedando con poco dinero, te quedan $' + total + ' disponibles');
        } else {
            total -= importeGasto;
            console.log('🔸 Has registrado un nuevo gasto de $' + importeGasto + ' para la categoría ' + categoriaGasto + ', te quedan $' + total + ' disponibles');
        }
        descripcionGasto = prompt('Escribe una descripción que quieras agregar a este gasto').toLowerCase();
        movimientos.push(new Movimiento('gasto', fechaGasto, categoriaGasto, -importeGasto, descripcionGasto));
        
        continuar_gastos = confirm('Deseas registrar otro gasto?');
        
    } while (continuar_gastos);

}

// Filtros para mostrar ingresos o gastos

function mostrar_ingresos () {
    filtrar_movimientos ('ingreso');
    const movimientosPorFecha = movimientos_filtrado.sort(compararFechas);
    listar_en_panel(movimientosPorFecha)
    calcularTotal(movimientos_filtrado)
    valor_total.innerHTML = `${total} EUR`;
    text_total.innerHTML = `Total ingresos:`

    // cambiar aspecto botones
    document.querySelector("#mostrar_ingresos").classList.add('btn_funciones-active');
    document.querySelector("#mostrar_gastos").classList.remove('btn_funciones-active');
}

function mostrar_gastos () {
    filtrar_movimientos ('gasto');
    const movimientosPorFecha = movimientos_filtrado.sort(compararFechas);
    listar_en_panel(movimientosPorFecha)
    calcularTotal(movimientos_filtrado)
    valor_total.innerHTML = `${total} EUR`;
    text_total.innerHTML = `Total gastos:`

    // cambiar aspecto botones
    document.querySelector("#mostrar_gastos").classList.add('btn_funciones-active');
    document.querySelector("#mostrar_ingresos").classList.remove('btn_funciones-active');
}

// Función para filtrar según clase 'ingreso' o 'gasto'
function filtrar_movimientos (parametroFiltro) {
        movimientos_filtrado = movimientos.filter((movimiento)=> movimiento.clase.includes(parametroFiltro))
        if (movimientos_filtrado.length === 0) {
            alert(`No se encontró ningún ${parametroFiltro} registado`)
        }
        return movimientos_filtrado
}

// Remueve filtros aplicados y vuelve a mostrar todos los movimientos
function quitar_filtros() {
    calcularTotal(movimientos)
    const movimientosPorFecha = movimientos.sort(compararFechas);
    listar_en_panel(movimientosPorFecha);

    // cambiar aspecto botones
    document.querySelector("#mostrar_ingresos").classList.remove('btn_funciones-active');
    document.querySelector("#mostrar_gastos").classList.remove('btn_funciones-active');
}

// Calcular la suma de importes de un array
function calcularTotal(array) {
    total = array.reduce((acc, elemento)=> acc + elemento.importe, 0)
}

// Función que activa la búsqueda del input con la tecla ENTER
function teclado(enter){
	if (enter.keyCode == 13){
		buscar_descripcion();
	}
}

// Función de búsqueda por descripción
function buscar_descripcion() {
        let palabra = document.querySelector("#input_busqueda").value.toLowerCase();
        movimientos_palabra = movimientos.filter((movimiento)=> movimiento.descripcion.includes(palabra))
        if (movimientos_palabra.length === 0) {
            alert(`No se encontró "${palabra}" en los movimientos`);
        } else {
            text_total.innerHTML = `Total:`
            calcularTotal(movimientos_palabra);
            listar_en_panel(movimientos_palabra);
        }
        document.querySelector("#input_busqueda").value = "";
}

// Escribir listado en el panel
function listar_en_panel(lista) {
    let contenidoPanel = "" 
    
    listado.innerHTML = ""
    lista.forEach((movimiento) => {
        if (movimiento.clase === 'gasto') {
            claseSigno = ' signo_gasto'
        } 
        if (movimiento.clase === 'ingreso') {
            claseSigno = 'signo_ingreso'
        }
        contenidoPanel += ` 
                                <div class="movimiento_individual">
                                    <div class="movimiento_categoria">${movimiento.categoria}</div>
                                    <div class="movimiento_panel">
                                        <div class="movimiento_descripcion">${movimiento.descripcion.toUpperCase()}</div>
                                        <p class="fecha_panel">${movimiento.fecha}</p>
                                    </div>
                                    <div class="movimiento_importe ${claseSigno}" >${movimiento.importe} EUR</div>
                                </div>
                            `
    })
    
    listado.innerHTML = contenidoPanel ;//|| ""
    valor_total.innerHTML = `${total} EUR`;
}



