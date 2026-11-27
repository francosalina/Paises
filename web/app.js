const estado = document.getElementById('estado')
const inputNuevoPais = document.getElementById('nuevoPais')
const inputFiltroPais = document.getElementById('filtroPais')
const btnAgregar = document.getElementById('btnAgregar')
const inputNuevaProvincia = document.getElementById('nuevaProvincia')
const btnAgregarProvincia = document.getElementById('btnAgregarProvincia')
let paisesCache = []
let paisSeleccionadoId = null

btnAgregar.onclick = crearPais

if (inputFiltroPais) {
  inputFiltroPais.oninput = function () {
    renderizarTabla(paisesCache)
  }
}

if (btnAgregarProvincia) {
  btnAgregarProvincia.onclick = crearProvincia
}

function renderizarTabla(lista) {
  const tbody = document.getElementById('tablaPaises')
  const filtro = inputFiltroPais
    ? inputFiltroPais.value.trim().toLowerCase()
    : ''
  const filtrados = filtro
    ? lista.filter(function (p) {
        return String(p.pais_descripcion).toLowerCase().includes(filtro)
      })
    : lista

  tbody.innerHTML = ''

  if (!filtrados.length) {
    const tr = document.createElement('tr')
    tr.innerHTML =
      "<td colspan='3' style='color:#64748b;text-align:center;padding:18px;'>No hay países para mostrar.</td>"
    tbody.appendChild(tr)
    return
  }

  filtrados.forEach(function (p) {
    const id = Number(p.pais_id)
    const tr = document.createElement('tr')

    const tdId = document.createElement('td')
    tdId.textContent = id

    const tdNombre = document.createElement('td')
    const inputNombre = document.createElement('input')
    inputNombre.id = 'nombre-' + id
    inputNombre.type = 'text'
    inputNombre.value = p.pais_descripcion
    tdNombre.appendChild(inputNombre)

    const tdAcciones = document.createElement('td')
    const divAcciones = document.createElement('div')
    divAcciones.className = 'acciones-celda'

    const btnProv = document.createElement('button')
    btnProv.className = 'btn-prov'
    btnProv.type = 'button'
    btnProv.textContent = 'Provincias'
    btnProv.onclick = function () {
      verProvincias(id)
    }

    const btnSave = document.createElement('button')
    btnSave.className = 'btn-save'
    btnSave.type = 'button'
    btnSave.textContent = 'Guardar'
    btnSave.onclick = function () {
      actualizarPais(id)
    }

    const btnDel = document.createElement('button')
    btnDel.className = 'btn-del'
    btnDel.type = 'button'
    btnDel.textContent = 'Borrar'
    btnDel.onclick = function () {
      eliminarPais(id)
    }

    divAcciones.appendChild(btnProv)
    divAcciones.appendChild(btnSave)
    divAcciones.appendChild(btnDel)
    tdAcciones.appendChild(divAcciones)

    tr.appendChild(tdId)
    tr.appendChild(tdNombre)
    tr.appendChild(tdAcciones)
    tbody.appendChild(tr)
  })
}

async function cargarPaises() {
  estado.textContent = 'Consultando api.php...'
  try {
    const res = await fetch('api.php?action=listar_paises')
    const paises = await res.json()
    paisesCache = paises
    renderizarTabla(paises)
    estado.textContent = paises.length + ' países'
  } catch (err) {
    estado.textContent = 'Error: ' + err.message
  }
}

async function crearPais() {
  const nombre = inputNuevoPais.value.trim()
  if (!nombre) return
  await fetch('api.php?action=crear_pais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pais_descripcion: nombre }),
  })
  inputNuevoPais.value = ''
  cargarPaises()
}

async function actualizarPais(id) {
  const nuevoNombre = document.getElementById('nombre-' + id).value.trim()
  if (!nuevoNombre) return
  await fetch('api.php?action=actualizar_pais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pais_id: id, pais_descripcion: nuevoNombre }),
  })
  cargarPaises()
}

async function eliminarPais(id) {
  const res = await fetch('api.php?action=eliminar_pais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pais_id: id }),
  })
  const data = await res.json()
  if (!res.ok) alert(data.error || 'No se pudo eliminar')
  cargarPaises()
}

async function verProvincias(paisId) {
  paisSeleccionadoId = Number(paisId)
  const pais = paisesCache.find(function (x) {
    return Number(x.pais_id) === paisSeleccionadoId
  })
  const nombrePais = pais ? pais.pais_descripcion : 'ID ' + paisSeleccionadoId
  document.getElementById('masterTitulo').textContent =
    nombrePais + ' (ID ' + paisSeleccionadoId + ')'

  if (inputNuevaProvincia) {
    inputNuevaProvincia.disabled = false
    inputNuevaProvincia.placeholder =
      'Nueva provincia para ' + nombrePais + '...'
  }
  if (btnAgregarProvincia) {
    btnAgregarProvincia.disabled = false
  }

  const res = await fetch(
    'api.php?action=provincias_por_pais&pais_id=' + paisSeleccionadoId,
  )
  const provs = await res.json()
  const ul = document.getElementById('listaProvincias')
  ul.innerHTML = ''

  if (!Array.isArray(provs) || provs.length === 0) {
    ul.innerHTML = '<li><span>Sin provincias cargadas.</span></li>'
    return
  }
  provs.forEach(function (pr) {
    const li = document.createElement('li')
    const span = document.createElement('span')
    span.textContent = pr.pro_descripcion
    const strong = document.createElement('strong')
    strong.style.color = '#64748b'
    strong.textContent = '#' + pr.pro_id
    li.appendChild(span)
    li.appendChild(strong)
    ul.appendChild(li)
  })
}

async function crearProvincia() {
  if (!paisSeleccionadoId || !inputNuevaProvincia) return
  const nombre = inputNuevaProvincia.value.trim()
  if (!nombre) return

  const res = await fetch('api.php?action=crear_provincia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pais_id: paisSeleccionadoId,
      pro_descripcion: nombre,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    alert(data.error || 'No se pudo guardar la provincia')
    return
  }

  inputNuevaProvincia.value = ''
  verProvincias(paisSeleccionadoId)
}

cargarPaises()
