# Portal de Consultoría — Prototipo v1.1 (revisión técnica)

Prototipo navegable en **HTML + CSS + JavaScript puro** (sin frameworks ni backend) para presentar
al directorio. Usa datos 100% ficticios. Esta versión incorpora una revisión técnica sobre el
prototipo original: arquitectura de datos más estricta, protección contra inyección de HTML,
identificación más visible del entorno de demostración y un botón de restablecimiento.

## 1. Cómo ejecutarlo

No requiere instalación. Alcanza con abrir `index.html` en el navegador:

- **Opción rápida:** doble clic en `index.html`.
- **Opción recomendada** (evita restricciones del navegador con `file://`):
  ```bash
  cd consultoria-dashboard
  python3 -m http.server 8080
  ```
  y abrir `http://localhost:8080`.
- **Publicación como demo estática:** subir toda la carpeta a Netlify, Vercel, GitHub Pages o
  cualquier hosting estático. No requiere build ni variables de entorno.

  > ⚠️ **Una publicación en GitHub Pages (o cualquier hosting estático) es pública por defecto.**
  > Cualquier persona con el enlace puede ver el código fuente, los datos ficticios y todo lo que
  > un/a usuario/a de la demo escriba (queda en su propio navegador, pero el código y los datos de
  > ejemplo son visibles para cualquiera). Nunca publiques este prototipo con información real.

En la pantalla de acceso, elegí "Vista cliente" o "Vista Consultoría" e ingresá cualquier correo y
contraseña (no se validan, es una demostración).

## 2. Arquitectura de datos: todo pasa por `servicios.js`

Esta es la regla más importante del proyecto y se revisó específicamente en esta versión:

- `datos-demo.js` es la **única fuente de datos ficticios**, pero es un archivo de datos "privado":
  ninguna pantalla debe leerlo directamente.
- `servicios.js` es la **única puerta de entrada** a esos datos. Expone funciones `async` (por
  ejemplo `obtenerAreas()`, `obtenerOportunidades()`, `crearSolicitudServicio()`,
  `restablecerDatosDemo()`) que hoy leen datos locales, pero que en la etapa con Supabase se
  reemplazarán una por una por consultas reales, sin tocar el resto de la aplicación.
- `login.js`, `cliente.js` y `administracion.js` **solo llaman a `window.servicios`**. Cargan lo
  que necesitan en un objeto `CACHE` propio de cada pantalla y trabajan siempre sobre esa copia.
- Se verificó (y se puede volver a verificar) que no exista ningún acceso a `window.DATOS_DEMO`
  fuera de `servicios.js`:
  ```bash
  grep -rn "DATOS_DEMO" js/ | grep -v "js/datos-demo.js:" | grep -v "js/servicios.js:"
  # No debería devolver ningún resultado
  ```

## 3. Protección contra inyección de HTML (XSS)

Todo el texto que puede haber sido escrito por una persona usuaria —nombre de contacto, correo,
teléfono, comentarios de una solicitud, preguntas escritas en el asistente de IA, o el texto que un
consultor escribe en el constructor de contenido— se trata como **no confiable** y se escapa antes
de insertarse en el HTML.

- `js/utilidades.js` define `escaparHTML()`, usada por `login.js`, `cliente.js` y
  `administracion.js` en todos los lugares donde se arma una plantilla con `innerHTML` a partir de
  texto dinámico.
- El asistente de IA de demostración muestra las preguntas escritas por la persona usuaria como
  texto plano, nunca como HTML.
- Los comentarios y datos de contacto guardados en `localStorage` (solicitudes) también se escapan
  al mostrarse, tanto en el portal del cliente como en el panel de Consultoría.

**Prueba realizada:** se probó escribir el siguiente texto como comentario de una solicitud y como
pregunta del asistente de IA:

```
<img src=x onerror=alert('prueba')>
```

En ambos casos el texto se muestra literalmente en pantalla (incluyendo los símbolos `<` y `>`) y
no se ejecuta ningún código ni se genera una imagen rota. Podés repetir esta prueba en cualquier
momento desde el formulario "Quiero acompañamiento" o desde el campo de preguntas del asistente.

> Esto reduce el riesgo dentro del propio prototipo, pero **no es una auditoría de seguridad
> completa** ni reemplaza la validación y el escapado que deberá hacerse también del lado del
> servidor cuando exista un backend real.

## 4. Qué se guarda en `localStorage` (y cómo restablecerlo)

Este prototipo guarda algunos cambios únicamente en el navegador de quien lo usa, bajo estas claves:

| Clave | Contenido |
|---|---|
| `portalConsultoria_solicitudes` | Solicitudes de acompañamiento creadas desde "Quiero acompañamiento". |
| `portalConsultoria_acciones` | Cambios de estado/avance hechos a mano en el Plan de acción. |
| `portalConsultoria_contenidoAdmin` | Borradores y estados guardados desde el constructor de contenido del panel de Consultoría. |
| `portalConsultoria_usuario` (sessionStorage) | Perfil con el que se inició sesión (se borra al cerrar sesión o la pestaña). |

