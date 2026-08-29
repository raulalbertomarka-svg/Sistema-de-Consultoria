/**
 * cliente.js
 * ------------------------------------------------------------------
 * Controla la navegación entre secciones y la interacción del
 * portal del cliente. Consume datos exclusivamente a través de
 * window.servicios (ver servicios.js).
 * ------------------------------------------------------------------
 */

(function () {
  'use strict';

  const svc = window.servicios;
  const escaparHtml = window.utilidades.escaparHTML;
  const formatearFecha = window.utilidades.formatearFecha;

  const ETIQUETAS_AREA = {};
  const ETIQUETAS_PRIORIDAD = {
    'accion-inmediata': 'Acción inmediata',
    'proyecto-prioritario': 'Proyecto prioritario',
    'mejora-rapida': 'Mejora rápida',
    'mejora-futura': 'Mejora futura',
    alta: 'Alta', media: 'Media', baja: 'Baja',
  };
  const ETIQUETAS_ESTADO_PLAN = {
    'no-iniciada': 'No iniciada', 'en-proceso': 'En proceso',
    bloqueada: 'Bloqueada', completada: 'Completada',
  };
  const ETIQUETAS_ESTADO_SOLICITUD = {
    nueva: 'Nueva', 'en-revision': 'En revisión',
    'cliente-contactado': 'Cliente contactado', 'reunion-programada': 'Reunión programada',
    'propuesta-enviada': 'Propuesta enviada', cerrada: 'Cerrada',
  };

  let CACHE = { areas: [], indicadores: [], fortalezas: [], oportunidades: [], plan: [], documentos: [], servicios: [], solicitudes: [] };
  let GRAFICOS = {};

  // ==================================================================
  // ARRANQUE Y GUARDA DE SESIÓN
  // ==================================================================
  function obtenerSesion() {
    try {
      const crudo = sessionStorage.getItem('portalConsultoria_usuario');
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) { return null; }
  }

  async function iniciar() {
    const usuario = obtenerSesion();
    if (!usuario || usuario.rol !== 'cliente') {
      window.location.href = 'index.html';
      return;
    }

    pintarCabecera(usuario);
    configurarNavegacion();
    configurarMenuMovil();
    configurarModales();
    configurarChat();
    configurarPlanAccion();

    const empresa = await svc.obtenerEmpresaActual();
    const proyecto = await svc.obtenerProyectoActual();
    document.getElementById('header-empresa').textContent = empresa.nombre;
    document.getElementById('header-proyecto').textContent = proyecto.nombre;
    document.getElementById('inicio-empresa').textContent = empresa.nombre;

    CACHE.areas = await svc.obtenerAreas();
    CACHE.areas.forEach((a) => { ETIQUETAS_AREA[a.id] = a.nombre; });
    CACHE.indicadores = await svc.obtenerIndicadores();
    CACHE.fortalezas = await svc.obtenerFortalezas();
    CACHE.oportunidades = await svc.obtenerOportunidades();
    CACHE.documentos = await svc.obtenerDocumentos();
    CACHE.servicios = await svc.obtenerServicios();
    await recargarPlan();
    await recargarSolicitudes();

    await pintarInicio(usuario, proyecto);
    llenarFiltrosArea();
    pintarResultados();
    pintarFortalezas();
    pintarOportunidades();
    pintarPlanAccion();
    pintarDocumentos();
    pintarSolicitudes();
    pintarPerfil(usuario, empresa);
    await inicializarChat();

    irASeccion(window.location.hash ? window.location.hash.slice(1) : 'inicio');
  }

  function pintarCabecera(usuario) {
    document.getElementById('nombre-usuario').textContent = usuario.nombre;
    document.getElementById('cargo-usuario').textContent = usuario.cargo;
    document.getElementById('avatar-usuario').textContent = obtenerIniciales(usuario.nombre);
    document.getElementById('saludo-usuario').textContent = 'Hola, ' + usuario.nombre.split(' ')[0];
  }

  function obtenerIniciales(nombre) {
    return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }

  document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    sessionStorage.removeItem('portalConsultoria_usuario');
    window.location.href = 'index.html';
  });

  // ==================================================================
  // NAVEGACIÓN ENTRE SECCIONES
  // ==================================================================
  function configurarNavegacion() {
    document.querySelectorAll('.sidebar-nav a[data-seccion]').forEach((enlace) => {
      enlace.addEventListener('click', (evento) => {
        evento.preventDefault();
        irASeccion(enlace.dataset.seccion);
      });
    });
    document.querySelectorAll('[data-ir-a]').forEach((boton) => {
      boton.addEventListener('click', () => irASeccion(boton.dataset.irA));
    });
  }

  function irASeccion(idSeccion) {
    const secciones = document.querySelectorAll('.vista');
    const existe = document.getElementById('vista-' + idSeccion);
    const destino = existe ? idSeccion : 'inicio';

    secciones.forEach((s) => s.classList.add('oculto'));
    document.getElementById('vista-' + destino).classList.remove('oculto');

    document.querySelectorAll('.sidebar-nav a').forEach((enlace) => {
      enlace.classList.toggle('activo', enlace.dataset.seccion === destino);
    });

    window.location.hash = destino;
    cerrarMenuMovil();
    document.querySelector('.contenido-pagina').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function configurarMenuMovil() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('fondo-superposicion');
    document.getElementById('btn-menu-movil').addEventListener('click', () => {
      sidebar.classList.add('abierta');
      overlay.classList.add('visible');
    });
    overlay.addEventListener('click', cerrarMenuMovil);
  }
  function cerrarMenuMovil() {
    document.getElementById('sidebar').classList.remove('abierta');
    document.getElementById('fondo-superposicion').classList.remove('visible');
  }

  // ==================================================================
  // INICIO
  // ==================================================================
  async function pintarInicio(usuario, proyecto) {
    document.getElementById('kpi-puntuacion').textContent = proyecto.puntuacionGeneral + ' / 100';
    document.getElementById('kpi-estado-general').textContent = proyecto.estadoGeneral;
    document.getElementById('kpi-fortalezas').textContent = CACHE.fortalezas.length;
    document.getElementById('kpi-oportunidades').textContent = CACHE.oportunidades.length;
    document.getElementById('kpi-prioritarias').textContent = CACHE.oportunidades.filter((o) => o.prioridad === 'accion-inmediata').length;
    document.getElementById('texto-resumen-ejecutivo').textContent = proyecto.resumenEjecutivo;
    document.getElementById('inicio-periodo').textContent = proyecto.periodoAnalizado;
    document.getElementById('inicio-fecha').textContent = formatearFecha(proyecto.fechaPublicacion);

    dibujarRadarAreas('grafico-inicio-radar');

    const prioritarios = CACHE.oportunidades
      .filter((o) => o.prioridad === 'accion-inmediata')
      .concat(CACHE.oportunidades.filter((o) => o.prioridad === 'proyecto-prioritario'))
      .slice(0, 3);

    document.getElementById('lista-hallazgos-prioritarios').innerHTML = prioritarios.map((o) => `
      <div class="tarjeta-item" style="border:1px solid var(--gris-borde);border-radius:10px;padding:14px;">
        <span class="chip-prioridad prioridad-${o.prioridad}" style="align-self:flex-start;">${ETIQUETAS_PRIORIDAD[o.prioridad]}</span>
        <h3 style="font-size:0.95rem;margin-top:8px;">${o.titulo}</h3>
        <p style="font-size:0.82rem;margin:0;">${escaparHtml(ETIQUETAS_AREA[o.areaId])}</p>
      </div>
    `).join('') || '<p>No hay hallazgos prioritarios registrados.</p>';
  }

  // ==================================================================
  // GRÁFICOS
  // ==================================================================
  function dibujarRadarAreas(idCanvas) {
    const ctx = document.getElementById(idCanvas);
    if (!ctx) return;
    if (GRAFICOS[idCanvas]) GRAFICOS[idCanvas].destroy();
    GRAFICOS[idCanvas] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: CACHE.areas.map((a) => a.nombre),
        datasets: [
          { label: 'Resultado', data: CACHE.areas.map((a) => a.puntuacion), backgroundColor: 'rgba(30,95,158,0.18)', borderColor: '#1E5F9E', pointBackgroundColor: '#1E5F9E' },
          { label: 'Meta', data: CACHE.areas.map((a) => a.meta), backgroundColor: 'rgba(217,164,65,0.10)', borderColor: '#D9A441', pointBackgroundColor: '#D9A441', borderDash: [4, 4] },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 } } } },
        scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: '#DDE3EA' } } },
      },
    });
  }

  function dibujarBarrasResultados() {
    const ctx = document.getElementById('grafico-resultados-barras');
    if (!ctx) return;
    if (GRAFICOS.barras) GRAFICOS.barras.destroy();
    GRAFICOS.barras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: CACHE.areas.map((a) => a.nombre),
        datasets: [
          { label: 'Resultado', data: CACHE.areas.map((a) => a.puntuacion), backgroundColor: '#0B2545', borderRadius: 6 },
          { label: 'Meta', data: CACHE.areas.map((a) => a.meta), backgroundColor: '#DDE3EA', borderRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 } } } },
        scales: { y: { beginAtZero: true, max: 100 } },
      },
    });
  }

  // ==================================================================
  // RESULTADOS (ÁREAS)
  // ==================================================================
  function llenarFiltrosArea() {
    const opciones = CACHE.areas.map((a) => `<option value="${a.id}">${a.nombre}</option>`).join('');
    ['filtro-area-resultados', 'filtro-area-fortalezas', 'filtro-area-oportunidades', 'filtro-area-plan'].forEach((id) => {
      document.getElementById(id).insertAdjacentHTML('beforeend', opciones);
    });
  }

  function pintarResultados() {
    dibujarRadarAreas('grafico-resultados-radar');
    dibujarBarrasResultados();

    const filtroArea = document.getElementById('filtro-area-resultados').value;
    const filtroEstado = document.getElementById('filtro-estado-resultados').value;
    const lista = CACHE.areas.filter((a) =>
      (filtroArea === 'todas' || a.id === filtroArea) &&
      (filtroEstado === 'todas' || a.estado === filtroEstado)
    );

    const contenedor = document.getElementById('lista-areas');
    if (!lista.length) {
      contenedor.innerHTML = tarjetaVacia('No hay áreas que coincidan con los filtros seleccionados.');
      return;
    }

    contenedor.innerHTML = lista.map((a) => `
      <div class="tarjeta tarjeta-item">
        <div class="encabezado-item">
          <h3>${a.nombre}</h3>
          <span class="etiqueta-estado estado-${a.estado}">${textoEstado(a.estado)}</span>
        </div>
        <div class="valor dato-cifra" style="font-size:1.7rem;">${a.puntuacion}<span style="font-size:0.95rem;color:var(--gris-texto-suave);"> / meta ${a.meta}</span></div>
        <div class="barra-progreso"><span style="width:${a.puntuacion}%;background:${colorEstado(a.estado)}"></span></div>
        <p style="font-size:0.85rem;">${a.interpretacion}</p>
        <div class="meta-linea">
          <span>${a.fortalezas} fortaleza(s)</span>
          <span>· ${a.oportunidades} oportunidad(es)</span>
        </div>
        <button class="boton boton-secundario" style="align-self:flex-start;" data-detalle-area="${a.id}">Ver detalle</button>
      </div>
    `).join('');

    contenedor.querySelectorAll('[data-detalle-area]').forEach((btn) => {
      btn.addEventListener('click', () => abrirDetalleArea(btn.dataset.detalleArea));
    });
  }

  function abrirDetalleArea(areaId) {
    const area = CACHE.areas.find((a) => a.id === areaId);
    const indicadores = CACHE.indicadores.filter((i) => i.areaId === areaId);
    document.getElementById('titulo-modal-area').textContent = 'Detalle · ' + area.nombre;
    document.getElementById('cuerpo-modal-area').innerHTML = `
      <p>${escaparHtml(area.interpretacion)}</p>
      <h3 style="font-size:0.9rem;">Indicadores relacionados</h3>
      <div class="tabla-envoltorio">
        <table class="tabla-datos">
          <thead><tr><th>Indicador</th><th>Valor</th><th>Meta</th><th>Tendencia</th></tr></thead>
          <tbody>
            ${indicadores.map((i) => `<tr><td>${escaparHtml(i.nombre)}</td><td class="dato-cifra">${escaparHtml(i.valor)} ${escaparHtml(i.unidad)}</td><td class="dato-cifra">${escaparHtml(i.meta)} ${escaparHtml(i.unidad)}</td><td>${iconoTendencia(i.tendencia)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    document.getElementById('fondo-modal-area').classList.add('visible');
  }

  function iconoTendencia(t) {
    if (t === 'sube') return '<span class="etiqueta-estado estado-info">▲ Sube</span>';
    if (t === 'baja') return '<span class="etiqueta-estado estado-alerta">▼ Baja</span>';
    return '<span class="etiqueta-estado estado-neutro">▬ Estable</span>';
  }

  ['filtro-area-resultados', 'filtro-estado-resultados'].forEach((id) => {
    document.getElementById(id).addEventListener('change', pintarResultados);
  });

  function textoEstado(e) { return { positivo: 'Positivo', alerta: 'Alerta', critico: 'Crítico' }[e] || e; }
  function colorEstado(e) { return { positivo: '#1E8A5F', alerta: '#C97A20', critico: '#B23A2E' }[e] || '#1E5F9E'; }

  // ==================================================================
  // FORTALEZAS
  // ==================================================================
  function pintarFortalezas() {
    const fArea = document.getElementById('filtro-area-fortalezas').value;
    const fRel = document.getElementById('filtro-relevancia-fortalezas').value;
    const lista = CACHE.fortalezas.filter((f) =>
      (fArea === 'todas' || f.areaId === fArea) && (fRel === 'todas' || f.relevancia === fRel)
    );
    const contenedor = document.getElementById('lista-fortalezas');
    if (!lista.length) { contenedor.innerHTML = tarjetaVacia('No hay fortalezas que coincidan con los filtros seleccionados.'); return; }

    contenedor.innerHTML = lista.map((f) => `
      <div class="tarjeta tarjeta-item">
        <div class="encabezado-item">
          <h3>${f.titulo}</h3>
          <span class="etiqueta-estado estado-positivo">Relevancia ${f.relevancia}</span>
        </div>
        <div class="meta-linea"><span>${escaparHtml(ETIQUETAS_AREA[f.areaId])}</span></div>
        <p style="font-size:0.85rem;">${f.explicacion}</p>
        <div class="campo-mini"><strong>Evidencia</strong>${f.evidencia}</div>
        <div class="campo-mini"><strong>Impacto positivo</strong>${f.impactoPositivo}</div>
        <div class="campo-mini"><strong>Recomendación</strong>${f.recomendacion}</div>
        <div class="pie-item"><span class="referencia-informe">📄 Página ${f.paginaInforme} del informe</span></div>
      </div>
    `).join('');
  }
  ['filtro-area-fortalezas', 'filtro-relevancia-fortalezas'].forEach((id) => {
    document.getElementById(id).addEventListener('change', pintarFortalezas);
  });

  // ==================================================================
  // OPORTUNIDADES
  // ==================================================================
  function pintarOportunidades() {
    const fArea = document.getElementById('filtro-area-oportunidades').value;
    const fPrioridad = document.getElementById('filtro-prioridad-oportunidades').value;
    const fInterna = document.getElementById('filtro-interna-oportunidades').value;

    const lista = CACHE.oportunidades.filter((o) =>
      (fArea === 'todas' || o.areaId === fArea) &&
      (fPrioridad === 'todas' || o.prioridad === fPrioridad) &&
      (fInterna === 'todas' || (fInterna === 'si' ? o.resolucionInterna : !o.resolucionInterna))
    );

    const contenedor = document.getElementById('lista-oportunidades');
    if (!lista.length) { contenedor.innerHTML = tarjetaVacia('No hay oportunidades que coincidan con los filtros seleccionados.'); return; }

    contenedor.innerHTML = lista.map((o) => {
      const servicio = CACHE.servicios.find((s) => s.id === o.servicioRelacionadoId);
      return `
      <div class="tarjeta tarjeta-item">
        <div class="encabezado-item">
          <h3>${o.titulo}</h3>
          <span class="chip-prioridad prioridad-${o.prioridad}">${ETIQUETAS_PRIORIDAD[o.prioridad]}</span>
        </div>
        <div class="meta-linea">
          <span>${escaparHtml(ETIQUETAS_AREA[o.areaId])}</span>
          <span>· Impacto ${o.impacto}</span>
          <span>· Urgencia ${o.urgencia}</span>
          <span>· Dificultad ${o.dificultad}</span>
        </div>
        <p style="font-size:0.85rem;">${o.situacionEncontrada}</p>
        <div class="campo-mini"><strong>Riesgo de no actuar</strong>${o.riesgo}</div>
        <div class="campo-mini"><strong>Recomendación</strong>${o.recomendacion}</div>
        <div class="meta-linea">
          <span>Plazo: ${o.plazoRecomendado}</span>
          <span>· ${o.resolucionInterna ? 'Puede resolverse internamente' : 'Requiere acompañamiento externo'}</span>
        </div>
        <div class="pie-item">
          <span class="referencia-informe">📄 Página ${o.paginaInforme} del informe</span>
          ${servicio ? `<button class="boton boton-destacado" data-solicitar="${o.id}">Quiero acompañamiento</button>` : ''}
        </div>
      </div>`;
    }).join('');

    contenedor.querySelectorAll('[data-solicitar]').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalSolicitud(btn.dataset.solicitar));
    });
  }
  ['filtro-area-oportunidades', 'filtro-prioridad-oportunidades', 'filtro-interna-oportunidades'].forEach((id) => {
    document.getElementById(id).addEventListener('change', pintarOportunidades);
  });

  // ==================================================================
  // MODAL DE SOLICITUD DE ACOMPAÑAMIENTO
  // ==================================================================
  let oportunidadEnCurso = null;

  function abrirModalSolicitud(oportunidadId) {
    oportunidadEnCurso = CACHE.oportunidades.find((o) => o.id === oportunidadId);
    const servicio = CACHE.servicios.find((s) => s.id === oportunidadEnCurso.servicioRelacionadoId);
    const usuario = obtenerSesion();

    document.getElementById('sol-empresa').value = 'Empresa Demo S.A.';
    document.getElementById('sol-contacto').value = usuario.nombre;
    document.getElementById('sol-correo').value = usuario.correo;
    document.getElementById('sol-telefono').value = '';
    document.getElementById('sol-oportunidad').value = oportunidadEnCurso.titulo;
    document.getElementById('sol-servicio').value = servicio ? servicio.nombre : 'A definir con Consultoría';
    document.getElementById('sol-comentario').value = '';

    document.getElementById('vista-formulario-solicitud').classList.remove('oculto');
    document.getElementById('vista-confirmacion-solicitud').classList.add('oculto');
    document.getElementById('pie-modal-solicitud').classList.remove('oculto');

    document.getElementById('fondo-modal-solicitud').classList.add('visible');
  }

  function configurarModales() {
    document.getElementById('cerrar-modal-solicitud').addEventListener('click', cerrarModalSolicitud);
    document.getElementById('cancelar-modal-solicitud').addEventListener('click', cerrarModalSolicitud);
    document.getElementById('fondo-modal-solicitud').addEventListener('click', (e) => { if (e.target.id === 'fondo-modal-solicitud') cerrarModalSolicitud(); });

    document.getElementById('enviar-modal-solicitud').addEventListener('click', async () => {
      const contacto = document.getElementById('sol-contacto').value.trim();
      const correo = document.getElementById('sol-correo').value.trim();
      if (!contacto || !correo) { alert('Completá al menos el contacto y el correo antes de enviar.'); return; }

      await svc.crearSolicitudServicio({
        contacto, correo,
        telefono: document.getElementById('sol-telefono').value.trim(),
        oportunidadId: oportunidadEnCurso ? oportunidadEnCurso.id : null,
        servicioId: oportunidadEnCurso ? oportunidadEnCurso.servicioRelacionadoId : null,
        comentario: document.getElementById('sol-comentario').value.trim(),
        medioPreferido: document.getElementById('sol-medio').value,
        horarioPreferido: document.getElementById('sol-horario').value,
      });

      document.getElementById('vista-formulario-solicitud').classList.add('oculto');
      document.getElementById('vista-confirmacion-solicitud').classList.remove('oculto');
      document.getElementById('pie-modal-solicitud').classList.add('oculto');

      await recargarSolicitudes();
      pintarSolicitudes();
    });

    document.getElementById('cerrar-modal-area').addEventListener('click', () => document.getElementById('fondo-modal-area').classList.remove('visible'));
    document.getElementById('fondo-modal-area').addEventListener('click', (e) => { if (e.target.id === 'fondo-modal-area') e.currentTarget.classList.remove('visible'); });

    document.getElementById('cerrar-modal-detalle-solicitud').addEventListener('click', () => document.getElementById('fondo-modal-detalle-solicitud').classList.remove('visible'));
    document.getElementById('fondo-modal-detalle-solicitud').addEventListener('click', (e) => { if (e.target.id === 'fondo-modal-detalle-solicitud') e.currentTarget.classList.remove('visible'); });
  }

  function cerrarModalSolicitud() {
    document.getElementById('fondo-modal-solicitud').classList.remove('visible');
  }

  // ==================================================================
  // PLAN DE ACCIÓN
  // ==================================================================
  async function recargarPlan() {
    CACHE.plan = await svc.obtenerPlanAccion();
  }

  function configurarPlanAccion() {
    ['filtro-area-plan', 'filtro-estado-plan'].forEach((id) => {
      document.getElementById(id).addEventListener('change', pintarPlanAccion);
    });
    document.querySelectorAll('[data-vista-plan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-vista-plan]').forEach((b) => b.classList.remove('activo'));
        btn.classList.add('activo');
        const esTabla = btn.dataset.vistaPlan === 'tabla';
        document.getElementById('contenedor-plan-tabla').classList.toggle('oculto', !esTabla);
        document.getElementById('lista-plan-tarjetas').classList.toggle('oculto', esTabla);
      });
    });
  }

  function pintarPlanAccion() {
    const fArea = document.getElementById('filtro-area-plan').value;
    const fEstado = document.getElementById('filtro-estado-plan').value;
    const lista = CACHE.plan.filter((a) =>
      (fArea === 'todas' || a.areaId === fArea) && (fEstado === 'todas' || a.estado === fEstado)
    );

    const total = CACHE.plan.length || 1;
    const avancePromedio = Math.round(CACHE.plan.reduce((sum, a) => sum + a.avance, 0) / total);
    document.getElementById('plan-avance-general').textContent = avancePromedio + '%';
    document.getElementById('plan-barra-general').style.width = avancePromedio + '%';
    document.getElementById('plan-conteo-no-iniciada').textContent = CACHE.plan.filter((a) => a.estado === 'no-iniciada').length;
    document.getElementById('plan-conteo-en-proceso').textContent = CACHE.plan.filter((a) => a.estado === 'en-proceso').length;
    document.getElementById('plan-conteo-completada').textContent = CACHE.plan.filter((a) => a.estado === 'completada').length;

    const contenedorTarjetas = document.getElementById('lista-plan-tarjetas');
    const cuerpoTabla = document.getElementById('cuerpo-plan-tabla');

    if (!lista.length) {
      contenedorTarjetas.innerHTML = tarjetaVacia('No hay acciones que coincidan con los filtros seleccionados.');
      cuerpoTabla.innerHTML = '';
      return;
    }

    contenedorTarjetas.innerHTML = lista.map((a) => `
      <div class="tarjeta tarjeta-item">
        <div class="encabezado-item">
          <h3>${a.nombre}</h3>
          <span class="chip-prioridad prioridad-${a.prioridad}">${ETIQUETAS_PRIORIDAD[a.prioridad] || a.prioridad}</span>
        </div>
        <div class="meta-linea">
          <span>${escaparHtml(ETIQUETAS_AREA[a.areaId])}</span>
          <span>· Responsable: ${a.responsable}</span>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px;">
            <span>Avance</span><span class="dato-cifra">${a.avance}%</span>
          </div>
          <div class="barra-progreso ${a.estado === 'completada' ? 'completa' : ''} ${a.estado === 'bloqueada' ? 'bloqueada' : ''}"><span style="width:${a.avance}%"></span></div>
        </div>
        <p style="font-size:0.83rem;">${a.comentarios}</p>
        <div class="fila-2">
          <div class="campo" style="margin-bottom:0;">
            <label>Estado (demo)</label>
            <select data-cambio-estado="${a.id}">
              ${Object.keys(ETIQUETAS_ESTADO_PLAN).map((e) => `<option value="${e}" ${e === a.estado ? 'selected' : ''}>${ETIQUETAS_ESTADO_PLAN[e]}</option>`).join('')}
            </select>
          </div>
          <div class="campo" style="margin-bottom:0;">
            <label>Avance % (demo)</label>
            <input type="number" min="0" max="100" value="${a.avance}" data-cambio-avance="${a.id}">
          </div>
        </div>
        <div class="meta-linea"><span>Vence: ${formatearFecha(a.fechaLimite)}</span>${a.requiereAcompanamiento ? '<span>· Requiere acompañamiento</span>' : ''}</div>
      </div>
    `).join('');

    cuerpoTabla.innerHTML = lista.map((a) => `
      <tr>
        <td>${a.nombre}</td>
        <td>${escaparHtml(ETIQUETAS_AREA[a.areaId])}</td>
        <td>${a.responsable}</td>
        <td><span class="etiqueta-estado ${estadoPlanClase(a.estado)}">${ETIQUETAS_ESTADO_PLAN[a.estado]}</span></td>
        <td class="dato-cifra">${a.avance}%</td>
        <td><span class="chip-prioridad prioridad-${a.prioridad}">${ETIQUETAS_PRIORIDAD[a.prioridad] || a.prioridad}</span></td>
        <td>${formatearFecha(a.fechaLimite)}</td>
      </tr>
    `).join('');

    contenedorTarjetas.querySelectorAll('[data-cambio-estado]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        await svc.actualizarAccionDemo(sel.dataset.cambioEstado, { estado: sel.value });
        await recargarPlan();
        pintarPlanAccion();
      });
    });
    contenedorTarjetas.querySelectorAll('[data-cambio-avance]').forEach((input) => {
      input.addEventListener('change', async () => {
        let valor = Math.min(100, Math.max(0, Number(input.value) || 0));
        await svc.actualizarAccionDemo(input.dataset.cambioAvance, { avance: valor });
        await recargarPlan();
        pintarPlanAccion();
      });
    });
  }

  function estadoPlanClase(e) {
    return { 'no-iniciada': 'estado-neutro', 'en-proceso': 'estado-info', bloqueada: 'estado-critico', completada: 'estado-positivo' }[e] || 'estado-neutro';
  }

  // ==================================================================
  // ASISTENTE DE IA
  // ==================================================================
  function configurarChat() {
    document.getElementById('form-chat').addEventListener('submit', async (evento) => {
      evento.preventDefault();
      const entrada = document.getElementById('entrada-chat');
      const texto = entrada.value.trim();
      if (!texto) return;
      entrada.value = '';
      await enviarPreguntaChat(texto);
    });
  }

  async function inicializarChat() {
    const datos = await svc.obtenerConversacionDemo();
    const contenedor = document.getElementById('chat-mensajes');
    contenedor.innerHTML = '';
    agregarMensajeChat('asistente', datos.mensajeInicial);

    document.getElementById('lista-preguntas-sugeridas').innerHTML = datos.preguntasSugeridas
      .map((p) => `<button type="button" data-pregunta="${escaparHtml(p)}">${p}</button>`).join('');

    document.querySelectorAll('[data-pregunta]').forEach((btn) => {
      btn.addEventListener('click', () => enviarPreguntaChat(btn.dataset.pregunta));
    });
  }

  function agregarMensajeChat(rol, texto, extra) {
    const contenedor = document.getElementById('chat-mensajes');
    const div = document.createElement('div');
    div.className = 'mensaje-chat ' + rol;
    let html = `<div class="burbuja">${escaparHtml(texto)}</div>`;
    if (extra && !extra.noDisponible && extra.fuente) {
      html += `<div class="fuente-respuesta">📄 ${extra.fuente}${extra.pagina ? ' · página ' + extra.pagina : ''}
        ${extra.hallazgoRelacionadoId ? `<button data-ver-hallazgo="${extra.hallazgoRelacionadoId}">Ver hallazgo relacionado</button>` : ''}</div>`;
    } else if (extra && extra.noDisponible) {
      html += `<div class="fuente-respuesta">⚠️ Respuesta no disponible en esta demostración</div>`;
    }
    div.innerHTML = html;
    contenedor.appendChild(div);
    contenedor.scrollTop = contenedor.scrollHeight;

    const botonHallazgo = div.querySelector('[data-ver-hallazgo]');
    if (botonHallazgo) {
      botonHallazgo.addEventListener('click', () => irAHallazgo(botonHallazgo.dataset.verHallazgo));
    }
  }

  function irAHallazgo(id) {
    if (id.startsWith('opo-')) { irASeccion('oportunidades'); }
    else if (id.startsWith('for-')) { irASeccion('fortalezas'); }
    else if (id.startsWith('area-')) { irASeccion('resultados'); }
  }

  async function enviarPreguntaChat(texto) {
    agregarMensajeChat('usuario', texto);
    const respuesta = await svc.preguntarAsistenteDemo(texto);
    setTimeout(() => agregarMensajeChat('asistente', respuesta.respuesta, respuesta), 260);
  }

  // ==================================================================
  // DOCUMENTOS
  // ==================================================================
  function pintarDocumentos() {
    document.getElementById('cuerpo-documentos').innerHTML = CACHE.documentos.map((d) => `
      <tr>
        <td><strong>${d.nombre}</strong></td>
        <td>${d.tipo}</td>
        <td>${formatearFecha(d.fecha)}</td>
        <td class="dato-cifra">v${d.version}</td>
        <td><span class="etiqueta-estado ${d.estado === 'Publicado' ? 'estado-positivo' : 'estado-alerta'}">${d.estado}</span></td>
        <td class="dato-cifra">${d.tamano}</td>
        <td style="white-space:nowrap;">
          <button class="boton-texto" data-ver-doc="${d.id}">Ver</button>
          <button class="boton-texto" data-descargar-doc="${d.id}">Descargar</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('[data-ver-doc]').forEach((b) => b.addEventListener('click', () => alert('Vista previa de demostración: "' + buscarDoc(b.dataset.verDoc).nombre + '". En la versión final se abrirá el documento real.')));
    document.querySelectorAll('[data-descargar-doc]').forEach((b) => b.addEventListener('click', () => alert('Descarga de demostración: "' + buscarDoc(b.dataset.descargarDoc).nombre + '". No se descargará un archivo real en este prototipo.')));
  }
  function buscarDoc(id) { return CACHE.documentos.find((d) => d.id === id); }

  // ==================================================================
  // SOLICITUDES
  // ==================================================================
  async function recargarSolicitudes() {
    CACHE.solicitudes = await svc.obtenerSolicitudes();
  }

  function pintarSolicitudes() {
    const contenedor = document.getElementById('contenedor-solicitudes');
    if (!CACHE.solicitudes.length) {
      contenedor.innerHTML = tarjetaVacia('Todavía no realizaste solicitudes de acompañamiento.');
      return;
    }
    contenedor.innerHTML = `
      <div class="tabla-envoltorio tarjeta" style="padding:0;">
        <table class="tabla-datos">
          <thead><tr><th>Fecha</th><th>Oportunidad</th><th>Servicio</th><th>Estado</th><th>Próximo paso</th><th></th></tr></thead>
          <tbody>
            ${CACHE.solicitudes.map((s) => {
              const oportunidad = CACHE.oportunidades.find((o) => o.id === s.oportunidadId);
              const servicio = CACHE.servicios.find((sv) => sv.id === s.servicioId);
              return `<tr>
                <td>${formatearFecha(s.fecha)}</td>
                <td>${oportunidad ? oportunidad.titulo : '—'}</td>
                <td>${servicio ? servicio.nombre : 'A definir'}</td>
                <td><span class="etiqueta-estado ${claseEstadoSolicitud(s.estado)}">${ETIQUETAS_ESTADO_SOLICITUD[s.estado] || s.estado}</span></td>
                <td>${formatearFecha(s.proximoSeguimiento) || '—'}</td>
                <td><button class="boton-texto" data-detalle-solicitud="${s.id}">Ver detalle</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;

    contenedor.querySelectorAll('[data-detalle-solicitud]').forEach((b) => {
      b.addEventListener('click', () => abrirDetalleSolicitud(b.dataset.detalleSolicitud));
    });
  }

  function claseEstadoSolicitud(e) {
    if (e === 'cerrada') return 'estado-neutro';
    if (e === 'nueva' || e === 'en-revision') return 'estado-alerta';
    if (e === 'propuesta-enviada' || e === 'reunion-programada') return 'estado-info';
    return 'estado-positivo';
  }

  function abrirDetalleSolicitud(id) {
    const s = CACHE.solicitudes.find((x) => x.id === id);
    // s.comentario y h.nota pueden contener texto escrito por una persona
    // usuaria (o, en el historial, texto generado por el sistema): siempre
    // se escapan antes de insertarse en la plantilla.
    document.getElementById('cuerpo-modal-detalle-solicitud').innerHTML = `
      <p style="font-size:0.85rem;">${s.comentario ? escaparHtml(s.comentario) : 'Sin comentario adicional.'}</p>
      <h3 style="font-size:0.9rem;">Historial</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${(s.historial || []).map((h) => `
          <div style="border-left:3px solid var(--azul-medio);padding-left:12px;">
            <strong style="font-size:0.82rem;">${escaparHtml(ETIQUETAS_ESTADO_SOLICITUD[h.estado] || h.estado)}</strong>
            <div style="font-size:0.78rem;color:var(--gris-texto-suave);">${formatearFecha(h.fecha)}</div>
            <div style="font-size:0.84rem;">${escaparHtml(h.nota)}</div>
          </div>
        `).join('') || '<p>Sin historial registrado todavía.</p>'}
      </div>`;
    document.getElementById('fondo-modal-detalle-solicitud').classList.add('visible');
  }

  // ==================================================================
  // PERFIL
  // ==================================================================
  function pintarPerfil(usuario, empresa) {
    document.getElementById('perfil-nombre').value = usuario.nombre;
    document.getElementById('perfil-cargo').value = usuario.cargo;
    document.getElementById('perfil-empresa').value = empresa.nombre;
    document.getElementById('perfil-correo').value = usuario.correo;
    document.getElementById('perfil-telefono').value = usuario.telefono || '';

    const prefs = usuario.preferenciasNotificacion || {};
    const etiquetas = { correo: 'Notificaciones por correo', avisosPlataforma: 'Avisos dentro de la plataforma', resumenSemanal: 'Resumen semanal' };
    document.getElementById('contenedor-preferencias').innerHTML = Object.keys(etiquetas).map((k) => `
      <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;margin-bottom:6px;">
        <input type="checkbox" ${prefs[k] ? 'checked' : ''} disabled> ${etiquetas[k]}
      </label>
    `).join('');
  }

  // ==================================================================
  // UTILIDADES
  // ==================================================================
  function tarjetaVacia(texto) {
    return `<div class="contenedor-vacio" style="grid-column:1/-1;">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <p style="margin:0;">${texto}</p>
    </div>`;
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
