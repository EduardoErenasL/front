const globalData = {}
globalData.empleados = []
globalData.articulos = []
globalData.polizas = []
globalData.idPolizaEditarActual = 0
globalData.idPolizaEliminarActual = 0

async function obtenerEmpleados() {
  try {
    const response = await axios.get(`${URL_BASE}/empleado`, {
      headers: {
        "Authorization": AUTH_BASE,
        'Content-Type': "application/json",
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      }
    })

    if (response.data?.meta?.status == 'OK') {
      globalData.empleados = response.data.data
    } else {
      globalData.empleados = []
    }
   
    pintarEmpleados()
  } catch (error) {
    console.log(error.message)
    globalData.empleados = []
    pintarEmpleados()
  }
}

function pintarEmpleados () {
  let htmlOption = '<option value="-1" disabled selected>Seleccionar</option>'

  htmlOption += globalData.empleados.map(value => {
    return `<option value="${value.idEmpleado}">${value.nombre} ${value.apellido}</option>`
  }).join(' ')

  document.getElementById('empleadoAgregarPoliza').innerHTML = htmlOption
  document.getElementById('empleadoEditarPoliza').innerHTML = htmlOption
}

async function obtenerArticulos() {
  try {
    const response = await axios.get(`${URL_BASE}/inventario`)

    if (response.data?.meta?.status == 'OK') {
      globalData.articulos = response.data.data
    } else {
      globalData.empleados = []
    }

    pintarArticulos()
  } catch (error) {
    console.log(error.message)
    globalData.articulos = []
    pintarArticulos()
  }
}

function pintarArticulos () {
  let htmlOption = '<option value="-1" disabled selected>Seleccionar</option>'

  htmlOption += globalData.articulos.map(value => {
    return `<option value="${value.sku}">${value.sku} - ${value.nombre}</option>`
  }).join(' ')

  document.getElementById('articuloAgregarPoliza').innerHTML = htmlOption
  document.getElementById('articuloEditarPoliza').innerHTML = htmlOption
}

async function obtenerPolizas() {
  try {
    const response = await axios.get(`${URL_BASE}/poliza`)
   
    if (response.data?.meta?.status == 'OK') {
      globalData.polizas = response.data.data
    } else {
      globalData.polizas = []
    }
    pintarPolizas()
  } catch (error) {
    globalData.polizas = []
    pintarPolizas()
  }
}

function pintarPolizas () {
  let htmlrows = ''

  htmlrows = globalData.polizas.map(value => {
    return `
      <tr>
        <td><p>${value.idPolizas}</p></td>
        <td><p>${value.empleado.nombre} ${value.empleado.apellido}</p></td>
        <td><p>${value.articulo.nombre}</p></td>
        <td><p>${value.cantidad}</p></td>
        <td><p>${value.fecha}</p></td>
        <td>
          <div class="opciones">
            <button class="btn-option option-editar-poliza" data-id="${value.idPolizas}"><i class="icon-pencil"></i></button>
            <button class="btn-option option-eliminar-poliza" data-id="${value.idPolizas}"><i class="icon-trash"></i></button>
          </div>
        </td>
      </tr>
    `
  }).join(' ')

  document.getElementById('bodyTablePolizas').innerHTML = htmlrows

  //  EDITAR
  document.querySelectorAll('.opciones .option-editar-poliza').forEach(item => {
    item.removeEventListener('click', null)
  })

  document.querySelectorAll('.opciones .option-editar-poliza').forEach(item => {
    item.addEventListener('click', event => {
      const modalEditarPoliza = document.getElementById('modalEditarPoliza')
      
      const idEditar = event.target.dataset.id
      globalData.idPolizaEditarActual = idEditar
      llenarModalEditar(idEditar)

      modalEditarPoliza.classList.add('show')
    })
  })

  // ELIMINAR
  document.querySelectorAll('.opciones .option-eliminar-poliza').forEach(item => {
    item.removeEventListener('click', null)
  })

  document.querySelectorAll('.opciones .option-eliminar-poliza').forEach(item => {
    item.addEventListener('click', event => {
      const modalEliminarPoliza = document.getElementById('modalEliminarPolizaConfirmacion')

      const idEditar = event.target.dataset.id
      globalData.idPolizaEliminarActual = idEditar

      modalEliminarPoliza.classList.add('show')
    })
  })
}

