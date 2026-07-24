// ─────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD DEL CATÁLOGO
// Para cargar el catálogo de un prospecto, se toca SOLO este array.
// El POS deriva sus productos de acá (ver `productos` más abajo).
// ─────────────────────────────────────────────────────────────

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

export const categorias = [
  "Bebidas",
  "Cigarrillos",
  "Limpieza",
  "Perfumería",
  "Snacks",
  "Almacén",
] as const

export const proveedores = [
  "Distribuidora Norte",
  "Coca-Cola FEMSA",
  "Massalin Particulares",
  "Mayorista Sur",
] as const

export const catalogo: ProductoCatalogo[] = [
  {
    id: "coca-225",
    nombre: "Coca-Cola 2.25L",
    ean: "7790895000123",
    codigoInterno: "BEB-001",
    categoria: "Bebidas",
    proveedor: "Coca-Cola FEMSA",
    precioCosto: 2950,
    precioVenta: 4200,
    stock: 48,
    stockMinimo: 12,
  },
  {
    id: "marlboro-box",
    nombre: "Marlboro Box 20",
    ean: "7790010000456",
    codigoInterno: "CIG-014",
    categoria: "Cigarrillos",
    proveedor: "Massalin Particulares",
    precioCosto: 3100,
    precioVenta: 3800,
    stock: 6,
    stockMinimo: 10,
  },
  {
    id: "fernet-750",
    nombre: "Fernet Branca 750ml",
    ean: "7790110000789",
    codigoInterno: "BEB-022",
    categoria: "Bebidas",
    proveedor: "Distribuidora Norte",
    precioCosto: 10800,
    precioVenta: 14500,
    stock: 21,
    stockMinimo: 6,
  },
  {
    id: "quilmes-1l",
    nombre: "Cerveza Quilmes 1L",
    ean: "7792798000234",
    codigoInterno: "BEB-035",
    categoria: "Bebidas",
    proveedor: "Distribuidora Norte",
    precioCosto: 1950,
    precioVenta: 2900,
    stock: 4,
    stockMinimo: 12,
  },
  {
    id: "lays-145",
    nombre: "Papas Lays clásicas 145g",
    ean: "7790310000567",
    codigoInterno: "SNK-007",
    categoria: "Snacks",
    proveedor: "Mayorista Sur",
    precioCosto: 2050,
    precioVenta: 3100,
    stock: 33,
    stockMinimo: 10,
  },
  {
    id: "alcohol-gel-250",
    nombre: "Alcohol en gel 250ml",
    ean: "7790123000890",
    codigoInterno: "PER-003",
    categoria: "Perfumería",
    proveedor: "Mayorista Sur",
    precioCosto: 1500,
    precioVenta: 2400,
    stock: 27,
    stockMinimo: 8,
  },
  {
    id: "lavandina-1l",
    nombre: "Lavandina Ayudín 1L",
    ean: "7791234000901",
    codigoInterno: "LIM-011",
    categoria: "Limpieza",
    proveedor: "Mayorista Sur",
    precioCosto: 1250,
    precioVenta: 1950,
    stock: 40,
    stockMinimo: 10,
  },
  {
    id: "sedal-340",
    nombre: "Shampoo Sedal 340ml",
    ean: "7790789000678",
    codigoInterno: "PER-018",
    categoria: "Perfumería",
    proveedor: "Distribuidora Norte",
    precioCosto: 3900,
    precioVenta: 5600,
    stock: 15,
    stockMinimo: 6,
  },
  {
    id: "yerba-taragui-1k",
    nombre: "Yerba Taragüí 1kg",
    ean: "7792345000112",
    codigoInterno: "ALM-002",
    categoria: "Almacén",
    proveedor: "Mayorista Sur",
    precioCosto: 3400,
    precioVenta: 4900,
    stock: 52,
    stockMinimo: 15,
  },
  {
    id: "agua-villa-2l",
    nombre: "Agua Villa del Sur 2L",
    ean: "7790456000345",
    codigoInterno: "BEB-041",
    categoria: "Bebidas",
    proveedor: "Coca-Cola FEMSA",
    precioCosto: 1150,
    precioVenta: 1800,
    stock: 9,
    stockMinimo: 12,
  },
]

// ─────────────────────────────────────────────────────────────
// Vista del catálogo que consume el POS.
// Se DERIVA de `catalogo` — no se mantiene una lista aparte, así
// no puede pasar que un producto exista en Productos y no en Vender.
// ─────────────────────────────────────────────────────────────

export type Producto = {
  id: string
  nombre: string
  precio: number
  categoria: string
  codigo: string
  codigoInterno: string
}

export const productos: Producto[] = catalogo.map((p) => ({
  id: p.id,
  nombre: p.nombre,
  precio: p.precioVenta,
  categoria: p.categoria,
  codigo: p.ean,
  codigoInterno: p.codigoInterno,
}))

/** Busca un producto del POS por id. Útil para armar carritos de ejemplo. */
export function productoPorId(id: string): Producto {
  const p = productos.find((x) => x.id === id)
  if (!p) throw new Error(`Producto no encontrado: ${id}`)
  return p
}

export type MedioPago = "efectivo" | "debito" | "credito" | "transferencia"

export function formatARS(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}
