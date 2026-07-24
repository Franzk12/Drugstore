"use client"

// ─────────────────────────────────────────────────────────────
// ESTADO DE SESIÓN (en memoria, sin backend)
// Sostiene el catálogo mutable para que la demo se sienta viva: la
// actualización masiva de precios cambia los precios de verdad, y el cambio
// se ve tanto en Productos como en Vender. Se resetea al refrescar la página
// (es una demo, no persiste — a propósito).
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  catalogo as catalogoInicial,
  type MedioPago,
  type Producto,
} from "@/lib/catalogo-data"
import type { ProductoCatalogo } from "@/lib/catalogos/tipos"

/** Monto con el que se abre la caja al arrancar la jornada (demo). */
export const MONTO_APERTURA = 10000

export type AjusteMasivo = {
  alcance: "todos" | "categoria" | "proveedor"
  categoria: string
  proveedor: string
  operacion: "aumentar" | "disminuir"
  base: "venta" | "costo"
  porcentaje: number
}

export type Venta = {
  id: string
  total: number
  medioPago: MedioPago
  cantidadItems: number
  fecha: Date
}

type SessionCtx = {
  /** Catálogo completo y mutable de la sesión. */
  catalogo: ProductoCatalogo[]
  /** Vista del catálogo que consume el POS (derivada). */
  productos: Producto[]
  /** Aplica un ajuste porcentual y devuelve cuántos productos cambió. */
  aplicarAjusteMasivo: (a: AjusteMasivo) => number
  /** Ventas hechas en esta sesión (arrancan en cero). */
  ventas: Venta[]
  /** Registra una venta cobrada. */
  registrarVenta: (v: Omit<Venta, "id" | "fecha">) => void
  /** Monto de apertura de la caja. */
  montoApertura: number
}

const Ctx = createContext<SessionCtx | null>(null)

function enAlcance(p: ProductoCatalogo, a: AjusteMasivo): boolean {
  if (a.alcance === "todos") return true
  if (a.alcance === "categoria") return p.categoria === a.categoria
  return p.proveedor === a.proveedor
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [catalogo, setCatalogo] = useState<ProductoCatalogo[]>(catalogoInicial)

  const productos = useMemo<Producto[]>(
    () =>
      catalogo.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precioVenta,
        categoria: p.categoria,
        codigo: p.ean,
        codigoInterno: p.codigoInterno,
      })),
    [catalogo],
  )

  const aplicarAjusteMasivo = useCallback(
    (a: AjusteMasivo) => {
      const factor =
        a.operacion === "aumentar" ? 1 + a.porcentaje / 100 : 1 - a.porcentaje / 100
      setCatalogo((prev) =>
        prev.map((p) =>
          !enAlcance(p, a)
            ? p
            : a.base === "venta"
              ? { ...p, precioVenta: Math.round(p.precioVenta * factor) }
              : { ...p, precioCosto: Math.round(p.precioCosto * factor) },
        ),
      )
      return catalogo.filter((p) => enAlcance(p, a)).length
    },
    [catalogo],
  )

  const [ventas, setVentas] = useState<Venta[]>([])

  const registrarVenta = useCallback((v: Omit<Venta, "id" | "fecha">) => {
    setVentas((prev) => [
      ...prev,
      { ...v, id: crypto.randomUUID(), fecha: new Date() },
    ])
  }, [])

  const value = useMemo(
    () => ({
      catalogo,
      productos,
      aplicarAjusteMasivo,
      ventas,
      registrarVenta,
      montoApertura: MONTO_APERTURA,
    }),
    [catalogo, productos, aplicarAjusteMasivo, ventas, registrarVenta],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>")
  return ctx
}
