/**
 * datos-demo.js
 * ------------------------------------------------------------------
 * Fuente única de datos ficticios para el prototipo del Portal de
 * Consultoría. Nada de este archivo debe leerse directamente desde
 * las pantallas: siempre se accede a través de js/servicios.js.
 *
 * // TODO-SUPABASE: en la segunda etapa, cada bloque de este archivo
 * // se reemplaza por una tabla de Supabase (ver comentarios puntuales
 * // dentro de cada sección y el resumen final en README.md).
 * ------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  // ==================================================================
  // USUARIO EN SESIÓN (se define en login.js y se guarda en sessionStorage)
  // ==================================================================
  const USUARIOS_DEMO = {
    cliente: {
      id: 'usr-cli-001',
      nombre: 'Marcela Duarte',
      cargo: 'Gerente General',
      empresaId: 'emp-001',
      correo: 'marcela.duarte@empresademo.com',
      telefono: '+595 981 000 111',
      rol: 'cliente',
      preferenciasNotificacion: {
        correo: true,
        avisosPlataforma: true,
        resumenSemanal: false,
      },
    },
    consultor: {
      id: 'usr-con-001',
      nombre: 'Rodrigo Insfrán',
      cargo: 'Consultor Senior',
      correo: 'rodrigo.insfran@consultora.com',
      telefono: '+595 981 222 333',
      rol: 'administracion',
    },
  };

  // ==================================================================
  // EMPRESA Y PROYECTO PRINCIPAL (vista cliente)
  // // TODO-SUPABASE: tabla `empresas` y tabla `proyectos`
  // ==================================================================
  const EMPRESA_ACTUAL = {
    id: 'emp-001',
    nombre: 'Empresa Demo S.A.',
    rubro: 'Manufactura e industria liviana',
    pais: 'Paraguay',
    usuariosAsociados: 4,
  };

  const PROYECTO_ACTUAL = {
    id: 'proy-001',
    empresaId: 'emp-001',
    nombre: 'Diagnóstico Organizacional 2026',
    periodoAnalizado: 'Enero 2026 – Marzo 2026',
    fechaPublicacion: '2026-04-15',
    consultorResponsableId: 'usr-con-001',
    estado: 'Publicado',
    puntuacionGeneral: 72,
    estadoGeneral: 'En desarrollo con oportunidades claras',
    resumenEjecutivo:
      'Empresa Demo S.A. muestra una base operativa sólida y un equipo comprometido, ' +
      'pero enfrenta cuellos de botella en la coordinación entre áreas y una definición ' +
      'de estrategia poco comunicada hacia niveles medios. Los indicadores de Personas y ' +
      'Procesos son los más fuertes; Tecnología y Estrategia requieren atención prioritaria ' +
      'en los próximos dos trimestres para sostener el crecimiento proyectado.',
  };

  // ==================================================================
  // ÁREAS (5) — con puntuación, meta, interpretación e indicadores
  // // TODO-SUPABASE: tabla `areas` (relacionada a `proyectos` por proyectoId)
  // ==================================================================
  const AREAS = [
    {
      id: 'area-personas',
      proyectoId: 'proy-001',
      nombre: 'Personas',
      puntuacion: 81,
      meta: 75,
      estado: 'positivo',
      interpretacion:
        'El clima laboral y la retención de talento están por encima del promedio del sector. ' +
        'El principal riesgo es la falta de planes de sucesión formales en cargos clave.',
      fortalezas: 2,
      oportunidades: 1,
    },
    {
      id: 'area-liderazgo',
      proyectoId: 'proy-001',
      nombre: 'Liderazgo',
      puntuacion: 64,
      meta: 75,
      estado: 'alerta',
      interpretacion:
        'Existen líderes con buena llegada operativa, pero la comunicación de la visión ' +
        'estratégica hacia mandos medios es inconsistente entre departamentos.',
      fortalezas: 1,
      oportunidades: 2,
    },
    {
      id: 'area-procesos',
      proyectoId: 'proy-001',
      nombre: 'Procesos',
      puntuacion: 78,
      meta: 70,
      estado: 'positivo',
      interpretacion:
        'Los procesos productivos están documentados y estandarizados. La oportunidad ' +
        'principal está en los procesos administrativos, que aún dependen de tareas manuales.',
      fortalezas: 1,
      oportunidades: 2,
    },
    {
      id: 'area-estrategia',
      proyectoId: 'proy-001',
      nombre: 'Estrategia',
      puntuacion: 58,
      meta: 75,
      estado: 'critico',
      interpretacion:
        'No existe un tablero de seguimiento de objetivos estratégicos compartido, lo que ' +
        'dificulta priorizar inversiones y medir avances trimestrales.',
      fortalezas: 0,
      oportunidades: 2,
    },
    {
      id: 'area-tecnologia',
      proyectoId: 'proy-001',
      nombre: 'Tecnología',
      puntuacion: 61,
      meta: 72,
      estado: 'alerta',
      interpretacion:
        'La infraestructura de sistemas cubre las operaciones actuales, pero no está ' +
        'preparada para escalar sin una inversión focalizada en integración de datos.',
      fortalezas: 1,
      oportunidades: 1,
    },
  ];

  // ==================================================================
  // INDICADORES (10)
  // // TODO-SUPABASE: tabla `indicadores` (relacionada a `areas` por areaId)
  // ==================================================================
  const INDICADORES = [
    { id: 'ind-001', areaId: 'area-personas', nombre: 'Índice de clima laboral', valor: 84, unidad: '%', meta: 75, tendencia: 'sube' },
    { id: 'ind-002', areaId: 'area-personas', nombre: 'Rotación anual de personal', valor: 8, unidad: '%', meta: 12, tendencia: 'baja', invertido: true },
    { id: 'ind-003', areaId: 'area-liderazgo', nombre: 'Claridad de objetivos por equipo', valor: 62, unidad: '%', meta: 80, tendencia: 'estable' },
    { id: 'ind-004', areaId: 'area-liderazgo', nombre: 'Frecuencia de retroalimentación', valor: 2.1, unidad: 'reuniones/mes', meta: 4, tendencia: 'baja' },
    { id: 'ind-005', areaId: 'area-procesos', nombre: 'Procesos documentados', valor: 88, unidad: '%', meta: 80, tendencia: 'sube' },
    { id: 'ind-006', areaId: 'area-procesos', nombre: 'Tiempo promedio de aprobación administrativa', valor: 6.4, unidad: 'días', meta: 3, tendencia: 'estable', invertido: true },
    { id: 'ind-007', areaId: 'area-estrategia', nombre: 'Objetivos con seguimiento activo', valor: 35, unidad: '%', meta: 90, tendencia: 'baja' },
    { id: 'ind-008', areaId: 'area-estrategia', nombre: 'Reuniones de revisión estratégica trimestral', valor: 1, unidad: 'por trimestre', meta: 4, tendencia: 'estable' },
    { id: 'ind-009', areaId: 'area-tecnologia', nombre: 'Sistemas integrados entre áreas', valor: 3, unidad: 'de 8', meta: 6, tendencia: 'sube' },
    { id: 'ind-010', areaId: 'area-tecnologia', nombre: 'Incidencias críticas de sistemas', valor: 5, unidad: 'por trimestre', meta: 2, tendencia: 'sube', invertido: true },
  ];

  // ==================================================================
  // FORTALEZAS (5)
  // // TODO-SUPABASE: tabla `fortalezas`
  // ==================================================================
  const FORTALEZAS = [
    {
      id: 'for-001',
      proyectoId: 'proy-001',
      areaId: 'area-personas',
      titulo: 'Alto compromiso y sentido de pertenencia del equipo',
      explicacion:
        'El personal muestra un nivel de compromiso notablemente superior al promedio de ' +
        'empresas del mismo tamaño, lo que reduce riesgos de fuga de talento en el corto plazo.',
      evidencia: 'Encuesta de clima 2026: 84% de satisfacción general (n=126 respuestas).',
      impactoPositivo: 'Menor rotación, mayor continuidad en proyectos clave y mejor clima interno.',
      recomendacion: 'Formalizar un programa de reconocimiento para sostener el compromiso a mediano plazo.',
      relevancia: 'alta',
      paginaInforme: 18,
    },
    {
      id: 'for-002',
      proyectoId: 'proy-001',
      areaId: 'area-personas',
      titulo: 'Programas de capacitación técnica bien valorados',
      explicacion:
        'Los colaboradores del área productiva destacan la calidad y frecuencia de las ' +
        'capacitaciones técnicas recibidas durante el último año.',
      evidencia: 'Entrevistas a 14 supervisores de planta y revisión de plan de capacitación 2025.',
      impactoPositivo: 'Mejora sostenida de la calidad operativa y menor curva de aprendizaje.',
      recomendacion: 'Extender el modelo de capacitación técnica a los equipos administrativos.',
      relevancia: 'media',
      paginaInforme: 21,
    },
    {
      id: 'for-003',
      proyectoId: 'proy-001',
      areaId: 'area-liderazgo',
      titulo: 'Liderazgo operativo cercano y accesible',
      explicacion:
        'Los mandos medios mantienen una relación directa y de confianza con sus equipos, ' +
        'lo que facilita la resolución ágil de problemas del día a día.',
      evidencia: 'Observación en planta y entrevistas cruzadas con 9 colaboradores de distintas áreas.',
      impactoPositivo: 'Mayor velocidad de respuesta ante imprevistos operativos.',
      recomendacion: 'Complementar esta cercanía con herramientas formales de seguimiento de objetivos.',
      relevancia: 'media',
      paginaInforme: 27,
    },
    {
      id: 'for-004',
      proyectoId: 'proy-001',
      areaId: 'area-procesos',
      titulo: 'Estandarización sólida de procesos productivos',
      explicacion:
        'Los procesos core de producción están documentados, con manuales actualizados y ' +
        'controles de calidad claramente definidos en cada etapa.',
      evidencia: 'Revisión de 22 procedimientos operativos estándar (POE) vigentes.',
      impactoPositivo: 'Consistencia en la calidad del producto final y facilidad para entrenar personal nuevo.',
      recomendacion: 'Aprovechar esta base para digitalizar el control de indicadores de planta.',
      relevancia: 'alta',
      paginaInforme: 34,
    },
    {
      id: 'for-005',
      proyectoId: 'proy-001',
      areaId: 'area-tecnologia',
      titulo: 'Infraestructura de planta estable y bien mantenida',
      explicacion:
        'Los sistemas de control de producción presentan baja tasa de fallas y un historial ' +
        'de mantenimiento preventivo bien documentado.',
      evidencia: 'Registro de mantenimiento 2025 y entrevista con jefatura de sistemas.',
      impactoPositivo: 'Continuidad operativa y bajo riesgo de interrupciones no planificadas en planta.',
      recomendacion: 'Usar esta estabilidad como base para futuras integraciones tecnológicas.',
      relevancia: 'media',
      paginaInforme: 41,
    },
  ];

  // ==================================================================
  // OPORTUNIDADES DE MEJORA (8)
  // // TODO-SUPABASE: tabla `oportunidades`
  // ==================================================================
  const OPORTUNIDADES = [
    {
      id: 'opo-001',
      proyectoId: 'proy-001',
      areaId: 'area-estrategia',
      titulo: 'Falta de tablero de seguimiento estratégico',
      situacionEncontrada:
        'No existe un mecanismo formal ni compartido para revisar el avance de los objetivos ' +
        'estratégicos anuales entre las distintas gerencias.',
      evidencia: 'Solo 1 de 4 reuniones trimestrales de revisión estratégica se realizó en 2025.',
      riesgo: 'Decisiones de inversión desalineadas con la estrategia y pérdida de foco organizacional.',
      recomendacion: 'Implementar un tablero de indicadores estratégicos con revisión trimestral obligatoria.',
      prioridad: 'accion-inmediata',
      impacto: 'alto',
      urgencia: 'alta',
      dificultad: 'media',
      plazoRecomendado: '0 a 3 meses',
      resolucionInterna: false,
      servicioRelacionadoId: 'srv-planificacion',
      paginaInforme: 52,
    },
    {
      id: 'opo-002',
      proyectoId: 'proy-001',
      areaId: 'area-liderazgo',
      titulo: 'Comunicación inconsistente de objetivos hacia mandos medios',
      situacionEncontrada:
        'Los objetivos definidos por la gerencia general no siempre llegan de forma clara ' +
        'y homogénea a los jefes de área.',
      evidencia: 'Solo el 62% de los líderes intermedios pudo describir correctamente los objetivos del trimestre.',
      riesgo: 'Esfuerzos duplicados o mal priorizados entre departamentos.',
      recomendacion: 'Establecer un ritual mensual de alineación de objetivos entre gerencia y jefaturas.',
      prioridad: 'proyecto-prioritario',
      impacto: 'alto',
      urgencia: 'media',
      dificultad: 'baja',
      plazoRecomendado: '1 a 2 meses',
      resolucionInterna: true,
      servicioRelacionadoId: null,
      paginaInforme: 29,
    },
    {
      id: 'opo-003',
      proyectoId: 'proy-001',
      areaId: 'area-liderazgo',
      titulo: 'Baja frecuencia de retroalimentación individual',
      situacionEncontrada:
        'Los colaboradores reciben, en promedio, menos de tres instancias formales de ' +
        'retroalimentación al año.',
      evidencia: 'Encuesta interna: 2.1 reuniones de feedback por colaborador en 2025.',
      riesgo: 'Desmotivación progresiva y desalineación de expectativas de desempeño.',
      recomendacion: 'Implementar un modelo simple de conversaciones de desempeño trimestrales.',
      prioridad: 'mejora-rapida',
      impacto: 'medio',
      urgencia: 'media',
      dificultad: 'baja',
      plazoRecomendado: '1 mes',
      resolucionInterna: true,
      servicioRelacionadoId: 'srv-liderazgo',
      paginaInforme: 31,
    },
    {
      id: 'opo-004',
      proyectoId: 'proy-001',
      areaId: 'area-procesos',
      titulo: 'Procesos administrativos dependientes de tareas manuales',
      situacionEncontrada:
        'Las aprobaciones administrativas (compras, viáticos, contrataciones menores) se ' +
        'gestionan mayormente por correo electrónico sin trazabilidad centralizada.',
      evidencia: 'Tiempo promedio de aprobación de 6.4 días frente a una meta interna de 3 días.',
      riesgo: 'Cuellos de botella operativos y pérdida de trazabilidad en decisiones administrativas.',
      recomendacion: 'Digitalizar el flujo de aprobaciones administrativas con un sistema simple de workflow.',
      prioridad: 'proyecto-prioritario',
      impacto: 'medio',
      urgencia: 'media',
      dificultad: 'media',
      plazoRecomendado: '2 a 4 meses',
      resolucionInterna: false,
      servicioRelacionadoId: 'srv-procesos',
      paginaInforme: 38,
    },
    {
      id: 'opo-005',
      proyectoId: 'proy-001',
      areaId: 'area-tecnologia',
      titulo: 'Baja integración entre sistemas de distintas áreas',
      situacionEncontrada:
        'Solo 3 de 8 sistemas utilizados por la empresa están integrados entre sí, generando ' +
        'carga manual de datos duplicados.',
      evidencia: 'Mapeo de sistemas realizado junto a la jefatura de tecnología.',
      riesgo: 'Errores de consistencia de datos y pérdida de horas-persona en tareas repetitivas.',
      recomendacion: 'Priorizar la integración de los sistemas de ventas, inventario y finanzas.',
      prioridad: 'proyecto-prioritario',
      impacto: 'alto',
      urgencia: 'media',
      dificultad: 'alta',
      plazoRecomendado: '4 a 6 meses',
      resolucionInterna: false,
      servicioRelacionadoId: 'srv-transformacion-digital',
      paginaInforme: 45,
    },
    {
      id: 'opo-006',
      proyectoId: 'proy-001',
      areaId: 'area-tecnologia',
      titulo: 'Incremento de incidencias críticas de sistemas',
      situacionEncontrada:
        'Las incidencias críticas de sistemas aumentaron de 2 a 5 por trimestre en el último año.',
      evidencia: 'Bitácora de incidencias de la jefatura de sistemas, periodo 2025-2026.',
      riesgo: 'Interrupciones operativas que afectan directamente la producción y el servicio al cliente.',
      recomendacion: 'Realizar una auditoría técnica de infraestructura y definir un plan de mantenimiento preventivo.',
      prioridad: 'accion-inmediata',
      impacto: 'alto',
      urgencia: 'alta',
      dificultad: 'media',
      plazoRecomendado: '0 a 2 meses',
      resolucionInterna: false,
      servicioRelacionadoId: 'srv-transformacion-digital',
      paginaInforme: 47,
    },
    {
      id: 'opo-007',
      proyectoId: 'proy-001',
      areaId: 'area-personas',
      titulo: 'Ausencia de planes de sucesión en cargos clave',
      situacionEncontrada:
        'No existen planes formales de sucesión para los cargos de jefatura y gerencia.',
      evidencia: 'Revisión de organigrama y entrevistas con recursos humanos.',
      riesgo: 'Vulnerabilidad operativa ante la salida imprevista de personal clave.',
      recomendacion: 'Diseñar un mapa de sucesión para los 8 cargos críticos identificados.',
      prioridad: 'mejora-futura',
      impacto: 'medio',
      urgencia: 'baja',
      dificultad: 'media',
      plazoRecomendado: '6 a 12 meses',
      resolucionInterna: false,
      servicioRelacionadoId: 'srv-liderazgo',
      paginaInforme: 20,
    },
    {
      id: 'opo-008',
      proyectoId: 'proy-001',
      areaId: 'area-estrategia',
      titulo: 'Cultura organizacional no explícitamente definida',
      situacionEncontrada:
        'La empresa no cuenta con una declaración formal de valores y cultura que guíe las ' +
        'decisiones cotidianas de los equipos.',
      evidencia: 'Entrevistas cruzadas: solo el 40% del personal identifica valores compartidos claros.',
      riesgo: 'Inconsistencia en la toma de decisiones y dificultad para alinear nuevas contrataciones.',
      recomendacion: 'Facilitar un proceso participativo para definir y comunicar la cultura deseada.',
      prioridad: 'mejora-futura',
      impacto: 'medio',
      urgencia: 'baja',
      dificultad: 'media',
      plazoRecomendado: '6 a 9 meses',
      resolucionInterna: false,
      servicioRelacionadoId: 'srv-transformacion-cultural',
      paginaInforme: 55,
    },
  ];

  // ==================================================================
  // PLAN DE ACCIÓN (8 acciones)
  // // TODO-SUPABASE: tabla `acciones`
  // ==================================================================
  const ACCIONES = [
    {
      id: 'acc-001',
      proyectoId: 'proy-001',
      oportunidadId: 'opo-001',
      nombre: 'Diseñar e implementar tablero de seguimiento estratégico',
      areaId: 'area-estrategia',
      responsable: 'Gerencia General',
      fechaInicio: '2026-05-01',
      fechaLimite: '2026-07-15',
      estado: 'en-proceso',
      avance: 35,
      prioridad: 'alta',
      indicadorExito: '100% de objetivos estratégicos con seguimiento trimestral activo',
      requiereAcompanamiento: true,
      comentarios: 'Se definió la estructura del tablero; falta capacitar a las jefaturas en su uso.',
    },
    {
      id: 'acc-002',
      proyectoId: 'proy-001',
      oportunidadId: 'opo-002',
      nombre: 'Establecer ritual mensual de alineación de objetivos',
      areaId: 'area-liderazgo',
      responsable: 'Gerencia General',
      fechaInicio: '2026-05-01',
      fechaLimite: '2026-05-31',
      estado: 'completada',
      avance: 100,
      prioridad: 'alta',
      indicadorExito: 'Reunión mensual realizada con acta y compromisos documentados',
      requiereAcompanamiento: false,
      comentarios: 'Implementado desde mayo; buena adopción por parte de las jefaturas.',
    },
    {
      id: 'acc-003',
      proyectoId: 'proy-001',
      oportunidadId: 'opo-003',
      nombre: 'Implementar conversaciones de desempeño trimestrales',
      areaId: 'area-liderazgo',
      responsable: 'Recursos Humanos',
      fechaInicio: '2026-06-01',
      fechaLimite: '2026-08-30',
      estado: 'en-proceso',
      avance: 20,
      prioridad: 'media',
      indicadorExito: 'Al menos 90% de colaboradores con conversación de desempeño registrada',
      requiereAcompanamiento: true,
      comentarios: 'Se diseñó la plantilla de conversación; pendiente capacitar a jefaturas.',
    },
    {
      id: 'acc-004',
      proyectoId: 'proy-001',
      oportunidadId: 'opo-004',
      nombre: 'Digitalizar flujo de aprobaciones administrativas',
      areaId: 'area-procesos',
      responsable: 'Administración y Finanzas',
      fechaInicio: '2026-06-15',
      fechaLimite: '2026-10-15',
      estado: 'no-iniciada',
      avance: 0,
      prioridad: 'media',
      indicadorExito: 'Tiempo promedio de aprobación reducido a 3 días o menos',
      requiereAcompanamiento: true,
      comentarios: 'Pendiente de definir presupuesto para herramienta de workflow.',
    },
    {
      id: 'acc-005',
      proyectoId: 'proy-001',
      oportunidadId: 'opo-005',
      nombre: 'Integrar sistemas de ventas, inventario y finanzas',
      areaId: 'area-tecnologia',
      responsable: 'Jefatura de Tecnología',
      fechaInicio: '2026-07-01',
      fechaLimite: '2026-12-15',
      estado: 'no-iniciada',
      avance: 0,
      prioridad: 'alta',
      indicadorExito: '6 de 8 sistemas integrados sin carga manual duplicada',
      requiereAcompanamiento: true,
      comentarios: 'Se está a la espera de la propuesta de acompañamiento de Consultoría.',
    },
    {
      id: 'acc-006',
      proyectoId: 'proy-001',
      oportunidadId: 'opo-006',
      nombre: 'Auditar infraestructura tecnológica crítica',
      areaId: 'area-tecnologia',
      responsable: 'Jefatura de Tecnología',
      fechaInicio: '2026-05-15',
      fechaLimite: '2026-06-30',
      estado: 'bloqueada',
      avance: 40,
      prioridad: 'alta',
      indicadorExito: 'Informe de auditoría con plan de mantenimiento preventivo aprobado',
      requiereAcompanamiento: true,
      comentarios: 'Bloqueada por disponibilidad del proveedor externo de auditoría.',
    },
    {
      id: 'acc-007',
      proyectoId: 'proy-001',
      oportunidadId: 'opo-007',
      nombre: 'Diseñar mapa de sucesión para cargos críticos',
      areaId: 'area-personas',
      responsable: 'Recursos Humanos',
      fechaInicio: '2026-08-01',
      fechaLimite: '2027-02-01',
      estado: 'no-iniciada',
      avance: 0,
      prioridad: 'media',
      indicadorExito: '8 cargos críticos con al menos un sucesor identificado',
      requiereAcompanamiento: false,
      comentarios: 'Se realizará con recursos internos de Recursos Humanos.',
    },
    {
      id: 'acc-008',
      proyectoId: 'proy-001',
      oportunidadId: 'opo-008',
      nombre: 'Definir y comunicar cultura organizacional',
      areaId: 'area-estrategia',
      responsable: 'Gerencia General',
      fechaInicio: '2026-09-01',
      fechaLimite: '2027-01-31',
      estado: 'no-iniciada',
      avance: 0,
      prioridad: 'baja',
      indicadorExito: 'Documento de cultura difundido y validado por al menos 80% del personal',
      requiereAcompanamiento: true,
      comentarios: 'Se evaluará junto con Consultoría un proceso participativo de talleres.',
    },
  ];

  // ==================================================================
  // DOCUMENTOS (5)
  // // TODO-SUPABASE: tabla `documentos` + almacenamiento de archivos (Supabase Storage)
  // ==================================================================
  const DOCUMENTOS = [
    {
      id: 'doc-001',
      proyectoId: 'proy-001',
      nombre: 'Informe final de diagnóstico organizacional',
      tipo: 'Informe completo',
      fecha: '2026-04-15',
      version: '1.2',
      estado: 'Publicado',
      tamano: '8.4 MB',
      paginas: 96,
    },
    {
      id: 'doc-002',
      proyectoId: 'proy-001',
      nombre: 'Resumen ejecutivo del diagnóstico',
      tipo: 'Resumen ejecutivo',
      fecha: '2026-04-15',
      version: '1.0',
      estado: 'Publicado',
      tamano: '1.1 MB',
      paginas: 8,
    },
    {
      id: 'doc-003',
      proyectoId: 'proy-001',
      nombre: 'Anexos metodológicos y encuestas',
      tipo: 'Anexo',
      fecha: '2026-04-10',
      version: '1.0',
      estado: 'Publicado',
      tamano: '4.7 MB',
      paginas: 34,
    },
    {
      id: 'doc-004',
      proyectoId: 'proy-001',
      nombre: 'Presentación de resultados al directorio',
      tipo: 'Presentación',
      fecha: '2026-04-18',
      version: '1.1',
      estado: 'Publicado',
      tamano: '3.2 MB',
      paginas: 28,
    },
    {
      id: 'doc-005',
      proyectoId: 'proy-001',
      nombre: 'Plan de acción detallado 2026',
      tipo: 'Plan de acción',
      fecha: '2026-04-20',
      version: '1.0',
      estado: 'En revisión',
      tamano: '0.9 MB',
      paginas: 12,
    },
  ];

  // ==================================================================
  // CATÁLOGO DE SERVICIOS (6)
  // // TODO-SUPABASE: tabla `servicios`
  // ==================================================================
  const SERVICIOS = [
    {
      id: 'srv-liderazgo',
      nombre: 'Desarrollo de liderazgo',
      descripcion:
        'Programa de fortalecimiento de habilidades de liderazgo para jefaturas y mandos medios.',
      problemasQueResuelve: [
        'Baja frecuencia de retroalimentación',
        'Comunicación inconsistente de objetivos',
        'Falta de planes de sucesión',
      ],
      areaRelacionadaId: 'area-liderazgo',
      duracionEstimada: '3 meses',
      modalidad: 'Presencial y virtual',
      activo: true,
    },
    {
      id: 'srv-procesos',
      nombre: 'Optimización de procesos',
      descripcion:
        'Rediseño y digitalización de procesos administrativos y operativos clave.',
      problemasQueResuelve: [
        'Procesos manuales lentos',
        'Falta de trazabilidad en aprobaciones',
        'Cuellos de botella operativos',
      ],
      areaRelacionadaId: 'area-procesos',
      duracionEstimada: '4 meses',
      modalidad: 'Híbrida',
      activo: true,
    },
    {
      id: 'srv-gestion-cambio',
      nombre: 'Gestión del cambio',
      descripcion:
        'Acompañamiento para asegurar la adopción efectiva de nuevas iniciativas organizacionales.',
      problemasQueResuelve: [
        'Resistencia a nuevas herramientas',
        'Baja adopción de procesos nuevos',
        'Falta de comunicación durante transiciones',
      ],
      areaRelacionadaId: 'area-liderazgo',
      duracionEstimada: '2 a 6 meses',
      modalidad: 'Híbrida',
      activo: true,
    },
    {
      id: 'srv-transformacion-cultural',
      nombre: 'Transformación cultural',
      descripcion:
        'Definición participativa de valores y cultura organizacional, con plan de comunicación interna.',
      problemasQueResuelve: [
        'Cultura organizacional no definida',
        'Baja alineación de valores entre equipos',
      ],
      areaRelacionadaId: 'area-estrategia',
      duracionEstimada: '5 meses',
      modalidad: 'Presencial',
      activo: true,
    },
    {
      id: 'srv-planificacion',
      nombre: 'Planificación estratégica',
      descripcion:
        'Diseño de objetivos estratégicos y tableros de seguimiento con metodología de revisión trimestral.',
      problemasQueResuelve: [
        'Falta de tablero de seguimiento estratégico',
        'Baja frecuencia de revisión de objetivos',
      ],
      areaRelacionadaId: 'area-estrategia',
      duracionEstimada: '3 meses',
      modalidad: 'Presencial y virtual',
      activo: true,
    },
    {
      id: 'srv-transformacion-digital',
      nombre: 'Transformación digital',
      descripcion:
        'Integración de sistemas y modernización de infraestructura tecnológica clave para la operación.',
      problemasQueResuelve: [
        'Baja integración entre sistemas',
        'Incidencias críticas recurrentes',
      ],
      areaRelacionadaId: 'area-tecnologia',
      duracionEstimada: '6 meses',
      modalidad: 'Híbrida',
      activo: true,
    },
  ];

  // ==================================================================
  // SOLICITUDES DE ACOMPAÑAMIENTO (3 iniciales de demostración)
  // Estas conviven con las solicitudes nuevas creadas por el usuario
  // en localStorage (ver servicios.js -> crearSolicitudServicio).
  // // TODO-SUPABASE: tabla `solicitudes`
  // ==================================================================
  const SOLICITUDES_INICIALES = [
    {
      id: 'sol-001',
      proyectoId: 'proy-001',
      empresaId: 'emp-001',
      fecha: '2026-04-22',
      contacto: 'Marcela Duarte',
      correo: 'marcela.duarte@empresademo.com',
      telefono: '+595 981 000 111',
      oportunidadId: 'opo-001',
      servicioId: 'srv-planificacion',
      comentario: 'Nos gustaría avanzar cuanto antes con el tablero estratégico.',
      medioPreferido: 'Correo electrónico',
      horarioPreferido: 'Mañana',
      estado: 'reunion-programada',
      responsableInterno: 'Rodrigo Insfrán',
      proximoSeguimiento: '2026-05-05',
      historial: [
        { fecha: '2026-04-22', estado: 'nueva', nota: 'Solicitud recibida desde el portal del cliente.' },
        { fecha: '2026-04-24', estado: 'en-revision', nota: 'Asignada a Rodrigo Insfrán para evaluación.' },
        { fecha: '2026-04-28', estado: 'cliente-contactado', nota: 'Se coordinó llamada inicial con la cliente.' },
        { fecha: '2026-05-02', estado: 'reunion-programada', nota: 'Reunión de alcance agendada para el 5 de mayo.' },
      ],
    },
    {
      id: 'sol-002',
      proyectoId: 'proy-001',
      empresaId: 'emp-001',
      fecha: '2026-04-25',
      contacto: 'Marcela Duarte',
      correo: 'marcela.duarte@empresademo.com',
      telefono: '+595 981 000 111',
      oportunidadId: 'opo-005',
      servicioId: 'srv-transformacion-digital',
      comentario: 'Queremos entender el alcance y costo estimado antes de definir fecha.',
      medioPreferido: 'Videollamada',
      horarioPreferido: 'Tarde',
      estado: 'propuesta-enviada',
      responsableInterno: 'Rodrigo Insfrán',
      proximoSeguimiento: '2026-05-10',
      historial: [
        { fecha: '2026-04-25', estado: 'nueva', nota: 'Solicitud recibida desde el portal del cliente.' },
        { fecha: '2026-04-27', estado: 'en-revision', nota: 'Revisión de alcance con equipo de tecnología.' },
        { fecha: '2026-05-01', estado: 'cliente-contactado', nota: 'Videollamada de exploración realizada.' },
        { fecha: '2026-05-06', estado: 'propuesta-enviada', nota: 'Propuesta técnica y comercial enviada por correo.' },
      ],
    },
    {
      id: 'sol-003',
      proyectoId: 'proy-001',
      empresaId: 'emp-001',
      fecha: '2026-04-29',
      contacto: 'Marcela Duarte',
      correo: 'marcela.duarte@empresademo.com',
      telefono: '',
      oportunidadId: 'opo-006',
      servicioId: 'srv-transformacion-digital',
      comentario: 'Es urgente por el aumento de incidencias en el último mes.',
      medioPreferido: 'Teléfono',
      horarioPreferido: 'Cualquier horario',
      estado: 'nueva',
      responsableInterno: 'Sin asignar',
      proximoSeguimiento: '2026-05-03',
      historial: [
        { fecha: '2026-04-29', estado: 'nueva', nota: 'Solicitud recibida desde el portal del cliente.' },
      ],
    },
  ];

  // ==================================================================
  // ASISTENTE DE IA — CONVERSACIÓN Y RESPUESTAS PREDEFINIDAS
  // // TODO-SUPABASE: en la etapa con IA real, esto se reemplaza por
  // // llamadas a un servicio de IA con contexto del informe (RAG).
  // ==================================================================
  const MENSAJE_INICIAL_IA =
    'Hola, Marcela. Soy el asistente de demostración del informe de Diagnóstico ' +
    'Organizacional 2026 de Empresa Demo S.A. Podés elegir una pregunta sugerida o ' +
    'escribir la tuya. Por ahora solo respondo un conjunto de preguntas de ejemplo.';

  const PREGUNTAS_SUGERIDAS = [
    '¿Cuáles son nuestros tres problemas más urgentes?',
    '¿Qué dice el informe sobre liderazgo?',
    '¿Cuáles son nuestras principales fortalezas?',
    '¿Qué acciones podemos realizar internamente?',
    '¿En qué áreas necesitamos acompañamiento?',
  ];

  const RESPUESTAS_IA_DEMO = {
    '¿Cuáles son nuestros tres problemas más urgentes?': {
      respuesta:
        'Según el informe, las tres oportunidades de mayor urgencia son: la falta de un ' +
        'tablero de seguimiento estratégico, el aumento de incidencias críticas de sistemas, ' +
        'y la comunicación inconsistente de objetivos hacia los mandos medios.',
      fuente: 'Sección de Oportunidades de mejora',
      pagina: 52,
      hallazgoRelacionadoId: 'opo-001',
    },
    '¿Qué dice el informe sobre liderazgo?': {
      respuesta:
        'El área de Liderazgo obtuvo 64 puntos sobre una meta de 75. El informe destaca un ' +
        'liderazgo operativo cercano y accesible, pero señala inconsistencias en la ' +
        'comunicación de objetivos y una baja frecuencia de retroalimentación individual.',
      fuente: 'Sección de Resultados por área — Liderazgo',
      pagina: 27,
      hallazgoRelacionadoId: 'area-liderazgo',
    },
    '¿Cuáles son nuestras principales fortalezas?': {
      respuesta:
        'Las fortalezas más relevantes identificadas son el alto compromiso del equipo, la ' +
        'buena valoración de las capacitaciones técnicas y la estandarización sólida de los ' +
        'procesos productivos.',
      fuente: 'Sección de Fortalezas',
      pagina: 18,
      hallazgoRelacionadoId: 'for-001',
    },
    '¿Qué acciones podemos realizar internamente?': {
      respuesta:
        'Pueden resolverse con recursos internos: el ritual mensual de alineación de ' +
        'objetivos, las conversaciones de desempeño trimestrales y el diseño del mapa de ' +
        'sucesión para cargos críticos.',
      fuente: 'Sección de Oportunidades de mejora',
      pagina: 31,
      hallazgoRelacionadoId: 'opo-002',
    },
    '¿En qué áreas necesitamos acompañamiento?': {
      respuesta:
        'El informe recomienda acompañamiento externo en Estrategia (planificación y ' +
        'tablero de seguimiento) y en Tecnología (integración de sistemas y auditoría de ' +
        'infraestructura), por su complejidad técnica y el impacto en la operación.',
      fuente: 'Sección de Recomendaciones',
      pagina: 47,
      hallazgoRelacionadoId: 'opo-005',
    },
  };

  const RESPUESTA_IA_NO_DISPONIBLE = {
    respuesta:
      'Todavía no tengo una respuesta preparada para esa pregunta en esta demostración. ' +
      'En la versión con IA real, el asistente podrá analizar el informe completo y responder ' +
      'preguntas abiertas con contexto específico.',
    fuente: null,
    pagina: null,
    hallazgoRelacionadoId: null,
    noDisponible: true,
  };

  // ==================================================================
  // DATOS ADICIONALES PARA EL PANEL DE CONSULTORÍA (empresas, proyectos,
  // usuarios internos) — se agregan un par de registros extra para que
  // las tablas administrativas no luzcan vacías.
  // // TODO-SUPABASE: mismas tablas `empresas` / `proyectos` / `usuarios`
  // ==================================================================
  const EMPRESAS_ADMIN = [
    { id: 'emp-001', nombre: 'Empresa Demo S.A.', proyectoActivoId: 'proy-001', usuarios: 4 },
    { id: 'emp-002', nombre: 'Comercial Itapúa Ltda.', proyectoActivoId: 'proy-002', usuarios: 2 },
    { id: 'emp-003', nombre: 'Grupo Logístico del Este', proyectoActivoId: 'proy-003', usuarios: 3 },
  ];

  const PROYECTOS_ADMIN = [
    {
      id: 'proy-001', empresaId: 'emp-001', nombre: 'Diagnóstico Organizacional 2026',
      consultorResponsable: 'Rodrigo Insfrán', estado: 'Publicado',
      fechaActualizacion: '2026-04-20', usuarios: 4,
    },
    {
      id: 'proy-002', empresaId: 'emp-002', nombre: 'Diagnóstico Comercial 2026',
      consultorResponsable: 'Lourdes Cáceres', estado: 'En revisión',
      fechaActualizacion: '2026-04-18', usuarios: 2,
    },
    {
      id: 'proy-003', empresaId: 'emp-003', nombre: 'Diagnóstico de Operaciones Logísticas',
      consultorResponsable: 'Rodrigo Insfrán', estado: 'Información en carga',
      fechaActualizacion: '2026-04-10', usuarios: 3,
    },
  ];

  const USUARIOS_INTERNOS_ADMIN = [
    { id: 'usr-con-001', nombre: 'Rodrigo Insfrán', cargo: 'Consultor Senior', correo: 'rodrigo.insfran@consultora.com', proyectosAsignados: 2, activo: true },
    { id: 'usr-con-002', nombre: 'Lourdes Cáceres', cargo: 'Consultora de Estrategia', correo: 'lourdes.caceres@consultora.com', proyectosAsignados: 1, activo: true },
    { id: 'usr-con-003', nombre: 'Diego Almada', cargo: 'Analista de Datos', correo: 'diego.almada@consultora.com', proyectosAsignados: 1, activo: true },
    { id: 'usr-con-004', nombre: 'Sofía Benítez', cargo: 'Consultora Junior', correo: 'sofia.benitez@consultora.com', proyectosAsignados: 0, activo: false },
  ];

  // ==================================================================
  // EXPORTACIÓN — todo cuelga de global.DATOS_DEMO para poder
  // consumirse desde servicios.js sin usar módulos ES (por compatibilidad
  // al abrir los archivos directamente con file://)
  // ==================================================================
  global.DATOS_DEMO = {
    USUARIOS_DEMO,
    EMPRESA_ACTUAL,
    PROYECTO_ACTUAL,
    AREAS,
    INDICADORES,
    FORTALEZAS,
    OPORTUNIDADES,
    ACCIONES,
    DOCUMENTOS,
    SERVICIOS,
    SOLICITUDES_INICIALES,
    MENSAJE_INICIAL_IA,
    PREGUNTAS_SUGERIDAS,
    RESPUESTAS_IA_DEMO,
    RESPUESTA_IA_NO_DISPONIBLE,
    EMPRESAS_ADMIN,
    PROYECTOS_ADMIN,
    USUARIOS_INTERNOS_ADMIN,
  };
})(window);
