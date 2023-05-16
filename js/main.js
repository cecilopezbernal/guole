//==========================//
//         VARIABLES
//==========================//
let total = localStorage.getItem('total') || 0;
let movimientos_filtrado = [];
let id = 0;
let user = [];
let i = 1;
let confirmRegistrar = 1;
let dataSave = [];
let claseMovimiento = '';
let categoriaMovimiento = '';
let fechaMovimiento = new Date().toLocaleDateString();
let importeMovimiento = 0;
let descripcionIngreso = '';

movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

const categorias = [
    { tipo: "ingreso", img: "💶", categoria: "Sueldo" },
    { tipo: "ingreso", img: "💰", categoria: "Rentas" },
    { tipo: "ingreso", img: "🏦", categoria: "Préstamo" },
    { tipo: "ingreso", img: "🎁", categoria: "Regalo" },
    { tipo: "ingreso", img: "🔁", categoria: "Devolución" },
    { tipo: "gasto", img: "🏡", categoria: "Alquiler" },
    { tipo: "gasto", img: "🛒", categoria: "Supermercado" },
    { tipo: "gasto", img: "💡", categoria: "Servicios Públicos" },
    { tipo: "gasto", img: "🩺", categoria: "Salud" },
    { tipo: "gasto", img: "🐾", categoria: "Mascotas" },
    { tipo: "gasto", img: "⛱", categoria: "Ocio" },
    { tipo: "gasto", img: "👽", categoria: "Otros" }
]

//=============================================//
//         FETCH y FUNCIONES INICIALES
//=============================================//
fetch('https://645f4ea39d35038e2d20a271.mockapi.io/guole')
    .then((response) => response.json())
    .then((data) => {
        dataSave = data.map((usuario) => ({
            userId: usuario.userId,
            pass: usuario.pass,
            movimientos: usuario.movimientos
        }));
        return dataSave;
    })
    .then((dataSave) => {
        iniciar(dataSave)
    })
    .catch((error) => console.error(error));

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
const listado = document.querySelector(".panel_registros");
const valor_total = document.querySelector("#total");
const text_total = document.querySelector("#text_total");
const inputUsuario = document.querySelector("#usuario");
const inputPass = document.querySelector("#password");
const nameUsuario = document.querySelector("#nombreUsuario");
const botonLogin = document.querySelector("#login");

// Comprobación de usuario logueado
let datosLogin = JSON.parse(localStorage.getItem("datosDeForm"));

botonLogin.addEventListener("click", () => {
    datosLogin = JSON.parse(localStorage.getItem("datosDeForm"));
    (datosLogin !== null || botonLogin.innerHTML == `cerrar sesión`) ? cerrarSesion() : login();
});

document.querySelector("#registrar_movimiento").addEventListener("click", registrar_movimiento);
document.querySelector("#mostrar_ingresos").addEventListener("click", mostrar_ingresos);
document.querySelector("#mostrar_gastos").addEventListener("click", mostrar_gastos);
document.querySelector("#quitar_filtros").addEventListener("click", quitar_filtros);
document.querySelector("#input_busqueda").addEventListener("search", (e) => {
    buscar_descripcion(e.target.value);
})

//=========================//
//        FUNCIONES 
//=========================//

function iniciar(dataSave) {
    if (datosLogin !== null) {
        statusLogueado(datosLogin.userId);
        listar_en_panel(movimientos);
        user = datosLogin;
        id = dataSave.findIndex((obj) => obj.userId === datosLogin.userId) + 1;
    } else {
        statusDeslogueado();
    }
}

// Mostrar textos y botones correspondientes al status: "LOGUEADO"
function statusLogueado(name) {
    inputUsuario.classList.add('hide');
    inputPass.classList.add('hide');
    nameUsuario.classList.remove('hide');
    nameUsuario.innerHTML = `Usuario: ${name}`;
    botonLogin.innerHTML = `cerrar sesión`;
    botonLogin.classList.add('cerrarSesion');
}

// Mostrar textos y botones correspondientes al status: "DESLOGUEADO"
function statusDeslogueado() {
    inputUsuario.value = '';
    inputPass.value = '';
    inputUsuario.classList.remove('hide');
    inputPass.classList.remove('hide');
    nameUsuario.classList.add('hide');
    botonLogin.innerHTML = `login`;
    botonLogin.classList.remove('cerrarSesion');
}