// AGREGAR
function validarConfirmarPoliza () {
  const modalAgregarPoliza = document.getElementById('modalAgregarPoliza')
  const modalAgregarPolizaConfirmacion = document.getElementById('modalAgregarPolizaConfirmacion')
  let valido = true

  const empleado = document.getElementById('empleadoAgregarPoliza').value
  const articulo = document.getElementById('articuloAgregarPoliza').value
  const cantidad = document.getElementById('cantidadAgregarPoliza').value

  if (empleado == null || empleado == -1) {
    document.querySelector('#modalAgregarPoliza .group-control.empleado').classList.add('error')
    document.querySelector('#modalAgregarPoliza .group-control.empleado .msg').innerHTML = 'Seleccione un empleado'
    valido = false
  } else {
    document.querySelector('#modalAgregarPoliza .group-control.empleado').classList.remove('error')
  }

  if (articulo == null || articulo == -1) {
    document.querySelector('#modalAgregarPoliza .group-control.articulo').classList.add('error')
    document.querySelector('#modalAgregarPoliza .group-control.articulo .msg').innerHTML = 'Seleccione un articulo'
    valido = false
  } else {
    document.querySelector('#modalAgregarPoliza .group-control.articulo').classList.remove('error')
  }

  if (cantidad == null || cantidad <= 0) {
    document.querySelector('#modalAgregarPoliza .group-control.cantidad').classList.add('error')
    document.querySelector('#modalAgregarPoliza .group-control.cantidad .msg').innerHTML = 'Ingrese la cantidad'
    valido = false
  } else {
    document.querySelector('#modalAgregarPoliza .group-control.cantidad').classList.remove('error')
  }

  if (valido) {
    modalAgregarPoliza.classList.remove('show')
    modalAgregarPolizaConfirmacion.classList.add('show')
  }
}

async function guardarPoliza () {
  try {
    document.getElementById('modalAgregarPolizaConfirmacion').classList.remove('show')
    document.querySelector('#modalAgregarPolizaConfirmacion .alerta').classList.remove('show')
    document.getElementById('loadGeneral').classList.add('show')

    const empleado = document.getElementById('empleadoAgregarPoliza').value
    const articulo = document.getElementById('articuloAgregarPoliza').value
    const cantidad = document.getElementById('cantidadAgregarPoliza').value

    const data = {}
    data.empleado = {
      idEmpleado: empleado
    }
    data.articulo = {
      sku: articulo
    }
    data.cantidad = cantidad

    const response = await axios.post(`${URL_BASE}/poliza`, data)

    if (response.data?.meta?.status == 'OK') {
      obtenerPolizas()

      document.querySelector('#modalExito .msg-exito').innerHTML = 'Se creo correctamente la póliza.'

      document.getElementById('loadGeneral').classList.remove('show')
      document.getElementById('modalExito').classList.add('show')
    } else {
      document.querySelector('#modalAgregarPolizaConfirmacion .alerta .msg').innerHTML = response.data?.data?.mensaje ? response.data?.data?.mensaje : 'Ha ocurrido un error en el grabado.'
      document.getElementById('loadGeneral').classList.remove('show')
      document.querySelector('#modalAgregarPolizaConfirmacion .alerta').classList.add('show')
      document.getElementById('modalAgregarPolizaConfirmacion').classList.add('show')
    }
  } catch (error) {
    document.querySelector('#modalAgregarPolizaConfirmacion .alerta .msg').innerHTML = error.data?.data?.mensaje ? error.data?.data?.mensaje : 'Ha ocurrido un error en el grabado.'
    document.getElementById('loadGeneral').classList.remove('show')
    document.querySelector('#modalAgregarPolizaConfirmacion .alerta').classList.add('show')
    document.getElementById('modalAgregarPolizaConfirmacion').classList.add('show')
  }
}

