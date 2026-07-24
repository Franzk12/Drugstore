// ─────────────────────────────────────────────────────────────
// API ÚNICA DEL CATÁLOGO
// Toda la app consume el catálogo desde acá. El rubro activo se elige en
// lib/config-local.ts (campo `rubro`). En cualquier momento hay UN solo
// catálogo activo — no hay listas de productos separadas dando vueltas.
//
// Los catálogos por rubro (lib/catalogos/<rubro>.ts) los genera el script
// scripts/cargar-catalogo.mjs a partir de un CSV. Para agregar un rubro nuevo:
//   1. scripts/catalogos-seed/<rubro>.csv
//   2. node scripts/cargar-catalogo.mjs <rubro>
//   3. sumarlo al objeto `rubros` de abajo
// ─────────────────────────────────────────────────────────────

import { configLocal } from "@/lib/config-local"
import type { ProductoCatalogo } from "@/lib/catalogos/tipos"
import * as drugstore from "@/lib/catalogos/drugstore"
import * as panaderia from "@/lib/catalogos/panaderia"

export type { ProductoCatalogo }

const rubros = {
  drugstore,
  panaderia,
} as const

export type Rubro = keyof typeof rubros

const activo = rubros[configLocal.rubro as Rubro] ?? rubros.drugstore

export const catalogo: ProductoCatalogo[] = activo.catalogo
export const categorias: string[] = activo.categorias
export const proveedores: string[] = activo.proveedores

// ─────────────────────────────────────────────────────────────
// Vista del catálogo que consume el POS (Vender). Se DERIVA de `catalogo`,
// así no puede pasar que un producto exista en Productos y no en Vender.
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
