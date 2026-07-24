"use client"

import { useMemo, useState } from "react"
import { Minus, Plus, X } from "lucide-react"
import { categorias, formatARS, proveedores } from "@/lib/catalogo-data"
import { useSession } from "@/lib/session-store"
import { cn } from "@/lib/utils"

type Alcance = "todos" | "categoria" | "proveedor"
type Operacion = "aumentar" | "disminuir"
type Base = "venta" | "costo"

export function BulkPriceModal({ onClose }: { onClose: () => void }) {
  const { catalogo, aplicarAjusteMasivo } = useSession()
  const [alcance, setAlcance] = useState<Alcance>("todos")
  const [categoria, setCategoria] = useState<string>(categorias[0])
  const [proveedor, setProveedor] = useState<string>(proveedores[0])
  const [operacion, setOperacion] = useState<Operacion>("aumentar")
  const [porcentaje, setPorcentaje] = useState("8")
  const [base, setBase] = useState<Base>("venta")

  const afectados = useMemo(() => {
    if (alcance === "todos") return catalogo
    if (alcance === "categoria")
      return catalogo.filter((p) => p.categoria === categoria)
    return catalogo.filter((p) => p.proveedor === proveedor)
  }, [alcance, categoria, proveedor, catalogo])

  function aplicar() {
    aplicarAjusteMasivo({ alcance, categoria, proveedor, operacion, base, porcentaje: pct })
    onClose()
  }

  const pct = Number.parseFloat(porcentaje) || 0
  const factor = operacion === "aumentar" ? 1 + pct / 100 : 1 - pct / 100

  const ejemplo = afectados[0]
  const precioBaseEjemplo = ejemplo
    ? base === "venta"
      ? ejemplo.precioVenta
      : ejemplo.precioCosto
    : 0
  const precioNuevoEjemplo = Math.round(precioBaseEjemplo * factor)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="bulk-title" className="text-lg font-semibold text-foreground">
            Actualización masiva de precios
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Alcance */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Aplicar a
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["todos", "Todos los productos"],
                  ["categoria", "Por categoría"],
                  ["proveedor", "Por proveedor"],
                ] as [Alcance, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAlcance(value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors",
                    alcance === value
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {alcance === "categoria" && (
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="mt-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {alcance === "proveedor" && (
              <select
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="mt-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                {proveedores.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
          </fieldset>

          {/* Operación */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Operación
            </legend>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-border p-1">
                <button
                  type="button"
                  onClick={() => setOperacion("aumentar")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    operacion === "aumentar"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Plus className="size-4" />
                  Aumentar
                </button>
                <button
                  type="button"
                  onClick={() => setOperacion("disminuir")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    operacion === "disminuir"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Minus className="size-4" />
                  Disminuir
                </button>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  aria-label="Porcentaje"
                  className="h-11 w-28 rounded-lg border border-input bg-background pl-3 pr-8 text-right font-mono text-base font-semibold tabular-nums text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            <div className="mt-3 flex rounded-lg border border-border p-1">
              <button
                type="button"
                onClick={() => setBase("venta")}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  base === "venta"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Precio de venta
              </button>
              <button
                type="button"
                onClick={() => setBase("costo")}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  base === "costo"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Precio de costo
              </button>
            </div>
          </fieldset>

          {/* Preview */}
          <div className="rounded-xl border border-border bg-secondary/50 p-4">
            <p className="text-sm font-medium text-foreground">
              Se van a actualizar{" "}
              <span className="font-semibold text-primary">
                {afectados.length}
              </span>{" "}
              {afectados.length === 1 ? "producto" : "productos"}
            </p>
            {ejemplo && (
              <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
                {ejemplo.nombre}: {formatARS(precioBaseEjemplo)}{" "}
                <span className="text-foreground">→</span>{" "}
                <span
                  className={cn(
                    "font-semibold",
                    operacion === "aumentar"
                      ? "text-foreground"
                      : "text-foreground",
                  )}
                >
                  {formatARS(precioNuevoEjemplo)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aplicar}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Aplicar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
