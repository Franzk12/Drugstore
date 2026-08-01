// Tipo compartido por todos los catálogos de rubro (drugstore, panadería, ...).
// Los archivos lib/catalogos/<rubro>.ts los genera scripts/cargar-catalogo.mjs.

export type ProductoCatalogo = {
  id: string
  nombre: string
  ean: string
  codigoInterno: string
  categoria: string
  proveedor: string
  /** Forma de venta: por unidad o por kilo. Para "kg", precio/stock son por kg. */
  unidadVenta: "unidad" | "kg"
  precioCosto: number
  precioVenta: number
  stock: number
  stockMinimo: number
}
