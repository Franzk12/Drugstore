// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN POR LOCAL (prospecto)
// Lo único que cambia al preparar la demo de un cliente nuevo vive ACÁ.
//
// Preparar un prospecto nuevo =
//   1. Correr el script del CSV para regenerar lib/catalogo-data.ts
//   2. Tocar este archivo (nombre del local + usuario)
// Nada más. No hay datos del cliente hardcodeados en los componentes.
// ─────────────────────────────────────────────────────────────

export const configLocal = {
  /** Nombre del comercio, tal como lo ve el cliente en el encabezado. */
  nombreLocal: "Drugstore San Cayetano",

  /**
   * Usuario logueado en la demo: el dueño o quien atiende el mostrador.
   * Su nombre aparece en el sidebar, como cajero en el header y en el arqueo.
   */
  usuario: {
    nombre: "Franco",
    rol: "Vendedor",
  },
} as const

/** Inicial para el avatar del usuario (derivada del nombre). */
export const inicialUsuario = configLocal.usuario.nombre.charAt(0).toUpperCase()
