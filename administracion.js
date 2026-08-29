/**
 * administracion.js
 * ------------------------------------------------------------------
 * Controla el panel interno simulado de Consultoría. Consume datos
 * exclusivamente a través de window.servicios (ver servicios.js).
 * ------------------------------------------------------------------
 */

(function () {
  'use strict';

  const svc = window.servicios;
  const escaparHtml = window.utilidades.escaparHTML;
  const formatearFecha = window.utilidades.formatearFecha;
  let CACHE = {
    empresas: [], proyectos: [], documentos: [], servicios: [], solicitudes: [], usuarios: [],
    oportunidades: [], proyecto: null, indicadores: [], fortalezas: [], plan: [],
  };
  let GRAFICOS = {};

  function obtenerSesion() {
    try {
      const crudo = sessionStorage.getItem('portalConsultoria_usuario');
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) { return null; }
  }

  async function iniciar() {
    const usuario = obtenerSesion();
    if (!usuario || usuario.rol !== 'administracion') {
      window.location.href = 'index.html';
      return;
    }

    document.getElementById('nombre-usuario').textContent = usuario.nombre;
    document.getElementById('cargo-usuario').textContent = usuario.cargo;
    document.getElementById('avatar-usuario').textContent = usuario.nombre.split(' ').map((p) => p[0]).join('').toUpperCase();

    configurarNavegacion();
    configurarMenuMovil();
    configurarConstructorContenido();
    configurarModales();

    CACHE.empresas = await svc.obtenerEmpresasAdmin();
    CACHE.proyectos = await svc.obtenerProyectosAdmin();
    CACHE.documentos = await svc.obtenerDocumentos();
    CACHE.servicios = await svc.obtenerServicios();
    CACHE.usuarios = await svc.obtenerUsuariosInternos();
    CACHE.oportunidades = await svc.obtenerOportunidades();
    CACHE.proyecto = await svc.obtenerProyectoActual();
    CACHE.indicadores = await svc.obtenerIndicadores();
    CACHE.fortalezas = await svc.obtenerFortalezas();
    CACHE.plan = await svc.obtenerPlanAccion();
    await recargarSolicitudes();

    pintarInicio();
    pintarEmpresas();
    llenarFiltroEstadoProyecto();
    pintarProyectos();
    await pintarBloqueContenido('resumen');
    pintarDocumentosAdmin();
    llenarFiltroEstadoSolicitud();
    pintarSolicitudesAdmin();
    pintarServiciosAdmin();
    pintarUsuariosAdmin();

    irASeccion(window.location.hash ? window.location.hash.slice(1) : 'inicio');
  }

  document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    sessionStorage.removeItem('portalConsultoria_usuario');
    window.location.href = 'index.html';
  });

  // ==================================================================
  // NAVEGACIÓN
  // ==================================================================
  function configurarNavegacion() {
    document.querySelectorAll('.sidebar-nav a[data-seccion]').forEach((enlace) => {
      enlace.addEventListener('click', (evento) => { evento.preventDefault(); irASeccion(enlace.dataset.seccion); });
    });
  }
  function irASeccion(idSeccion) {
    const existe = document.getElementById('vista-' + idSeccion);
    const destino = existe ? idSeccion : 'inicio';
    document.querySelectorAll('.vista').forEach((s) => s.classList.add('oculto'));
    document.getElementById('vista-' + destino).classList.remove('oculto');
    document.querySelectorAll('.sidebar-nav a').forEach((enlace) => enlace.classList.toggle('activo', enlace.dataset.seccion === destino));
    window.location.hash = destino;
    cerrarMenuMovil();
    window.scrollTo(0, 0);
  }
  function configurarMenuMovil() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('fondo-superposicion');
    document.getElementById('btn-menu-movil').addEventListener('click', () => { sidebar.classList.add('abierta'); overlay.classList.add('visible'); });
    overlay.addEventListener('click', cerrarMenuMovil);
  }
  function cerrarMenuMovil() {
    document.getElementById('sidebar').classList.remove('abierta');
    document.getElementById('fondo-superposicion').classList.remove('visible');
  }

  // ==================================================================
  // INICIO
  // ==================================================================
  function pintarInicio() {
    document.getElementById('kpi-empresas').textContent = CACHE.empresas.length;
    document.getElementById('kpi-proyectos').textContent = CACHE.proyectos.filter((p) => p.estado !== 'Cerrado').length;
    document.getElementById('kpi-pendientes').textContent = CACHE.documentos.filter((d) => d.estado === 'En revisión').length;
    document.getElementById('kpi-solicitudes-nuevas').textContent = CACHE.solicitudes.filter((s) => s.estado === 'nueva').length;

    const conteoEstados = {};
    CACHE.proyectos.forEach((p) => { conteoEstados[p.estado] = (conteoEstados[p.estado] || 0) + 1; });

    const ctx = document.getElementById('grafico-proyectos-estado');
    if (GRAFICOS.estado) GRAFICOS.estado.destroy();
    GRAFICOS.estado = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(conteoEstados),
        datasets: [{ label: 'Proyectos', data: Object.values(conteoEstados), backgroundColor: '#1E5F9E', borderRadius: 6 }],
      },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } },
    });

    const actividad = [
      { texto: 'Nueva solicitud de acompañamiento recibida de Empresa Demo S.A.', fecha: '2026-04-29' },
      { texto: 'Plan de acción actualizado: "Establecer ritual mensual de alineación" marcado como completado.', fecha: '2026-05-31' },
      { texto: 'Presentación de resultados publicada para el directorio.', fecha: '2026-04-18' },
      { texto: 'Nuevo proyecto en carga: Diagnóstico de Operaciones Logísticas.', fecha: '2026-04-10' },
    ];
    document.getElementById('lista-actividad-reciente').innerHTML = actividad.map((a) => `
      <div style="border-left:3px solid var(--azul-medio);padding-left:12px;">
        <div style="font-size:0.85rem;">${a.texto}</div>
        <div style="font-size:0.74rem;color:var(--gris-texto-suave);">${formatearFecha(a.fecha)}</div>
      </div>`).join('');
  }

  // ==================================================================
  // EMPRESAS
  // ==================================================================
  function pintarEmpresas() {
    document.getElementById('cuerpo-empresas').innerHTML = CACHE.empresas.map((e) => {
      const proyecto = CACHE.proyectos.find((p) => p.id === e.proyectoActivoId);
      return `<tr>
        <td><strong>${e.nombre}</strong></td>
        <td>${proyecto ? proyecto.nombre : '—'}</td>
        <td class="dato-cifra">${e.usuarios}</td>
        <td><button class="boton-texto" data-ver-empresa="${e.id}">Ver</button></td>
      </tr>`;
    }).join('');

    document.querySelectorAll('[data-ver-empresa]').forEach((b) => {
      b.addEventListener('click', () => alert('Vista de demostración de la empresa. En la versión final se abrirá el detalle completo de la cuenta.'));
    });
  }

  // ==================================================================
  // PROYECTOS
  // ==================================================================
  const ESTADOS_PROYECTO = ['Borrador', 'Información en carga', 'En revisión', 'Aprobado', 'Publicado', 'En seguimiento', 'Cerrado'];

  function llenarFiltroEstadoProyecto() {
    const select = document.getElementById('filtro-estado-proyecto');
    select.insertAdjacentHTML('beforeend', ESTADOS_PROYECTO.map((e) => `<option value="${e}">${e}</option>`).join(''));
    select.addEventListener('change', pintarProyectos);
  }

  function pintarProyectos() {
    const filtro = document.getElementById('filtro-estado-proyecto').value;
    const lista = CACHE.proyectos.filter((p) => filtro === 'todas' || p.estado === filtro);
    const contenedor = document.getElementById('cuerpo-proyectos');
    if (!lista.length) { contenedor.innerHTML = `<tr><td colspan="7">No hay proyectos con el estado seleccionado.</td></tr>`; return; }

    contenedor.innerHTML = lista.map((p) => {
      const empresa = CACHE.empresas.find((e) => e.id === p.empresaId);
      return `<tr>
        <td>${empresa ? empresa.nombre : '—'}</td>
        <td><strong>${p.nombre}</strong></td>
        <td>${p.consultorResponsable}</td>
        <td><span class="etiqueta-estado ${claseEstadoProyecto(p.estado)}">${p.estado}</span></td>
        <td>${formatearFecha(p.fechaActualizacion)}</td>
        <td class="dato-cifra">${p.usuarios}</td>
        <td><button class="boton-texto" data-ver-proyecto="${p.id}">Ver</button></td>
      </tr>`;
    }).join('');

    contenedor.querySelectorAll('[data-ver-proyecto]').forEach((b) => {
      b.addEventListener('click', () => irASeccion('contenido'));
    });
  }

  function claseEstadoProyecto(e) {
    if (e === 'Publicado' || e === 'Aprobado' || e === 'En seguimiento') return 'estado-positivo';
    if (e === 'En revisión' || e === 'Información en carga') return 'estado-alerta';
    if (e === 'Cerrado') return 'estado-neutro';
    return 'estado-info';
  }

  // ==================================================================
  // CONSTRUCTOR DE CONTENIDO
  // ==================================================================
  const BLOQUES_CONTENIDO = {
    resumen: { titulo: 'Resumen ejecutivo', estado: 'Publicado' },
    indicadores: { titulo: 'Indicadores', estado: 'Publicado' },
    fortalezas: { titulo: 'Fortalezas', estado: 'Publicado' },
    oportunidades: { titulo: 'Oportunidades de mejora', estado: 'Pendiente de revisión' },
    recomendaciones: { titulo: 'Recomendaciones', estado: 'Borrador' },
    plan: { titulo: 'Plan de acción', estado: 'Aprobado' },
  };

  function configurarConstructorContenido() {
    document.getElementById('selector-bloque-contenido').addEventListener('change', (e) => pintarBloqueContenido(e.target.value));
    document.querySelectorAll('[data-accion-contenido]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const claveActual = document.getElementById('selector-bloque-contenido').value;
        manejarAccionContenido(btn.dataset.accionContenido, claveActual);
      });
    });
  }

  /**
   * Dibuja el bloque de contenido seleccionado. Si existe un borrador
   * guardado localmente (ver servicios.js -> guardarBorradorContenido),
   * sus valores tienen prioridad sobre el contenido original de
   * datos-demo.js (que llega ya cacheado en CACHE a través de servicios).
   * Todo texto se escapa antes de insertarse en el HTML: aunque hoy
   * proviene de datos ficticios, una vez guardado como borrador pasa a
   * ser texto editado localmente y debe tratarse como no confiable.
   */
  async function pintarBloqueContenido(clave) {
    const bloque = BLOQUES_CONTENIDO[clave];
    document.getElementById('selector-bloque-contenido').value = clave;
    document.getElementById('titulo-bloque-contenido').textContent = bloque.titulo;
    document.getElementById('mensaje-borrador-contenido').classList.add('oculto');

    const guardado = await svc.obtenerEstadoBloqueContenido(clave);
    actualizarEtiquetaEstadoBloque(guardado ? guardado.estado : bloque.estado);
    const valoresGuardados = guardado && guardado.valores ? guardado.valores : null;

    const cuerpo = document.getElementById('cuerpo-bloque-contenido');

    function campoEditable(indice, etiqueta, textoOriginal) {
      const texto = valoresGuardados && valoresGuardados[String(indice)] !== undefined
        ? valoresGuardados[String(indice)]
        : textoOriginal;
      return `<div class="campo"><label>${escaparHtml(etiqueta)}</label>
        <textarea rows="2" data-campo-contenido="${indice}">${escaparHtml(texto)}</textarea></div>`;
    }

    if (clave === 'resumen') {
      const textoOriginal = CACHE.proyecto ? CACHE.proyecto.resumenEjecutivo : '';
      const texto = valoresGuardados && valoresGuardados['0'] !== undefined ? valoresGuardados['0'] : textoOriginal;
      cuerpo.innerHTML = `<div class="campo"><label>Texto del resumen ejecutivo</label>
        <textarea rows="5" data-campo-contenido="0">${escaparHtml(texto)}</textarea></div>`;
    } else if (clave === 'indicadores') {
      cuerpo.innerHTML = `<div class="tabla-envoltorio"><table class="tabla-datos"><thead><tr><th>Indicador</th><th>Valor</th><th>Meta</th></tr></thead><tbody>
        ${CACHE.indicadores.map((i) => `<tr><td>${escaparHtml(i.nombre)}</td><td class="dato-cifra">${escaparHtml(i.valor)} ${escaparHtml(i.unidad)}</td><td class="dato-cifra">${escaparHtml(i.meta)} ${escaparHtml(i.unidad)}</td></tr>`).join('')}
      </tbody></table></div>
      <p style="font-size:0.78rem;color:var(--gris-texto-suave);margin-top:10px;">Tabla de solo lectura en este prototipo.</p>`;
    } else if (clave === 'fortalezas') {
      cuerpo.innerHTML = CACHE.fortalezas.map((f, idx) => campoEditable(idx, f.titulo, f.explicacion)).join('');
    } else if (clave === 'oportunidades') {
      cuerpo.innerHTML = CACHE.oportunidades.map((o, idx) => campoEditable(idx, o.titulo, o.situacionEncontrada)).join('');
    } else if (clave === 'recomendaciones') {
      cuerpo.innerHTML = CACHE.oportunidades.map((o, idx) => campoEditable(idx, 'Recomendación · ' + o.titulo, o.recomendacion)).join('');
    } else if (clave === 'plan') {
      cuerpo.innerHTML = `<div class="tabla-envoltorio"><table class="tabla-datos"><thead><tr><th>Acción</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>
        ${CACHE.plan.map((a) => `<tr><td>${escaparHtml(a.nombre)}</td><td>${escaparHtml(a.responsable)}</td><td>${escaparHtml(a.estado)}</td></tr>`).join('')}
      </tbody></table></div>
      <p style="font-size:0.78rem;color:var(--gris-texto-suave);margin-top:10px;">Tabla de solo lectura aquí; el avance se edita desde el portal del cliente.</p>`;
    }
  }

  function actualizarEtiquetaEstadoBloque(estado) {
    const etiqueta = document.getElementById('estado-bloque-contenido');
    etiqueta.textContent = estado;
    etiqueta.className = 'etiqueta-estado ' + claseEstadoContenido(estado);
  }
  function claseEstadoContenido(e) {
    if (e === 'Publicado' || e === 'Aprobado') return 'estado-positivo';
    if (e === 'Pendiente de revisión') return 'estado-alerta';
    if (e === 'Borrador') return 'estado-neutro';
    return 'estado-info';
  }

  // // TODO-SUPABASE: cuando exista backend real, "borrador" y "descartar"
  // // dejarán de usar localStorage y pasarán a operar sobre la tabla
  // // `contenido_proyecto` mencionada en servicios.js.
  async function manejarAccionContenido(accion, claveActual) {
    const mensajeBorrador = document.getElementById('mensaje-borrador-contenido');
    mensajeBorrador.classList.add('oculto');

    if (accion === 'agregar' || accion === 'editar') {
      alert('Acción de demostración: en la versión funcional esto abriría el editor del bloque de contenido.');
      return;
    }

    if (accion === 'borrador') {
      const valores = {};
      document.querySelectorAll('#cuerpo-bloque-contenido [data-campo-contenido]').forEach((campo) => {
        valores[campo.dataset.campoContenido] = campo.value;
      });
      await svc.guardarBorradorContenido(claveActual, valores);
      await pintarBloqueContenido(claveActual);
      mensajeBorrador.classList.remove('oculto');
      return;
    }

    if (accion === 'descartar') {
      await svc.descartarBorradorContenido(claveActual);
      await pintarBloqueContenido(claveActual);
      return;
    }

    const mapaEstados = { ocultar: 'Oculto para el cliente', aprobar: 'Aprobado', publicar: 'Publicado' };
    await svc.actualizarEstadoContenido(claveActual, mapaEstados[accion]);
    actualizarEtiquetaEstadoBloque(mapaEstados[accion]);
  }

  // ==================================================================
  // DOCUMENTOS
  // ==================================================================
  function pintarDocumentosAdmin() {
    document.getElementById('cuerpo-documentos-admin').innerHTML = CACHE.documentos.map((d) => `
      <tr>
        <td><strong>${d.nombre}</strong></td>
        <td>${d.tipo}</td>
        <td>${formatearFecha(d.fecha)}</td>
        <td class="dato-cifra">v${d.version}</td>
        <td><span class="etiqueta-estado ${d.estado === 'Publicado' ? 'estado-positivo' : 'estado-alerta'}">${d.estado}</span></td>
        <td><button class="boton-texto" data-ver-doc-admin="${d.id}">Gestionar</button></td>
      </tr>
    `).join('');
    document.querySelectorAll('[data-ver-doc-admin]').forEach((b) => b.addEventListener('click', () => alert('Gestión de documento de demostración: aquí se podría reemplazar el archivo o cambiar su estado de publicación.')));
  }

  // ==================================================================
  // SOLICITUDES
  // ==================================================================
  async function recargarSolicitudes() { CACHE.solicitudes = await svc.obtenerSolicitudes(); }

  const ETIQUETAS_ESTADO_SOLICITUD = {
    nueva: 'Nueva', 'en-revision': 'En revisión', 'cliente-contactado': 'Cliente contactado',
    'reunion-programada': 'Reunión programada', 'propuesta-enviada': 'Propuesta enviada', cerrada: 'Cerrada',
  };

  function llenarFiltroEstadoSolicitud() {
    const select = document.getElementById('filtro-estado-solicitud-admin');
    select.insertAdjacentHTML('beforeend', Object.keys(ETIQUETAS_ESTADO_SOLICITUD).map((k) => `<option value="${k}">${ETIQUETAS_ESTADO_SOLICITUD[k]}</option>`).join(''));
    select.addEventListener('change', pintarSolicitudesAdmin);
  }

  function pintarSolicitudesAdmin() {
    const filtro = document.getElementById('filtro-estado-solicitud-admin').value;
    const lista = CACHE.solicitudes.filter((s) => filtro === 'todas' || s.estado === filtro);
    const contenedor = document.getElementById('cuerpo-solicitudes-admin');
    if (!lista.length) { contenedor.innerHTML = `<tr><td colspan="8">No hay solicitudes con el estado seleccionado.</td></tr>`; return; }

    contenedor.innerHTML = lista.map((s) => {
      const oportunidad = CACHE.oportunidades.find((o) => o.id === s.oportunidadId);
      const servicio = CACHE.servicios.find((sv) => sv.id === s.servicioId);
      return `<tr>
        <td>Empresa Demo S.A.${s.esDemoLocal ? ' <span class="etiqueta-estado estado-info" style="margin-left:6px;">Local</span>' : ''}</td>
        <td>${escaparHtml(s.contacto)}</td>
        <td>${oportunidad ? escaparHtml(oportunidad.titulo) : '—'}</td>
        <td>${servicio ? escaparHtml(servicio.nombre) : 'A definir'}</td>
        <td>${formatearFecha(s.fecha)}</td>
        <td>${escaparHtml(s.responsableInterno)}</td>
        <td><span class="etiqueta-estado ${claseEstadoSolicitud(s.estado)}">${escaparHtml(ETIQUETAS_ESTADO_SOLICITUD[s.estado] || s.estado)}</span></td>
        <td><button class="boton-texto" data-detalle-solicitud="${s.id}">Ver detalle</button></td>
      </tr>`;
    }).join('');

    contenedor.querySelectorAll('[data-detalle-solicitud]').forEach((b) => b.addEventListener('click', () => abrirDetalleSolicitud(b.dataset.detalleSolicitud)));
  }

  function claseEstadoSolicitud(e) {
    if (e === 'cerrada') return 'estado-neutro';
    if (e === 'nueva' || e === 'en-revision') return 'estado-alerta';
    if (e === 'propuesta-enviada' || e === 'reunion-programada') return 'estado-info';
    return 'estado-positivo';
  }

  function abrirDetalleSolicitud(id) {
    const s = CACHE.solicitudes.find((x) => x.id === id);
    // Todos los campos de esta solicitud (contacto, correo, teléfono,
    // comentario) fueron escritos por una persona usuaria del portal del
    // cliente: se escapan siempre antes de insertarse en el HTML.
    document.getElementById('cuerpo-modal-detalle-solicitud').innerHTML = `
      <p style="font-size:0.85rem;"><strong>Comentario del cliente:</strong> ${s.comentario ? escaparHtml(s.comentario) : 'Sin comentario adicional.'}</p>
      <p style="font-size:0.85rem;"><strong>Contacto:</strong> ${escaparHtml(s.contacto)} · ${escaparHtml(s.correo)}${s.telefono ? ' · ' + escaparHtml(s.telefono) : ''}</p>
      <p style="font-size:0.85rem;"><strong>Próximo seguimiento:</strong> ${s.proximoSeguimiento ? formatearFecha(s.proximoSeguimiento) : 'A definir'}</p>
      <h3 style="font-size:0.9rem;">Historial</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${(s.historial || []).map((h) => `
          <div style="border-left:3px solid var(--azul-medio);padding-left:12px;">
            <strong style="font-size:0.82rem;">${escaparHtml(ETIQUETAS_ESTADO_SOLICITUD[h.estado] || h.estado)}</strong>
            <div style="font-size:0.78rem;color:var(--gris-texto-suave);">${formatearFecha(h.fecha)}</div>
            <div style="font-size:0.84rem;">${escaparHtml(h.nota)}</div>
          </div>`).join('') || '<p>Sin historial registrado todavía.</p>'}
      </div>`;
    document.getElementById('fondo-modal-detalle-solicitud').classList.add('visible');
  }

  function configurarModales() {
    document.getElementById('cerrar-modal-detalle-solicitud').addEventListener('click', () => document.getElementById('fondo-modal-detalle-solicitud').classList.remove('visible'));
    document.getElementById('fondo-modal-detalle-solicitud').addEventListener('click', (e) => { if (e.target.id === 'fondo-modal-detalle-solicitud') e.currentTarget.classList.remove('visible'); });

    const fondoRestablecer = document.getElementById('fondo-modal-restablecer');
    document.getElementById('btn-restablecer-demo').addEventListener('click', () => fondoRestablecer.classList.add('visible'));
    document.getElementById('cerrar-modal-restablecer').addEventListener('click', () => fondoRestablecer.classList.remove('visible'));
    document.getElementById('cancelar-modal-restablecer').addEventListener('click', () => fondoRestablecer.classList.remove('visible'));
    fondoRestablecer.addEventListener('click', (e) => { if (e.target.id === 'fondo-modal-restablecer') fondoRestablecer.classList.remove('visible'); });

    document.getElementById('confirmar-modal-restablecer').addEventListener('click', async () => {
      await svc.restablecerDatosDemo();
      fondoRestablecer.classList.remove('visible');

      // Recargar únicamente lo que puede haber cambiado: solicitudes,
      // plan de acción (usado por el bloque "plan" del constructor) y
      // el estado/borrador del bloque de contenido actualmente abierto.
      await recargarSolicitudes();
      CACHE.plan = await svc.obtenerPlanAccion();
      pintarInicio();
      pintarSolicitudesAdmin();
      await pintarBloqueContenido(document.getElementById('selector-bloque-contenido').value);

      alert('Los datos de demostración se restablecieron correctamente. Los datos originales del prototipo no se vieron afectados.');
    });
  }

  // ==================================================================
  // CATÁLOGO DE SERVICIOS
  // ==================================================================
  function pintarServiciosAdmin() {
    document.getElementById('lista-servicios-admin').innerHTML = CACHE.servicios.map((s) => `
      <div class="tarjeta tarjeta-item">
        <div class="encabezado-item">
          <h3>${s.nombre}</h3>
          <span class="etiqueta-estado ${s.activo ? 'estado-positivo' : 'estado-neutro'}">${s.activo ? 'Activo' : 'Inactivo'}</span>
        </div>
        <p style="font-size:0.85rem;">${s.descripcion}</p>
        <div class="campo-mini"><strong>Resuelve</strong>${s.problemasQueResuelve.join(' · ')}</div>
        <div class="meta-linea"><span>${s.duracionEstimada}</span><span>· ${s.modalidad}</span></div>
      </div>
    `).join('');
  }

  // ==================================================================
  // USUARIOS
  // ==================================================================
  function pintarUsuariosAdmin() {
    document.getElementById('cuerpo-usuarios-admin').innerHTML = CACHE.usuarios.map((u) => `
      <tr>
        <td><strong>${u.nombre}</strong></td>
        <td>${u.cargo}</td>
        <td>${u.correo}</td>
        <td class="dato-cifra">${u.proyectosAsignados}</td>
        <td><span class="etiqueta-estado ${u.activo ? 'estado-positivo' : 'estado-neutro'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
      </tr>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
