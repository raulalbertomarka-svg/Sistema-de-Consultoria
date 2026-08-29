/**
 * servicios.js
 * ------------------------------------------------------------------
 * Capa intermedia de acceso a datos. Ninguna pantalla debe leer
 * `DATOS_DEMO` directamente: todo pasa por las funciones de este
 * archivo. Esto permite que, en la segunda etapa, cada función se
 * reemplace por una consulta real a Supabase sin tocar el resto de
 * la aplicación.
 *
 * Todas las funciones son `async` (devuelven Promise) aunque hoy
 * solo lean datos locales, para que el cambio a Supabase sea directo.
 * ------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  const D = () => global.DATOS_DEMO;

  // Pequeña utilidad para simular latencia de red opcionalmente.
  // No se usa por defecto para mantener la demo ágil.
  function resuelto(valor) {
    return Promise.resolve(valor);
  }

  // ------------------------------------------------------------------
  // localStorage — únicamente para cambios demostrativos puntuales
  // (solicitudes nuevas y avance del plan de acción).
  // ------------------------------------------------------------------
  const CLAVE_SOLICITUDES = 'portalConsultoria_solicitudes';
  const CLAVE_ACCIONES = 'portalConsultoria_acciones';
  const CLAVE_CONTENIDO_ADMIN = 'portalConsultoria_contenidoAdmin';

  function leerSolicitudesGuardadas() {
    try {
      const crudo = localStorage.getItem(CLAVE_SOLICITUDES);
      return crudo ? JSON.parse(crudo) : [];
    } catch (error) {
      console.warn('No se pudieron leer las solicitudes guardadas:', error);
      return [];
    }
  }

  function guardarSolicitudes(lista) {
    try {
      localStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify(lista));
    } catch (error) {
      console.warn('No se pudo guardar la solicitud en localStorage:', error);
    }
  }

  function leerCambiosAcciones() {
    try {
      const crudo = localStorage.getItem(CLAVE_ACCIONES);
      return crudo ? JSON.parse(crudo) : {};
    } catch (error) {
      console.warn('No se pudieron leer los cambios de acciones guardados:', error);
      return {};
    }
  }

  function guardarCambioAccion(accionId, cambios) {
    const actuales = leerCambiosAcciones();
    actuales[accionId] = Object.assign({}, actuales[accionId], cambios);
    try {
      localStorage.setItem(CLAVE_ACCIONES, JSON.stringify(actuales));
    } catch (error) {
      console.warn('No se pudo guardar el cambio de la acción en localStorage:', error);
    }
  }

  function leerContenidoAdmin() {
    try {
      const crudo = localStorage.getItem(CLAVE_CONTENIDO_ADMIN);
      return crudo ? JSON.parse(crudo) : {};
    } catch (error) {
      console.warn('No se pudo leer el contenido administrativo guardado:', error);
      return {};
    }
  }

  function guardarContenidoAdmin(datos) {
    try {
      localStorage.setItem(CLAVE_CONTENIDO_ADMIN, JSON.stringify(datos));
    } catch (error) {
      console.warn('No se pudo guardar el contenido administrativo en localStorage:', error);
    }
  }

  // ------------------------------------------------------------------
  // Empresa / Proyecto
  // // TODO-SUPABASE: SELECT * FROM empresas WHERE id = :empresaId
  // ------------------------------------------------------------------
  async function obtenerEmpresaActual() {
    return resuelto(D().EMPRESA_ACTUAL);
  }

  // // TODO-SUPABASE: SELECT * FROM proyectos WHERE id = :proyectoId
  async function obtenerProyectoActual() {
    return resuelto(D().PROYECTO_ACTUAL);
  }

  // // TODO-SUPABASE: campo `resumen_ejecutivo` de la tabla `proyectos`
  async function obtenerResumenEjecutivo() {
    return resuelto(D().PROYECTO_ACTUAL.resumenEjecutivo);
  }

  // ------------------------------------------------------------------
  // Áreas e indicadores
  // // TODO-SUPABASE: SELECT * FROM areas WHERE proyecto_id = :proyectoId
  // ------------------------------------------------------------------
  async function obtenerAreas() {
    return resuelto(D().AREAS.slice());
  }

  // // TODO-SUPABASE: SELECT * FROM indicadores WHERE area_id IN (...)
  async function obtenerIndicadores(areaId) {
    const todos = D().INDICADORES.slice();
    return resuelto(areaId ? todos.filter((i) => i.areaId === areaId) : todos);
  }

  // ------------------------------------------------------------------
  // Fortalezas / Oportunidades
  // // TODO-SUPABASE: SELECT * FROM fortalezas WHERE proyecto_id = :proyectoId
  // ------------------------------------------------------------------
  async function obtenerFortalezas() {
    return resuelto(D().FORTALEZAS.slice());
  }

  // // TODO-SUPABASE: SELECT * FROM oportunidades WHERE proyecto_id = :proyectoId
  async function obtenerOportunidades() {
    return resuelto(D().OPORTUNIDADES.slice());
  }

  // ------------------------------------------------------------------
  // Plan de acción (con overrides guardados en localStorage)
  // // TODO-SUPABASE: SELECT * FROM acciones WHERE proyecto_id = :proyectoId
  // ------------------------------------------------------------------
  async function obtenerPlanAccion() {
    const overrides = leerCambiosAcciones();
    const acciones = D().ACCIONES.map((accion) => {
      const cambio = overrides[accion.id];
      return cambio ? Object.assign({}, accion, cambio) : Object.assign({}, accion);
    });
    return resuelto(acciones);
  }

  // // TODO-SUPABASE: UPDATE acciones SET estado = :estado, avance = :avance WHERE id = :accionId
  async function actualizarAccionDemo(accionId, cambios) {
    guardarCambioAccion(accionId, cambios);
    return resuelto(true);
  }

  // ------------------------------------------------------------------
  // Documentos
  // // TODO-SUPABASE: SELECT * FROM documentos WHERE proyecto_id = :proyectoId
  // ------------------------------------------------------------------
  async function obtenerDocumentos() {
    return resuelto(D().DOCUMENTOS.slice());
  }

  // ------------------------------------------------------------------
  // Catálogo de servicios
  // // TODO-SUPABASE: SELECT * FROM servicios WHERE activo = true
  // ------------------------------------------------------------------
  async function obtenerServicios() {
    return resuelto(D().SERVICIOS.slice());
  }

  async function obtenerServicioPorId(servicioId) {
    return resuelto(D().SERVICIOS.find((s) => s.id === servicioId) || null);
  }

  // ------------------------------------------------------------------
  // Solicitudes de acompañamiento (iniciales + guardadas en localStorage)
  // // TODO-SUPABASE: INSERT INTO solicitudes (...) / SELECT * FROM solicitudes
  // ------------------------------------------------------------------
  async function obtenerSolicitudes() {
    const guardadas = leerSolicitudesGuardadas();
    return resuelto(D().SOLICITUDES_INICIALES.concat(guardadas));
  }

  async function crearSolicitudServicio(datosFormulario) {
    const nueva = {
      id: 'sol-demo-' + Date.now(),
      proyectoId: D().PROYECTO_ACTUAL.id,
      empresaId: D().EMPRESA_ACTUAL.id,
      fecha: new Date().toISOString().slice(0, 10),
      contacto: datosFormulario.contacto,
      correo: datosFormulario.correo,
      telefono: datosFormulario.telefono || '',
      oportunidadId: datosFormulario.oportunidadId || null,
      servicioId: datosFormulario.servicioId || null,
      comentario: datosFormulario.comentario || '',
      medioPreferido: datosFormulario.medioPreferido,
      horarioPreferido: datosFormulario.horarioPreferido,
      estado: 'nueva',
      responsableInterno: 'Sin asignar',
      proximoSeguimiento: null,
      historial: [
        {
          fecha: new Date().toISOString().slice(0, 10),
          estado: 'nueva',
          nota: 'Solicitud de demostración creada desde el portal del cliente (guardada en localStorage).',
        },
      ],
      esDemoLocal: true,
    };

    const actuales = leerSolicitudesGuardadas();
    actuales.push(nueva);
    guardarSolicitudes(actuales);

    return resuelto(nueva);
  }

  // ------------------------------------------------------------------
  // Asistente de IA simulado
  // // TODO-SUPABASE / TODO-IA: reemplazar por llamada a un endpoint de
  // // IA con recuperación de contexto (RAG) sobre el informe real.
  // ------------------------------------------------------------------
  async function obtenerConversacionDemo() {
    return resuelto({
      mensajeInicial: D().MENSAJE_INICIAL_IA,
      preguntasSugeridas: D().PREGUNTAS_SUGERIDAS.slice(),
    });
  }

  async function preguntarAsistenteDemo(pregunta) {
    const respuestas = D().RESPUESTAS_IA_DEMO;
    const clave = Object.keys(respuestas).find(
      (p) => p.trim().toLowerCase() === String(pregunta).trim().toLowerCase()
    );
    const resultado = clave ? respuestas[clave] : D().RESPUESTA_IA_NO_DISPONIBLE;
    return resuelto(Object.assign({}, resultado));
  }

  // ------------------------------------------------------------------
  // Usuario en sesión
  // // TODO-SUPABASE: reemplazar por sesión real de Supabase Auth
  // ------------------------------------------------------------------

  // // TODO-SUPABASE: reemplazar por el usuario devuelto por supabase.auth.signInWithPassword()
  async function obtenerUsuarioDemoPorPerfil(perfil) {
    const usuario = perfil === 'administracion' ? D().USUARIOS_DEMO.consultor : D().USUARIOS_DEMO.cliente;
    return resuelto(Object.assign({}, usuario));
  }

  async function obtenerUsuarioActual() {
    try {
      const crudo = sessionStorage.getItem('portalConsultoria_usuario');
      return resuelto(crudo ? JSON.parse(crudo) : null);
    } catch (error) {
      return resuelto(null);
    }
  }

  // ------------------------------------------------------------------
  // Panel de Consultoría (administración)
  // // TODO-SUPABASE: consultas equivalentes con filtros por consultor/rol
  // ------------------------------------------------------------------
  async function obtenerEmpresasAdmin() {
    return resuelto(D().EMPRESAS_ADMIN.slice());
  }

  async function obtenerProyectosAdmin() {
    return resuelto(D().PROYECTOS_ADMIN.slice());
  }

  async function obtenerUsuariosInternos() {
    return resuelto(D().USUARIOS_INTERNOS_ADMIN.slice());
  }

  // ------------------------------------------------------------------
  // Constructor de contenido (panel de Consultoría)
  // Guarda de forma local (localStorage) el estado y los borradores de
  // cada bloque de contenido mientras no existe backend real.
  // // TODO-SUPABASE: tabla `contenido_proyecto` (bloque, proyecto_id,
  // // estado, valores, actualizado_en). Los métodos de abajo pasarán a
  // // ser INSERT/UPDATE/SELECT sobre esa tabla.
  // ------------------------------------------------------------------

  // // TODO-SUPABASE: SELECT * FROM contenido_proyecto WHERE bloque = :bloque AND proyecto_id = :proyectoId
  async function obtenerEstadoBloqueContenido(bloque) {
    const datos = leerContenidoAdmin();
    return resuelto(datos[bloque] || null);
  }

  // // TODO-SUPABASE: UPDATE contenido_proyecto SET valores = :valores, estado = 'Borrador' WHERE bloque = :bloque
  async function guardarBorradorContenido(bloque, valores) {
    const datos = leerContenidoAdmin();
    datos[bloque] = {
      valores: valores,
      estado: 'Borrador',
      actualizado: new Date().toISOString(),
    };
    guardarContenidoAdmin(datos);
    return resuelto(datos[bloque]);
  }

  // // TODO-SUPABASE: DELETE FROM contenido_proyecto WHERE bloque = :bloque AND proyecto_id = :proyectoId
  async function descartarBorradorContenido(bloque) {
    const datos = leerContenidoAdmin();
    delete datos[bloque];
    guardarContenidoAdmin(datos);
    return resuelto(true);
  }

  // // TODO-SUPABASE: UPDATE contenido_proyecto SET estado = :estado WHERE bloque = :bloque AND proyecto_id = :proyectoId
  async function actualizarEstadoContenido(bloque, estado) {
    const datos = leerContenidoAdmin();
    datos[bloque] = Object.assign({}, datos[bloque], {
      estado: estado,
      actualizado: new Date().toISOString(),
    });
    guardarContenidoAdmin(datos);
    return resuelto(datos[bloque]);
  }

  // ------------------------------------------------------------------
  // Restablecimiento de la demostración
  // Elimina únicamente lo guardado en localStorage por este prototipo.
  // Los datos originales de datos-demo.js nunca se modifican.
  // ------------------------------------------------------------------
  async function restablecerDatosDemo() {
    try {
      localStorage.removeItem(CLAVE_SOLICITUDES);
      localStorage.removeItem(CLAVE_ACCIONES);
      localStorage.removeItem(CLAVE_CONTENIDO_ADMIN);
    } catch (error) {
      console.warn('No se pudo restablecer completamente la demostración:', error);
    }
    return resuelto(true);
  }

  // ------------------------------------------------------------------
  // Exportación pública del servicio
  // ------------------------------------------------------------------
  global.servicios = {
    obtenerEmpresaActual,
    obtenerProyectoActual,
    obtenerResumenEjecutivo,
    obtenerAreas,
    obtenerIndicadores,
    obtenerFortalezas,
    obtenerOportunidades,
    obtenerPlanAccion,
    actualizarAccionDemo,
    obtenerDocumentos,
    obtenerServicios,
    obtenerServicioPorId,
    obtenerSolicitudes,
    crearSolicitudServicio,
    obtenerConversacionDemo,
    preguntarAsistenteDemo,
    obtenerUsuarioDemoPorPerfil,
    obtenerUsuarioActual,
    obtenerEmpresasAdmin,
    obtenerProyectosAdmin,
    obtenerUsuariosInternos,
    obtenerEstadoBloqueContenido,
    guardarBorradorContenido,
    descartarBorradorContenido,
    actualizarEstadoContenido,
    restablecerDatosDemo,
  };
})(window);
