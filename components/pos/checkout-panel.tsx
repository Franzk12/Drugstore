"use client"

import { useEffect, useState } from "react"
import { Banknote, Check, CreditCard, Landmark, X } from "lucide-react"
import { formatARS, type MedioPago } from "@/lib/catalogo-data"
import { cn } from "@/lib/utils"

const medios: { id: MedioPago; label: string; icon: React.ElementType }[] = [
  { id: "efectivo", label: "Efectivo", icon: Banknote },
  { id: "debito", label: "Débito", icon: CreditCard },
  { id: "credito", label: "Crédito", icon: CreditCard },
  { id: "transferencia", label: "Transferencia", icon: Landmark },
]

export function CheckoutPanel({
  total,
  cantidadItems,
  medioPago,
  onMedioPago,
  onCobrar,
  onCancelar,
}: {
  total: number
  cantidadItems: number
  medioPago: MedioPago
  onMedioPago: (medio: MedioPago) => void
  onCobrar: () => void
  onCancelar: () => void
}) {
  const vacio = cantidadItems === 0
  const [pagaCon, setPagaCon] = useState("")

  // Al cobrar / cancelar, el carrito queda vacío: se limpia también el monto
  // pagado para no arrastrar el vuelto de la venta anterior.
  useEffect(() => {
    if (vacio) setPagaCon("")
  }, [vacio])

  const montoPagado = Number.parseFloat(pagaCon)
  const tienePago = pagaCon !== "" && !Number.isNaN(montoPagado)
  const vuelto = tienePago ? montoPagado - total : 0
  const alcanza = vuelto >= 0
  const esEfectivo = medioPago === "efectivo"

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cobro
        </h2>
      </div>

      {/* Total */}
      <div className="px-6 py-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total a cobrar</span>
          <span className="text-sm text-muted-foreground">
            {cantidadItems} {cantidadItems === 1 ? "ítem" : "ítems"}
          </span>
        </div>
        <p className="mt-1 font-mono text-5xl font-bold tracking-tight tabular-nums text-foreground">
          {formatARS(total)}
        </p>
      </div>

      {/* Medios de pago */}
      <div className="px-6">
        <p className="mb-2 text-sm font-medium text-foreground">Medio de pago</p>
        <div className="grid grid-cols-2 gap-2">
          {medios.map((medio) => {
            const activo = medio.id === medioPago
            return (
              <button
                key={medio.id}
                type="button"
                aria-pressed={activo}
                onClick={() => onMedioPago(medio.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                  activo
                    ? "border-primary bg-accent text-accent-foreground ring-1 ring-primary"
                    : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent/50",
                )}
              >
                <medio.icon className="size-4 shrink-0" />
                {medio.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Calculadora de vuelto (solo efectivo) */}
      {esEfectivo && (
        <div className="mt-4 px-6">
          <label
            htmlFor="paga-con"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            ¿Con cuánto paga?
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xl font-semibold text-muted-foreground">
              $
            </span>
            <input
              id="paga-con"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="0"
              value={pagaCon}
              onChange={(e) => setPagaCon(e.target.value)}
              disabled={vacio}
              className={cn(
                "h-14 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-right font-mono text-2xl font-bold tabular-nums text-foreground outline-none transition-colors",
                "focus:border-ring focus:ring-2 focus:ring-ring/30",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            />
          </div>

          <div
            className={cn(
              "mt-4 rounded-xl border p-4",
              !tienePago
                ? "border-border bg-muted/50"
                : alcanza
                  ? "border-success/30 bg-success/10"
                  : "border-destructive/30 bg-destructive/10",
            )}
          >
            <p className="text-sm font-medium text-muted-foreground">
              {tienePago && !alcanza ? "Falta" : "Vuelto"}
            </p>
            <p
              className={cn(
                "mt-1 font-mono text-4xl font-bold tabular-nums",
                !tienePago
                  ? "text-muted-foreground"
                  : alcanza
                    ? "text-success"
                    : "text-destructive",
              )}
            >
              {tienePago ? formatARS(Math.abs(vuelto)) : formatARS(0)}
            </p>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-auto space-y-3 p-6">
        <button
          type="button"
          disabled={vacio}
          onClick={onCobrar}
          className={cn(
            "flex h-20 w-full items-center justify-center gap-2.5 rounded-xl text-2xl font-extrabold tracking-tight shadow-lg shadow-success/25 transition-all",
            "bg-success text-success-foreground hover:brightness-105 active:scale-[0.99]",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
          )}
        >
          <Check className="size-7" strokeWidth={2.5} />
          Cobrar {!vacio && formatARS(total)}
        </button>
        <button
          type="button"
          disabled={vacio}
          onClick={onCancelar}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-muted-foreground transition-colors",
            "hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <X className="size-4" />
          Cancelar venta
        </button>
      </div>
    </div>
  )
}