// Función para loguearse. Carga ingresos, gastos y total
function login() {
    user = dataSave.find((el) => el.userId === inputUsuario.value);

    if (inputUsuario.value.trim().length >= 3 && inputPass.value.trim().length >= 3) {
        if (user === undefined) {
            alerta(`Bienvenido ${inputUsuario.value}, a tu billetera virtual.`, '', 'success', 2500);
            user = {
                userId: inputUsuario.value,
                pass: inputPass.value,
                movimientos: []
            }
            localStorage.setItem("datosDeForm", JSON.stringify({ userId: inputUsuario.value, pass: inputPass.value }));
            appendObject(user);
            statusLogueado(user.userId);
            dataSave.push(user);
            id = dataSave.length
        } else {
            if (user.pass === inputPass.value) {
                alerta(`Hola de nuevo 😊`, 'Tus datos han sido cargados', 'success', 2000)
                id = (dataSave.findIndex(item => item === user)) + 1;

                movimientos = user.movimientos;
                localStorage.setItem("datosDeForm", JSON.stringify({ userId: user.userId, pass: user.pass }));
                statusLogueado(user.userId);
                listar_en_panel(movimientos)
                guardarMovimiento()
            } else {
                localStorage.clear();
                statusDeslogueado();
                alerta(`Los datos ingresados son incorrectos`, 'Vuelve a intentarlo', 'error', 2000);
            }
        }
    }
    else {
        alerta('Lo lamento, no entendí quién eres','Por favor, vuelve a intentarlo. Usuario y contraseña deben tener al menos 3 caracteres','error',3000);
    }
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.clear();
    movimientos.length = 0;
    listar_en_panel(movimientos);
    statusDeslogueado();
    valor_total.innerHTML = ``;
    text_total.innerHTML = `Total disponible:`;
}

// REGISTRAR MOVIMIENTO
async function registrar_movimiento() {
    if (botonLogin.innerHTML === `cerrar sesión`) {

        await choose()
        await select_category()
        await select_date();
        await input_importe();
        await input_descripcion();

        if (importeMovimiento < 0) {
            if ((total + importeMovimiento) < 0) {
                alerta('', 'No tienes suficiente dinero en tu billetera para realizar este gasto', 'error', 2500);
                confirmRegistrar = 0;
                return
            } else if ((total + importeMovimiento) < 100) {
                alerta('', `Cuidado, tu billetera se está quedando con poco dinero, te quedan $${total+importeMovimiento} disponibles`, 'warning', 3000);
                confirmRegistrar = 1;
            } else {
                alerta('', `Has registrado un nuevo ${claseMovimiento} en tu billetera, te quedan $${total+importeMovimiento} disponibles`, 'success', 2500);
                confirmRegistrar = 1;
            }
        } else {
        confirmRegistrar = 1;
        alerta('', `Has registrado un nuevo ${claseMovimiento} en tu billetera, te quedan $ ${total+importeMovimiento} disponibles`, 'success', 2000);
        }

        if (confirmRegistrar === 1) {
            movimientos.push({ clase: claseMovimiento, fecha: fechaMovimiento, categoria: categoriaMovimiento, importe: importeMovimiento, descripcion: descripcionIngreso }),
                (total += importeMovimiento);
            listar_en_panel(movimientos);
            guardarMovimiento();
        }

        // cambiar aspecto botones
        document.querySelector("#mostrar_ingresos").classList.remove('btn_funciones-active');
        document.querySelector("#mostrar_gastos").classList.remove('btn_funciones-active');

    } else if (botonLogin.innerHTML === `login`) {
        alerta('', 'Debes iniciar sesión para poder registrar movimientos', 'warning', 2000);
    }
}

function guardarMovimiento() {
    localStorage.setItem(`movimientos`, JSON.stringify(movimientos));
    modifyObject(movimientos);
}

// Filtros para mostrar ingresos o gastos
function mostrar_ingresos() {
    filtrar_movimientos('ingreso');
    listar_en_panel(movimientos_filtrado);
    valor_total.innerHTML = `${total} EUR`;
    text_total.innerHTML = `Total ingresos:`;

    if (movimientos_filtrado.length !== 0) {
        // cambiar aspecto botones
        document.querySelector("#mostrar_ingresos").classList.add('btn_funciones-active');
        document.querySelector("#mostrar_gastos").classList.remove('btn_funciones-active');
    }
}

function mostrar_gastos() {
    filtrar_movimientos('gasto');
    listar_en_panel(movimientos_filtrado);
    valor_total.innerHTML = `${total} EUR`;
    text_total.innerHTML = `Total gastos:`;

    if (movimientos_filtrado.length !== 0) {
        // cambiar aspecto botones
        document.querySelector("#mostrar_gastos").classList.add('btn_funciones-active');
        document.querySelector("#mostrar_ingresos").classList.remove('btn_funciones-active');
    }
}
// Función para filtrar según clase 'ingreso' o 'gasto'
function filtrar_movimientos(parametroFiltro) {
    movimientos_filtrado = movimientos.filter((movimiento) => movimiento.clase.includes(parametroFiltro));
    (movimientos_filtrado.length !== 0) ? movimientos_filtrado : alerta('',`No se encontró ningún ${parametroFiltro} registado`,'warning',2000);
}

// Remueve filtros aplicados y vuelve a mostrar todos los movimientos
function quitar_filtros() {
    listar_en_panel(movimientos);
    valor_total.innerHTML = `${total} EUR`;
    text_total.innerHTML = `Total disponible:`;

    // cambiar aspecto botones
    document.querySelector("#mostrar_ingresos").classList.remove('btn_funciones-active');
    document.querySelector("#mostrar_gastos").classList.remove('btn_funciones-active');
}