// EDITAR
function llenarModalEditar (id) {
  let polizaEditar = {}

  for (const value of globalData.polizas) {
    if (id == value.idPolizas) {
      polizaEditar = value
      break
    }
  }
  
  document.getElementById('empleadoEditarPoliza').value = polizaEditar.empleado.idEmpleado
  document.getElementById('articuloEditarPoliza').value = polizaEditar.articulo.sku
  document.getElementById('cantidadEditarPoliza').value = polizaEditar.cantidad
}

function validarConfirmarEditarPoliza () {
  const modalEditarPoliza = document.getElementById('modalEditarPoliza')
  const modalEditarPolizaConfirmacion = document.getElementById('modalEditarPolizaConfirmacion')

  modalEditarPoliza.classList.remove('show')
  modalEditarPolizaConfirmacion.classList.add('show')
}

async function editarPoliza () {
  try {
    document.getElementById('modalEditarPolizaConfirmacion').classList.remove('show')
    document.querySelector('#modalEditarPolizaConfirmacion .alerta').classList.remove('show')
    document.getElementById('loadGeneral').classList.add('show')

    const cantidad = document.getElementById('cantidadEditarPoliza').value

    const data = {}
    data.cantidad = cantidad

    const response = await axios.put(`${URL_BASE}/poliza/${globalData.idPolizaEditarActual}`, data)

    if (response.data?.meta?.status == 'OK') {
      obtenerPolizas()

      document.querySelector('#modalExito .msg-exito').innerHTML = response.data?.data?.mensaje ? response.data?.data?.mensaje : 'Se actualizó correctamente la poliza.'

      document.getElementById('loadGeneral').classList.remove('show')
      document.getElementById('modalExito').classList.add('show')
    } else {
      document.querySelector('#modalEditarPolizaConfirmacion .alerta .msg').innerHTML = response.data?.data?.mensaje ? response.data?.data?.mensaje : 'Ha ocurrido un error al intentar actualizar la póliza.'
      document.getElementById('loadGeneral').classList.remove('show')
      document.querySelector('#modalEditarPolizaConfirmacion .alerta').classList.add('show')
      document.getElementById('modalEditarPolizaConfirmacion').classList.add('show')
    }
  } catch (error) {
    document.querySelector('#modalEditarPolizaConfirmacion .alerta .msg').innerHTML = error.data?.data?.mensaje ? error.data?.data?.mensaje : 'Ha ocurrido un error al intentar actualizar la póliza.'
    document.getElementById('loadGeneral').classList.remove('show')
    document.querySelector('#modalEditarPolizaConfirmacion .alerta').classList.add('show')
    document.getElementById('modalEditarPolizaConfirmacion').classList.add('show')
  }
}

