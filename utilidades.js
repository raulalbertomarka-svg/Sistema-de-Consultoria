/**
 * utilidades.js
 * ------------------------------------------------------------------
 * Funciones auxiliares compartidas por login.js, cliente.js y
 * administracion.js. No accede a datos: solo helpers de presentación.
 *
 * IMPORTANTE — seguridad: cualquier texto que provenga de una persona
 * usuaria (nombre de contacto, correo, teléfono, comentarios, preguntas
 * del chat, texto escrito en el constructor de contenido, etc.) debe
 * pasar por `escaparHTML()` antes de insertarse mediante `innerHTML`.
 * De lo contrario, un texto como
 *   <img src=x onerror=alert('prueba')>
 * se interpretaría como HTML/JavaScript en lugar de mostrarse como
 * texto literal.
 * ------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  /**
   * Convierte cualquier valor a texto plano y escapa los caracteres
   * especiales de HTML (<, >, &, comillas). Seguro para insertar el
   * resultado dentro de una plantilla que luego se asigna a innerHTML.
   */
  function escaparHTML(valor) {
    const texto = valor === null || valor === undefined ? '' : String(valor);
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  /**
   * Formatea una fecha ISO (YYYY-MM-DD) al formato corto en español,
   * por ejemplo "15 abr. 2026".
   */
  function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const partes = String(fechaISO).split('-');
    if (partes.length !== 3) return escaparHTML(fechaISO);
    const [a, m, d] = partes;
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const indiceMes = Number(m) - 1;
    if (Number.isNaN(Number(d)) || !meses[indiceMes]) return escaparHTML(fechaISO);
    return `${Number(d)} ${meses[indiceMes]}. ${a}`;
  }

  global.utilidades = { escaparHTML, formatearFecha };
})(window);