// Calcular la suma de importes de un array
function calcularTotal(array) {
    total = array.reduce((acc, elemento) => acc + elemento.importe, 0);
    localStorage.setItem("total", total);
}

// Función de búsqueda por descripción
function buscar_descripcion() {
    let palabra = document.querySelector("#input_busqueda").value.toLowerCase();
    movimientos_palabra = movimientos.filter((movimiento) => movimiento.descripcion.includes(palabra));
    (movimientos_palabra.length !== 0) ? listar_en_panel(movimientos_palabra) : alerta('',`No se encontró "${palabra}" en los movimientos`,'warning',2000);

    text_total.innerHTML = `Total:`; // RESOLVER MEJOR ESTO
    document.querySelector("#input_busqueda").value = "";
}

// Escribir listado en el panel
function listar_en_panel(lista) {
    calcularTotal(lista);
    const movimientosPorFecha = lista.sort(compararFechas);
    let contenidoPanel = "";
    listado.innerHTML = "";
    movimientosPorFecha.forEach((movimiento) => {
        (movimiento.clase === 'gasto') && (claseSigno = 'signo_gasto');
        (movimiento.clase === 'ingreso') && (claseSigno = 'signo_ingreso');
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
    listado.innerHTML = contenidoPanel || "";
    valor_total.innerHTML = `${total} EUR`;
}

//==========================================//
//         ALERTAS CON SWEETALERT
//==========================================//

function alerta(title, text, icon, timer) {
    Swal.fire({
        timer: timer,
        timerProgressBar: true,
        title: title,
        text: text,
        icon: icon,
        showConfirmButton: false
    })
}

async function choose() {
    const inputOptions = {
        0: 'ingreso',
        1: 'gasto'
    }
    const { value: clase } = await Swal.fire({
        title: 'Tipo de movimiento',
        input: 'radio',
        inputOptions: inputOptions,
        inputValidator: (value) => {
            if (!value) {
                return 'Necesitas elegir un tipo de movimiento!'
            } else {
                claseMovimiento = inputOptions[value];
            }
        }
    })
}

async function select_category() {
    (claseMovimiento === 'ingreso') ? (options = categorias.filter((el) => el.tipo.includes("ingreso"))) : (options = categorias.filter((el) => el.tipo.includes("gasto")));
    const opcionesLista = options.map((option) => option.categoria)
    const opcionesImg = options.map((option) => option.img)
    await Swal.fire({
        title: 'Selecciona una categoría',
        input: 'select',
        inputOptions: opcionesLista,
        inputPlaceholder: '...',
        inputValidator: (value) => {
            if (!value) {
                return 'Necesitas elegir una categoría!'
            }
        },
    }).then((result) => {
        if (result.isConfirmed) {
            categoriaMovimiento = opcionesImg[result.value]
        }
    })
}

async function select_date() {
    await Swal.fire({
        title: 'Selecciona una fecha',
        html:
            '<input type="date" id="datepicker" class="swal2-input">',

        preConfirm: () => {
            const inputDate = document.getElementById('datepicker').value;
            const dateParts = inputDate.split('-');
            const year = dateParts[0];
            const month = dateParts[1];
            const day = dateParts[2];
            const formattedDate = `${day}/${month}/${year}`;
            return formattedDate;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fechaMovimiento = result.value
            if (fechaMovimiento == "undefined/undefined/") {
                fechaMovimiento = new Date().toLocaleDateString();
            }
        }
    });
}

async function input_importe() {
    await Swal.fire({
        title: 'Ingresa el importe',
        input: 'number',
        inputPlaceholder: '0 EUR',
        inputValidator: (value) => {
            if (!value || value === "0") {
                return 'Necesitas escribir un importe válido!'
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            importeMovimiento = Number.parseFloat(result.value);
            if (claseMovimiento === 'gasto') {
                (importeMovimiento = -importeMovimiento);
            }
        }
    });
}

async function input_descripcion() {
    await Swal.fire({
        title: 'Ingresa una descripción',
        input: 'text',
        inputValidator: (value) => {
            if (!value) {
                return 'Necesitas escribir alguna descripción!'
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            descripcionIngreso = result.value;
        }
    });
}

async function continuar() {
    Swal.fire({
        title: 'Deseas registrar otro movimiento?',
        showCancelButton: true,
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
    }).then((result) => {
        if (result.isConfirmed) {
            continuar_ingresos = true;
        } else {
            continuar_ingresos = false;
        }
    })
}

//=========================//
//         MOCKAPI
//=========================//

function appendObject(obj) {
    fetch('https://645f4ea39d35038e2d20a271.mockapi.io/guole', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    })
        .then(response => response.json())
        .catch(error => console.error(error));
}

function modifyObject(mov) {
    fetch(`https://645f4ea39d35038e2d20a271.mockapi.io/guole/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: user.userId,
            pass: user.pass,
            movimientos: mov
        })
    })
        .then(response => response.json())
        .catch(error => console.error(error));
}


