export const USUARIOS = [
  { id: 1, username: "admin", password: "admin123", nombre: "Administrador", rol: "admin", sector: "Sistema", area: "Sistemas" },
  { id: 2, username: "juan.perez", password: "pass123", nombre: "Juan Pérez", rol: "colaborador", sector: "Línea A", area: "Producción" },
  { id: 3, username: "maria.garcia", password: "pass123", nombre: "María García", rol: "supervisor", sector: "Planta", area: "Producción" },
  { id: 4, username: "pedro.gomez", password: "pass123", nombre: "Pedro Gómez", rol: "mantenimiento", sector: "Taller", area: "Mantenimiento" },
  { id: 5, username: "lucas.mena", password: "pass123", nombre: "Lucas Mena", rol: "mantenimiento", sector: "Eléctrico", area: "Mantenimiento" },
];

export const AREAS = ["Ingeniería", "Sistemas", "Mantenimiento", "Producción", "Calidad", "Logística", "RRHH"];

export const SECTORES = ["Línea A", "Línea B", "Taller", "Administración", "Depósito", "Planta", "Oficinas"];

export const TIPOS = ["Solicitud de trabajo", "Mensaje informativo", "Aviso", "Advertencia", "Urgencia"];

export const PRIORIDADES = ["Alta", "Media", "Baja"];

export const MAQUINAS = {
  "Torno CNC 410": {
    herramientas: ["Llave Allen 8mm", "Destornillador estrella", "Calibre", "Aceite lubricante"],
    manual: "Manual_TornoCNC410.pdf",
    historico: [
      "2024-03-15: Rotura de cabezal — Cambio de rodamiento frontal",
      "2023-11-02: Falla eléctrica — Reemplazo de fusibles",
      "2023-06-20: Calibración general"
    ]
  },
  "Fresadora F200": {
    herramientas: ["Llave torx T30", "Grasa especial", "Manómetro", "Filtro de aceite"],
    manual: "Manual_FresadoraF200.pdf",
    historico: [
      "2024-02-10: Rotura de fresa — Cambio de cabezal",
      "2023-09-14: Ajuste de mesa de trabajo"
    ]
  },
  "Prensa Hidráulica PH1": {
    herramientas: ["Llave inglesa 24mm", "Aceite hidráulico ISO 46", "Kit de sellos"],
    manual: "Manual_PrensaHidraulica.pdf",
    historico: [
      "2024-01-05: Pérdida de presión — Cambio de sellos",
      "2023-07-30: Revisión general anual"
    ]
  },
};

export const ORDENES_INICIALES = [
  { id: 1, fecha: "01/05/2025 09:15", usuario: "Juan Pérez", sector: "Línea A", area: "Producción", destino: ["Mantenimiento"], tipo: "Solicitud de trabajo", descripcion: "Reparar Torno CNC 410, rotura de cabezal delantero. La máquina está fuera de servicio.", prioridad: "Alta", estado: "Pendiente", resolucion: null },
  { id: 2, fecha: "02/05/2025 11:30", usuario: "María García", sector: "Planta", area: "Producción", destino: ["Ingeniería", "Sistemas"], tipo: "Mensaje informativo", descripcion: "Reunión de coordinación mensual el viernes 9 a las 10hs en sala de reuniones.", prioridad: null, estado: "Enviado", resolucion: null },
  { id: 3, fecha: "03/05/2025 14:00", usuario: "Juan Pérez", sector: "Línea A", area: "Producción", destino: ["Mantenimiento"], tipo: "Solicitud de trabajo", descripcion: "Verificar funcionamiento de la Fresadora F200. Presenta ruido inusual al iniciar.", prioridad: "Media", estado: "En curso", resolucion: null },
  { id: 4, fecha: "28/04/2025 08:00", usuario: "María García", sector: "Planta", area: "Producción", destino: ["Mantenimiento"], tipo: "Solicitud de trabajo", descripcion: "Prensa Hidráulica PH1 pierde presión a los 20 minutos de uso.", prioridad: "Alta", estado: "Finalizado", resolucion: { tecnico: "Pedro Gómez", tiempo: "3h 20min", repuesto: "Kit de sellos hidráulicos", herramientas: ["Llave inglesa 24mm", "Aceite hidráulico"], detalle: "Se reemplazaron todos los sellos del cilindro principal. Máquina operativa." } },
];