// ELIMINAR
async function eliminarPoliza () {
  try {
    document.getElementById('modalEliminarPolizaConfirmacion').classList.remove('show')
    document.querySelector('#modalEliminarPolizaConfirmacion .alerta').classList.remove('show')
    document.getElementById('loadGeneral').classList.add('show')

    const response = await axios.delete(`${URL_BASE}/poliza/${globalData.idPolizaEliminarActual}`)

    if (response.data?.meta?.status == 'OK') {
      obtenerPolizas()

      document.querySelector('#modalExito .msg-exito').innerHTML = response.data?.data?.mensaje ? response.data?.data?.mensaje : 'Se eliminó correctamente la poliza.'

      document.getElementById('loadGeneral').classList.remove('show')
      document.getElementById('modalExito').classList.add('show')
    } else {
      document.querySelector('#modalEliminarPolizaConfirmacion .alerta .msg').innerHTML = response.data?.data?.mensaje ? response.data?.data?.mensaje : 'Ha ocurrido un error al intentar eliminar la póliza.'
      document.getElementById('loadGeneral').classList.remove('show')
      document.querySelector('#modalEliminarPolizaConfirmacion .alerta').classList.add('show')
      document.getElementById('modalEliminarPolizaConfirmacion').classList.add('show')
    }
  } catch (error) {
    document.querySelector('#modalEliminarPolizaConfirmacion .alerta .msg').innerHTML = error.data?.data?.mensaje ? error.data?.data?.mensaje : 'Ha ocurrido un error al intentar eliminar la póliza.'
    document.getElementById('loadGeneral').classList.remove('show')
    document.querySelector('#modalEliminarPolizaConfirmacion .alerta').classList.add('show')
    document.getElementById('modalEliminarPolizaConfirmacion').classList.add('show')
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  // AGREGAR POLIZA
  const buttonAgregarPoliza = document.getElementById('agregarPoliza')

  buttonAgregarPoliza.addEventListener('click', (event) => {
    const modalAgregarPoliza = document.getElementById('modalAgregarPoliza')

    document.querySelector('#modalAgregarPolizaConfirmacion .alerta').classList.remove('show')
    document.getElementById('empleadoAgregarPoliza').value = -1
    document.getElementById('articuloAgregarPoliza').value = -1
    document.getElementById('cantidadAgregarPoliza').value = ''

    modalAgregarPoliza.classList.add('show')
  })

  document.querySelector('#modalAgregarPoliza .group-control.empleado select').addEventListener('change', (event) => {
    document.querySelector('#modalAgregarPoliza .group-control.empleado').classList.remove('error')
  })

  document.querySelector('#modalAgregarPoliza .group-control.articulo select').addEventListener('change', (event) => {
    document.querySelector('#modalAgregarPoliza .group-control.articulo').classList.remove('error')
  })

  document.querySelector('#modalAgregarPoliza .group-control.cantidad input').addEventListener('change', (event) => {
    document.querySelector('#modalAgregarPoliza .group-control.cantidad').classList.remove('error')
  })

  const buttonCancelarAgregarPoliza = document.getElementById('cancelarAgregarPoliza')

  buttonCancelarAgregarPoliza.addEventListener('click', (event) => {
    const modalAgregarPoliza = document.getElementById('modalAgregarPoliza')

    modalAgregarPoliza.classList.remove('show')
  })

  const buttonCerrarAgregarPoliza = document.getElementById('cerrarAgregarPoliza')

  buttonCerrarAgregarPoliza.addEventListener('click', (event) => {
    const modalAgregarPoliza = document.getElementById('modalAgregarPoliza')

    modalAgregarPoliza.classList.remove('show')
  })

  const buttonAgregarPolizaModal = document.getElementById('aceptarAgregarPoliza')

  buttonAgregarPolizaModal.addEventListener('click', (event) => {
    validarConfirmarPoliza()
  })

  const buttonCancelarAgregarPolizaConfirmacion = document.getElementById('cancelarAgregarPolizaConfirmacion')

  buttonCancelarAgregarPolizaConfirmacion.addEventListener('click', (event) => {
    const modalAgregarPoliza = document.getElementById('modalAgregarPoliza')
    const modalAgregarPolizaConfirmacion = document.getElementById('modalAgregarPolizaConfirmacion')

    modalAgregarPolizaConfirmacion.classList.remove('show')
    modalAgregarPoliza.classList.add('show')
  })

  const buttonCerrarAgregarPolizaConfirmacion = document.getElementById('cerrarAgregarPolizaConfirmacion')

  buttonCerrarAgregarPolizaConfirmacion.addEventListener('click', (event) => {
    const modalAgregarPoliza = document.getElementById('modalAgregarPoliza')
    const modalAgregarPolizaConfirmacion = document.getElementById('modalAgregarPolizaConfirmacion')

    modalAgregarPolizaConfirmacion.classList.remove('show')
    modalAgregarPoliza.classList.add('show')
  })

  const buttonAceptarAgregarPolizaConfirmacion = document.getElementById('aceptarAgregarPolizaConfirmacion')

  buttonAceptarAgregarPolizaConfirmacion.addEventListener('click', (event) => {
    guardarPoliza()
  })

  // EDITAR
  document.querySelectorAll('.opciones .option-editar-poliza').forEach(item => {
    item.addEventListener('click', event => {
      const modalEditarPoliza = document.getElementById('modalEditarPoliza')

      modalEditarPoliza.classList.add('show')
    })
  })

  const buttonCancelarEditarPoliza = document.getElementById('cancelarEditarPoliza')

  buttonCancelarEditarPoliza.addEventListener('click', (event) => {
    const modalEditarPoliza = document.getElementById('modalEditarPoliza')

    modalEditarPoliza.classList.remove('show')
  })

  const buttonCerrarEditarPoliza = document.getElementById('cerrarEditarPoliza')

  buttonCerrarEditarPoliza.addEventListener('click', (event) => {
    const modalEditarPoliza = document.getElementById('modalEditarPoliza')

    modalEditarPoliza.classList.remove('show')
  })

  const buttonEditarPolizaModal = document.getElementById('aceptarEditarPoliza')

  buttonEditarPolizaModal.addEventListener('click', (event) => {
    validarConfirmarEditarPoliza()
  })

  const buttonCancelarEditarPolizaConfirmacion = document.getElementById('cancelarEditarPolizaConfirmacion')

  buttonCancelarEditarPolizaConfirmacion.addEventListener('click', (event) => {
    const modalEditarPoliza = document.getElementById('modalEditarPoliza')
    const modalEditarPolizaConfirmacion = document.getElementById('modalEditarPolizaConfirmacion')

    modalEditarPolizaConfirmacion.classList.remove('show')
    modalEditarPoliza.classList.add('show')
  })

  const buttonCerrarEditarPolizaConfirmacion = document.getElementById('cerrarEditarPolizaConfirmacion')

  buttonCerrarEditarPolizaConfirmacion.addEventListener('click', (event) => {
    const modalEditarPoliza = document.getElementById('modalEditarPoliza')
    const modalEditarPolizaConfirmacion = document.getElementById('modalEditarPolizaConfirmacion')

    modalEditarPolizaConfirmacion.classList.remove('show')
    modalEditarPoliza.classList.add('show')
  })

  const buttonAceptarEditarPolizaConfirmacion = document.getElementById('aceptarEditarPolizaConfirmacion')

  buttonAceptarEditarPolizaConfirmacion.addEventListener('click', (event) => {
    editarPoliza()
  })

  // ELIMINAR
  document.querySelectorAll('.opciones .option-eliminar-poliza').forEach(item => {
    item.addEventListener('click', event => {
      const modalEliminarPoliza = document.getElementById('modalEliminarPolizaConfirmacion')

      modalEliminarPoliza.classList.add('show')
    })
  })

  const buttonCancelarEliminarPolizaConfirmacion = document.getElementById('cancelarEliminarPolizaConfirmacion')

  buttonCancelarEliminarPolizaConfirmacion.addEventListener('click', (event) => {
    const modalEliminarPolizaConfirmacion = document.getElementById('modalEliminarPolizaConfirmacion')

    modalEliminarPolizaConfirmacion.classList.remove('show')
  })

  const buttonCerrarEliminarPolizaConfirmacion = document.getElementById('cerrarEliminarPolizaConfirmacion')

  buttonCerrarEliminarPolizaConfirmacion.addEventListener('click', (event) => {
    const modalEliminarPolizaConfirmacion = document.getElementById('modalEliminarPolizaConfirmacion')

    modalEliminarPolizaConfirmacion.classList.remove('show')
  })

  const buttonCerrarExito = document.getElementById('cerrarExito')

  buttonCerrarExito.addEventListener('click', (event) => {
    const modalexito = document.getElementById('modalExito')

    modalexito.classList.remove('show')
  })

  const buttonAceptarExito = document.getElementById('aceptarExito')

  buttonAceptarExito.addEventListener('click', (event) => {
    const modalexito = document.getElementById('modalExito')

    modalexito.classList.remove('show')
  })

  const buttonAceptarEliminarPolizaConfirmacion = document.getElementById('aceptarEliminarPolizaConfirmacion')

  buttonAceptarEliminarPolizaConfirmacion.addEventListener('click', (event) => {
    eliminarPoliza()
  })
});

obtenerEmpleados()
obtenerArticulos()
obtenerPolizas()