**Para restablecer la demostración:** en el panel de Consultoría, en la parte inferior del menú
lateral, hay un botón **"Restablecer datos de demostración"**. Muestra un modal de confirmación,
explica qué se va a borrar y, al confirmar, elimina las tres primeras claves de la tabla de arriba
y vuelve a dibujar las vistas afectadas. Los datos originales de `datos-demo.js` (empresa, proyecto,
áreas, fortalezas, oportunidades, documentos, servicios) **nunca se modifican**, así que siempre
están disponibles como punto de partida. Esta operación está centralizada en
`servicios.restablecerDatosDemo()`.

## 5. El constructor de contenido sigue siendo una simulación

La sección "Contenido" del panel de Consultoría permite una experiencia coherente pero **no es un
editor de contenido completo**:

- "Guardar borrador" guarda el texto escrito en `localStorage` (clave
  `portalConsultoria_contenidoAdmin`) y muestra el aviso "Cambios de demostración guardados
  localmente".
- "Descartar cambios" elimina ese borrador y vuelve a mostrar el contenido original.
- "Aprobar", "Publicar" y "Ocultar al cliente" solo cambian una etiqueta de estado (también
  guardada en `localStorage`); no activan ni desactivan nada en el portal del cliente todavía.
- "Agregar elemento" y "Editar" muestran un aviso de que es una acción de demostración.
- Ninguna de estas acciones modifica `datos-demo.js`: los cambios viven solo en el navegador y
  desaparecen al usar "Restablecer datos de demostración".
- En `servicios.js`, las funciones `guardarBorradorContenido()`, `descartarBorradorContenido()` y
  `actualizarEstadoContenido()` incluyen comentarios `// TODO-SUPABASE` que indican dónde se
  reemplazará este guardado local por escrituras reales en una tabla `contenido_proyecto`.

## 6. Este prototipo NO ofrece seguridad real

Es importante tenerlo presente antes de compartirlo o publicarlo:

- El acceso (`index.html`) **no valida contraseñas**: cualquier correo y contraseña ingresan a la
  demo. No hay autenticación, ni cifrado, ni control de sesión real.
- Los datos que ingresa cada persona usuaria (contacto, correo, comentarios) quedan **solo en su
  propio navegador** (`localStorage`); no se envían a ningún servidor, correo real ni base de datos.
- No hay control de acceso del lado del servidor: la separación entre "vista cliente" y "vista
  Consultoría" es únicamente de interfaz (basada en el perfil guardado en `sessionStorage`) y no
  debe considerarse una barrera de seguridad.
- **Nunca deben utilizarse en este prototipo**: informes reales de clientes, datos personales
  reales, contraseñas reales, ni ninguna información confidencial de una empresa. Todo el contenido
  debe seguir siendo ficticio, como en `datos-demo.js`.

## 7. Dónde modificar cada cosa

| Qué querés cambiar | Dónde |
|---|---|
| Colores de marca | Variables CSS al inicio de `css/styles.css` (bloque `:root`) |
| Logo | Reemplazar `assets/logo.svg` (mismo nombre de archivo) |
| Empresa, proyecto, resumen ejecutivo | `js/datos-demo.js` → `EMPRESA_ACTUAL` / `PROYECTO_ACTUAL` |
| Áreas e indicadores | `js/datos-demo.js` → `AREAS` / `INDICADORES` |
| Fortalezas y oportunidades | `js/datos-demo.js` → `FORTALEZAS` / `OPORTUNIDADES` |
| Plan de acción | `js/datos-demo.js` → `ACCIONES` |
| Documentos | `js/datos-demo.js` → `DOCUMENTOS` |
| Catálogo de servicios | `js/datos-demo.js` → `SERVICIOS` |
| Respuestas del asistente de IA (demo) | `js/datos-demo.js` → `RESPUESTAS_IA_DEMO` |
| Empresas/proyectos/usuarios del panel interno | `js/datos-demo.js` → `EMPRESAS_ADMIN` / `PROYECTOS_ADMIN` / `USUARIOS_INTERNOS_ADMIN` |
| Texto de la etiqueta "Entorno de demostración" | Buscar `etiqueta-demo-header` en `index.html`, `cliente.html` y `administracion.html` |

No hace falta tocar el HTML ni el resto del JavaScript para cambiar estos datos: toda la aplicación
lee siempre a través de `js/servicios.js` (ver sección 2).

## 8. Estructura de carpetas

```
consultoria-dashboard/
├── index.html            # Pantalla de acceso simulado
├── cliente.html           # Portal del cliente (una sola página, secciones por hash)
├── administracion.html    # Panel interno de Consultoría
├── css/
│   └── styles.css         # Sistema de diseño (colores, tipografía, componentes)
├── js/
│   ├── datos-demo.js       # Única fuente de datos ficticios (privado — no leer directamente)
│   ├── servicios.js         # Única puerta de acceso a los datos y a las acciones de demo
│   ├── utilidades.js        # escaparHTML() y formatearFecha(), compartidas por las 3 pantallas
│   ├── login.js              # Acceso simulado
│   ├── cliente.js            # Lógica del portal del cliente
│   └── administracion.js     # Lógica del panel interno
└── assets/
    └── logo.svg              # Logo provisional
```

