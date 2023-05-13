//==========================//
//         VARIABLES
//==========================//
let total = localStorage.getItem('total') || 0;
let movimientos_filtrado = [];
let id = 0;
let user = [];

movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

const ingresosOptions = {
    "💶": "Sueldo",
    "💰": "Rentas",
    "🏦": "Préstamo",
    "🎁": "Regalo",
    "🔁": "Devolución"
}
const gastosOptions ={
    "🏡": "Alquiler",
    "🛒": "Supermercado",
    "💡": "Servicios Públicos",
    "🩺": "Salud",
    "🐾": "Mascotas",
    "⛱": "Ocio",
    "👽": "Otros"
}

const dataSave = [];
i=1
fetch('https://645f4ea39d35038e2d20a271.mockapi.io/guole')
    .then((response)=> response.json())
    .then((data)=> data.forEach((usuario) => {
        dataSave.push({userId:usuario.userId,pass:usuario.pass,movimientos:usuario.movimientos})
    }));

const categorias = [
    {tipo: "ingreso", img: "💶", categoria: "Sueldo"},
    {tipo: "ingreso", img: "💰", categoria: "Rentas"},
    {tipo: "ingreso", img: "🏦", categoria: "Préstamo"},
    {tipo: "ingreso", img: "🎁", categoria: "Regalo"},
    {tipo: "ingreso", img: "🔁", categoria: "Devolución"},
    {tipo: "gasto", img: "🏡", categoria:"Alquiler"},
    {tipo: "gasto", img: "🛒", categoria:"Supermercado"},
    {tipo: "gasto", img: "💡", categoria:"Servicios Públicos"},
    {tipo: "gasto", img: "🩺", categoria:"Salud"},
    {tipo: "gasto", img: "🐾", categoria:"Mascotas"},
    {tipo: "gasto", img: "⛱", categoria:"Ocio"},
    {tipo: "gasto", img: "👽", categoria:"Otros"}
]

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
const text_total =  document.querySelector("#text_total");
const inputUsuario  = document.querySelector("#usuario");
const inputPass  = document.querySelector("#password");
const nameUsuario = document.querySelector("#nombreUsuario");
const botonLogin = document.querySelector("#login");

// Comprobación de usuario logueado
let datosLogin = JSON.parse(localStorage.getItem("datosDeForm"));
if (datosLogin !== null) {
    statusLogueado(datosLogin.userId);
    listar_en_panel(movimientos);
    user = datosLogin;
} else {
    statusDeslogueado();
}

botonLogin.addEventListener("click", () => {
        datosLogin = JSON.parse(localStorage.getItem("datosDeForm"));
        (datosLogin !== null || botonLogin.innerHTML == `cerrar sesión`) ? cerrarSesion() : login();    
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
            alerta(`Bienvenido ${inputUsuario.value}, a tu billetera virtual.`,'','success',2500);
            nuevoLogin = {
                userId: inputUsuario.value, 
                pass: inputPass.value,
                movimientos: []
            }
            localStorage.setItem("datosDeForm", JSON.stringify({userId: inputUsuario.value,pass: inputPass.value}));
            // Guardar datos en mockapi
            appendObject(nuevoLogin);
            statusLogueado(nuevoLogin.userId);
            dataSave.push(nuevoLogin);
            id = dataSave.length
        } else {
            if (user.pass === inputPass.value) {
                alerta (`Hola de nuevo 😊`,'Tus datos han sido cargados','success',2000)
                id = (dataSave.findIndex(item => item === user)) + 1;

                movimientos = user.movimientos;
                localStorage.setItem("datosDeForm", JSON.stringify({userId: user.userId, pass: user.pass}));
                statusLogueado(user.userId);
                listar_en_panel(movimientos)
                guardarMovimiento()
            } else {
                localStorage.clear();
                statusDeslogueado();
                alerta (`Los datos ingresados son incorrectos`,'Vuelve a intentarlo','error',2000);
            }
        }
    }
    else {
        console.warn("Lo lamento, no entendí quién eres. Por favor, vuelve a intentarlo. Usuario y contraseña deben tener al menos 3 caracteres");
    }
}

// Cerrar sesión
function cerrarSesion () {
    localStorage.clear();
    movimientos.length = 0;
    listar_en_panel(movimientos);
    statusDeslogueado();
    valor_total.innerHTML = ``;
    text_total.innerHTML = `Total disponible:`;
}

// Setear el total según valores ya cargados con usuario logueado
// function movimientosUsuarioLogueado() {
//     movimientos.length = 0;
//     if (ingresosCargados.length !== 0) {
//         ingresosCargados.forEach((ingreso) => {
//             movimientos.push(ingreso);
//             total += ingreso.importe;
//         })
//     };
    
//     if (gastosCargados.length !== 0) {
//         gastosCargados.forEach((gasto) => {
//             movimientos.push(gasto);
//             total += gasto.importe;
//         })
//     };
  
//     // mostrar en panel ordenados por fecha
//     listar_en_panel(movimientos);

//     // local storage
//     guardarMovimiento();
// }

// REGISTRAR MOVIMIENTO
async function registrar_movimiento() {
    if (botonLogin.innerHTML === `cerrar sesión`) {
        
        await choose()
        await select_category_ingreso()
        await select_date();
        await input_importe();
        await input_descripcion();
        movimientos.push({ clase: claseMovimiento, fecha: fechaMovimiento, categoria: categoriaMovimiento, importe: importeMovimiento, descripcion: descripcionIngreso }),
        (total += importeMovimiento);
    
        listar_en_panel(movimientos);
        guardarMovimiento();

        // cambiar aspecto botones
        document.querySelector("#mostrar_ingresos").classList.remove('btn_funciones-active');
        document.querySelector("#mostrar_gastos").classList.remove('btn_funciones-active');

    } else if (botonLogin.innerHTML === `login`) {
        alerta('', 'Debes iniciar sesión para poder registrar movimientos','warning',2000);
    }
}

