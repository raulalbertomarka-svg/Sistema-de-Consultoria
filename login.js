/**
 * login.js
 * ------------------------------------------------------------------
 * Acceso simulado. No implementa autenticación real: cualquier
 * correo/contraseña ingresados son aceptados. Solo se define qué
 * perfil (cliente o administración) se guarda en sessionStorage para
 * que cliente.html / administracion.html sepan qué mostrar.
 *
 * // TODO-SUPABASE: reemplazar por supabase.auth.signInWithPassword()
 * // y por una consulta al rol real del usuario autenticado.
 * ------------------------------------------------------------------
 */

(function () {
  'use strict';

  const CLAVE_SESION = 'portalConsultoria_usuario';
  let perfilSeleccionado = 'cliente';

  const btnCliente = document.getElementById('btn-perfil-cliente');
  const btnAdmin = document.getElementById('btn-perfil-admin');
  const form = document.getElementById('form-login');
  const mensajeError = document.getElementById('mensaje-error');
  const enlaceOlvido = document.getElementById('enlace-olvido');

  function seleccionarPerfil(perfil) {
    perfilSeleccionado = perfil;
    const esCliente = perfil === 'cliente';
    btnCliente.classList.toggle('activo', esCliente);
    btnAdmin.classList.toggle('activo', !esCliente);
    btnCliente.setAttribute('aria-selected', String(esCliente));
    btnAdmin.setAttribute('aria-selected', String(!esCliente));
  }

  btnCliente.addEventListener('click', () => seleccionarPerfil('cliente'));
  btnAdmin.addEventListener('click', () => seleccionarPerfil('administracion'));

  enlaceOlvido.addEventListener('click', (evento) => {
    evento.preventDefault();
    mostrarError('Esta es una demostración: la recuperación de contraseña no está disponible todavía.', 'info');
  });

  function mostrarError(texto) {
    mensajeError.textContent = texto;
    mensajeError.classList.remove('oculto');
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensajeError.classList.add('oculto');

    const correo = document.getElementById('correo').value.trim();
    const clave = document.getElementById('clave').value.trim();

    if (!correo || !clave) {
      mostrarError('Ingresá un correo y una contraseña de ejemplo para continuar (no se validan datos reales).');
      return;
    }

    const usuario = await window.servicios.obtenerUsuarioDemoPorPerfil(perfilSeleccionado);
    const usuarioSesion = Object.assign({}, usuario, { correoIngresado: correo });

    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuarioSesion));
    } catch (error) {
      console.warn('No se pudo guardar la sesión de demostración:', error);
    }

    window.location.href = perfilSeleccionado === 'cliente' ? 'cliente.html' : 'administracion.html';
  });
})();
