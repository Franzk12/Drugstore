"use client"

import { useMemo, useState } from "react"
import {
  Pencil,
  Percent,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { categorias, formatARS, formatKg } from "@/lib/catalogo-data"
import { useSession } from "@/lib/session-store"
import { cn } from "@/lib/utils"
import { BulkPriceModal } from "@/components/pos/bulk-price-modal"

export function ProductsScreen() {
  const { catalogo } = useSession()
  const [busqueda, setBusqueda] = useState("")
  const [categoria, setCategoria] = useState("todas")
  // Arranca CERRADO: en la demo primero se muestra la tabla y se pregunta
  // "¿cuánto tardás en actualizar precios?", y recién ahí se abre el modal.
  const [modalAbierto, setModalAbierto] = useState(false)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return catalogo.filter((p) => {
      const coincideTexto =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.ean.includes(q) ||
        p.codigoInterno.toLowerCase().includes(q)
      const coincideCategoria =
        categoria === "todas" || p.categoria === categoria
      return coincideTexto && coincideCategoria
    })
  }, [busqueda, categoria, catalogo])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header de pantalla */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold text-foreground">Productos</h1>
            <span className="text-sm text-muted-foreground">
              {filtrados.length === catalogo.length
                ? `${catalogo.length} productos`
                : `${filtrados.length} de ${catalogo.length} productos`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Nuevo producto
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Upload className="size-4" />
              Importar CSV
            </button>
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Percent className="size-4" />
              Actualización masiva de precios
            </button>
          </div>
        </div>

        {/* Buscador + filtro */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscá por nombre, código o EAN..."
              aria-label="Buscar producto"
              className="h-11 w-full rounded-lg border border-input bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            aria-label="Filtrar por categoría"
            className="h-11 shrink-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">EAN</th>
                <th className="px-4 py-3">Cód. interno</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Precio costo</th>
                <th className="px-4 py-3 text-right">Precio venta</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const stockBajo = p.stock < p.stockMinimo
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-secondary/40"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {p.nombre}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                      {p.ean}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {p.codigoInterno}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.categoria}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                      {p.unidadVenta === "kg"
                        ? `${formatARS(p.precioCosto)}/kg`
                        : formatARS(p.precioCosto)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-foreground">
                      {p.unidadVenta === "kg"
                        ? `${formatARS(p.precioVenta)}/kg`
                        : formatARS(p.precioVenta)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {stockBajo && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                            Stock bajo
                          </span>
                        )}
                        <span
                          className={cn(
                            "font-mono tabular-nums",
                            stockBajo
                              ? "font-semibold text-destructive"
                              : "text-foreground",
                          )}
                        >
                          {p.unidadVenta === "kg" ? formatKg(p.stock) : p.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Editar ${p.nombre}`}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Eliminar ${p.nombre}`}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No se encontraron productos con ese criterio.
            </div>
          )}
        </div>
      </div>

      {modalAbierto && (
        <BulkPriceModal onClose={() => setModalAbierto(false)} />
      )}
    </div>
  )
}