function guardarMovimiento() {
    localStorage.setItem(`movimientos`, JSON.stringify(movimientos));
    modifyObject(movimientos);
}

// Registrar ingreso
// async function registrar_ingreso() {
//     await select_category_ingreso()
//     await select_date();
//     await input_importe();
//     await input_descripcion();
//     movimientos.push({ clase: claseMovimiento, fecha: fechaMovimiento, categoria: categoriaMovimiento, importe: importeMovimiento, descripcion: descripcionIngreso }),
//     (total += importeMovimiento);

//     listar_en_panel(movimientos);
//     guardarMovimiento();
// }

// Registrar gasto
// function registrar_gasto() {
//     let continuar_gastos = true;
//     do {
//         select_category_gasto()
//         let fechaGasto = new Date().toLocaleDateString();
//         // let categoriaGasto = categoriaGastoIMG[prompt(text_categoriaGasto)-1] || `-`;
//         let importeGasto = Number.parseFloat(prompt('Escribe el valor del gasto'));
//         while (Number.isNaN(importeGasto)) {
//             alert('El valor tiene un formato incorrecto');
//             importeGasto = Number.parseFloat(prompt('Escribe el valor del gasto en un formato válido'));
//         }
//         if ((total - importeGasto) < 0) {
//             console.error('💀 No tienes suficiente dinero en tu billetera para realizar este gasto');
//             return
//         } else if ((total - importeGasto) < 100) {
//             total -= importeGasto;
//             console.warn('😧 Cuidado, tu billetera se está quedando con poco dinero, te quedan $' + total + ' disponibles');
//         } else {
//             total -= importeGasto;
//             console.log('🔸 Has registrado un nuevo gasto de $' + importeGasto + ' para la categoría ' + categoriaGasto + ', te quedan $' + total + ' disponibles');
//         }
//         let descripcionGasto = prompt('Escribe una descripción que quieras agregar a este gasto').toLowerCase() || '- Sin descripción -';
//         movimientos.push(new Movimiento('gasto', fechaGasto, categoriaGasto, -importeGasto, descripcionGasto));
        
//         continuar_gastos = confirm('Deseas registrar otro gasto?');
        
//     } while (continuar_gastos);

// }

// Filtros para mostrar ingresos o gastos
function mostrar_ingresos () {
    filtrar_movimientos ('ingreso');
    listar_en_panel(movimientos_filtrado);
    valor_total.innerHTML = `${total} EUR`;
    text_total.innerHTML = `Total ingresos:`;

    if (movimientos_filtrado.length !== 0) {
        // cambiar aspecto botones
        document.querySelector("#mostrar_ingresos").classList.add('btn_funciones-active');
        document.querySelector("#mostrar_gastos").classList.remove('btn_funciones-active');     
    }

}

function mostrar_gastos () {
    filtrar_movimientos ('gasto');
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
function filtrar_movimientos (parametroFiltro) {
        movimientos_filtrado = movimientos.filter((movimiento)=> movimiento.clase.includes(parametroFiltro));
        (movimientos_filtrado.length !== 0) ? movimientos_filtrado : alert(`No se encontró ningún ${parametroFiltro} registado`);
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
    total = array.reduce((acc, elemento)=> acc + elemento.importe, 0);
    localStorage.setItem("total", total);
}

// Función de búsqueda por descripción
function buscar_descripcion() {
        let palabra = document.querySelector("#input_busqueda").value.toLowerCase();
        movimientos_palabra = movimientos.filter((movimiento)=> movimiento.descripcion.includes(palabra));
        (movimientos_palabra.length !== 0) ? listar_en_panel(movimientos_palabra) :alert(`No se encontró "${palabra}" en los movimientos`);

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


// Alertas con sweetalert
function alerta(title, text, icon, timer) {
    Swal.fire( {
        timer: timer,
        timerProgressBar: true,
        title: title,
        text: text,
        icon: icon,
        showConfirmButton: false
    })
}

let claseMovimiento = '';
async function choose () {
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

    // if (clase) {
    //     registrar_movimiento();
    // }
}

let categoriaMovimiento = '';
async function select_category_ingreso () {
    (claseMovimiento === 'ingreso') ? ( options = ingresosOptions) : ( options = gastosOptions);
    const { value: category } =  await Swal.fire({
        title: 'Selecciona una categoría',
        input: 'select',
        inputOptions: options,
        inputPlaceholder: '...',
        inputValidator: (value) => {
            if (!value) {
              return 'Necesitas elegir una categoría!'
            }
        }
      })
    
    if (category) {
        categoriaMovimiento = category;
    }
}

let fechaMovimiento = new Date().toLocaleDateString();
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
            if (fechaMovimiento == "undefined/undefined/"){
                fechaMovimiento = new Date().toLocaleDateString() ;
            }
        }
      });
      

}

let importeMovimiento = 0;
async function input_importe () {
    
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
                (claseMovimiento === 'gasto') && ( importeMovimiento = -importeMovimiento);
            }
        });
}

let descripcionIngreso = '';
async function input_descripcion () {
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


async function continuar () {
    Swal.fire({
        title: 'Deseas registrar otro movimiento?',
        showCancelButton: true,
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            continuar_ingresos = true;
        } else {
            continuar_ingresos = false;
        }
      })    
}

function appendObject(obj){
fetch('https://645f4ea39d35038e2d20a271.mockapi.io/guole', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(obj)
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}

function modifyObject(mov){

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
      .then(data => console.log(data))
      .catch(error => console.error(error));
}


