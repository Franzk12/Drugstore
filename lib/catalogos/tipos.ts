// Tipo compartido por todos los catálogos de rubro (drugstore, panadería, ...).
// Los archivos lib/catalogos/<rubro>.ts los genera scripts/cargar-catalogo.mjs.

export type ProductoCatalogo = {
  id: string
  nombre: string
  ean: string
  codigoInterno: string
  categoria: string
  proveedor: string
  precioCosto: number
  precioVenta: number
  stock: number
  stockMinimo: number
}