## 9. Qué deberá conectarse con Supabase en la segunda etapa

Todo está marcado con comentarios `// TODO-SUPABASE` en `js/datos-demo.js` y `js/servicios.js`.
En resumen:

1. **Autenticación** (`js/login.js`): reemplazar el selector de perfil por
   `supabase.auth.signInWithPassword()` y leer el rol real del usuario desde una tabla `usuarios`.
2. **Tablas a crear en Supabase**, una por cada bloque de `datos-demo.js`: `empresas`, `proyectos`,
   `areas`, `indicadores`, `fortalezas`, `oportunidades`, `acciones`, `documentos`, `servicios`,
   `solicitudes`, `usuarios`, y una nueva tabla `contenido_proyecto` (bloque, proyecto_id, estado,
   valores, actualizado_en) para lo que hoy administra el constructor de contenido.
3. **Cada función de `servicios.js`** reemplaza su `return resuelto(...)` por una consulta
   `await supabaseClient.from('tabla').select(...)`. Ya son `async`, así que el cambio no afecta a
   `cliente.js` ni a `administracion.js`.
4. **`crearSolicitudServicio`, `actualizarAccionDemo`, `guardarBorradorContenido`,
   `descartarBorradorContenido` y `actualizarEstadoContenido`**: pasan de `localStorage` a
   `INSERT` / `UPDATE` reales en Supabase.
5. **Documentos**: además de la tabla `documentos`, se necesitará Supabase Storage para los
   archivos reales (hoy los botones "Ver" y "Descargar" son solo demostrativos).
6. **Asistente de IA**: hoy responde con un diccionario fijo (`RESPUESTAS_IA_DEMO`). En la etapa
   con IA real, `preguntarAsistenteDemo` se reemplaza por una llamada a un servicio de IA con
   recuperación de contexto (RAG) sobre el contenido del informe.

No se incluyeron claves, URLs ni credenciales de Supabase en este prototipo.

## 10. Verificación realizada en esta revisión

- Sintaxis válida (`node --check`) en los 6 archivos `.js` del proyecto.
- Sin accesos a `window.DATOS_DEMO` fuera de `servicios.js` (verificado con `grep`).
- Los dos perfiles (cliente / Consultoría) pueden ingresar; cada pantalla revisa
  `usuario.rol` al cargar y redirige a `index.html` si no corresponde (un perfil cliente no puede
  quedarse en `administracion.html` y viceversa).
- Los gráficos (radar y barras, Chart.js) y los filtros de Resultados, Fortalezas, Oportunidades y
  Plan de acción siguen funcionando igual que antes de la revisión.
- Una solicitud nueva creada desde "Quiero acompañamiento" aparece tanto en "Solicitudes" del
  cliente como en "Solicitudes recibidas" del panel interno (marcada como "Local").
- El botón "Restablecer datos de demostración" elimina las solicitudes y cambios de plan creados
  localmente y los borradores del constructor de contenido, sin alterar `datos-demo.js` (probado
  con un script de verificación automatizado).
- El texto `<img src=x onerror=alert('prueba')>` ingresado como comentario o como pregunta del chat
  se muestra como texto literal y no ejecuta código (probado automatizadamente y disponible para
  repetir manualmente).
- El diseño sigue siendo responsive (menú lateral colapsable, etiqueta de demostración adaptada a
  escritorio y celular).

## 11. Resumen de archivos modificados en esta revisión

- **Nuevo:** `js/utilidades.js` (función `escaparHTML()` y `formatearFecha()` compartidas).
- **Modificado:** `js/servicios.js` (nuevas funciones `obtenerUsuarioDemoPorPerfil`,
  `obtenerEstadoBloqueContenido`, `guardarBorradorContenido`, `descartarBorradorContenido`,
  `actualizarEstadoContenido`, `restablecerDatosDemo`).
- **Modificado:** `js/login.js` (usa `servicios.obtenerUsuarioDemoPorPerfil` en vez de
  `DATOS_DEMO`).
- **Modificado:** `js/cliente.js` (usa `CACHE.indicadores` en vez de `DATOS_DEMO`; usa
  `escaparHTML`/`formatearFecha` de `utilidades.js`; escapa comentario e historial de solicitudes).
- **Modificado:** `js/administracion.js` (constructor de contenido reescrito sobre `CACHE`/
  `servicios.js`, con borradores persistidos y textos escapados; escapa los datos de contacto de
  las solicitudes; agrega el modal y la lógica de "Restablecer datos de demostración").
- **Modificado:** `index.html`, `cliente.html`, `administracion.html` (incluyen `utilidades.js`,
  etiqueta "Entorno de demostración · Datos ficticios"; `administracion.html` agrega además el
  botón y el modal de restablecimiento, y el botón "Descartar cambios" en el constructor de
  contenido).
- **Modificado:** `css/styles.css` (estilos de la etiqueta de demostración).
- **Sin cambios:** `js/datos-demo.js`, `assets/logo.svg` (los datos ficticios originales se
  mantienen intactos, tal como pedía la consigna).
