// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN POR LOCAL (prospecto)
// Lo único que cambia al preparar la demo de un cliente nuevo vive ACÁ.
//
// Preparar un prospecto nuevo =
//   1. node scripts/cargar-catalogo.mjs <rubro> <csv-del-cliente>
//   2. Tocar este archivo (rubro + nombre del local + usuario)
// Nada más. No hay datos del cliente hardcodeados en los componentes.
// ─────────────────────────────────────────────────────────────

export const configLocal = {
  /**
   * Rubro / inventario que se muestra. Elige cuál de los catálogos de
   * lib/catalogos/ se usa. Valores hoy: "drugstore" | "panaderia" | "verduleria".
   * (Para sumar otro rubro, ver lib/catalogo-data.ts.)
   */
  rubro: "drugstore",

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
