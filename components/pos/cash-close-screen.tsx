"use client"

import { useState } from "react"
import { Banknote, Clock, CreditCard, Landmark, Receipt } from "lucide-react"
import { formatARS } from "@/lib/catalogo-data"
import { useSession } from "@/lib/session-store"
import { cn } from "@/lib/utils"
import { configLocal } from "@/lib/config-local"

const MEDIOS = [
  { id: "efectivo", medio: "Efectivo", icon: Banknote },
  { id: "debito", medio: "Débito", icon: CreditCard },
  { id: "credito", medio: "Crédito", icon: CreditCard },
  { id: "transferencia", medio: "Transferencia", icon: Landmark },
] as const

export function CashCloseScreen() {
  const { ventas, montoApertura, cerrarCaja } = useSession()
  // Resultado del cierre (null = caja abierta). Guarda la diferencia del momento
  // del cierre, porque al cerrar se limpian las ventas de la sesión.
  const [cierre, setCierre] = useState<{ diferencia: number; label: string } | null>(
    null,
  )

  // Todo el arqueo sale de las ventas cobradas en esta sesión (arranca en cero).
  const APERTURA = montoApertura
  const VENTAS_SESION = ventas.length
  const desglose = MEDIOS.map((m) => ({
    ...m,
    monto: ventas
      .filter((v) => v.medioPago === m.id)
      .reduce((acc, v) => acc + v.total, 0),
  }))
  const TOTAL_VENDIDO = ventas.reduce((acc, v) => acc + v.total, 0)
  const VENTAS_EFECTIVO = ventas
    .filter((v) => v.medioPago === "efectivo")
    .reduce((acc, v) => acc + v.total, 0)
  const ESPERADO = APERTURA + VENTAS_EFECTIVO

  // El efectivo contado arranca igual al esperado (diferencia $0); el cajero
  // lo edita al hacer el arqueo real.
  const [contadoStr, setContadoStr] = useState(() => String(ESPERADO))

  const contado = Number.parseFloat(contadoStr)
  const tieneValor = contadoStr !== "" && !Number.isNaN(contado)
  const diferencia = tieneValor ? contado - ESPERADO : 0

  const estado =
    !tieneValor || diferencia === 0
      ? "correcta"
      : diferencia < 0
        ? "faltante"
        : "sobrante"

  const estadoInfo = {
    correcta: {
      label: "Caja correcta",
      text: "text-success",
      bg: "bg-success/10",
      border: "border-success/30",
    },
    faltante: {
      label: "Faltante",
      text: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
    },
    sobrante: {
      label: "Sobrante",
      text: "text-amber-600",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
  }[estado]

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Cierre de caja
        </h2>

        {/* Tarjeta de sesión */}
        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent">
              <Clock className="size-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Caja abierta desde las 08:00
              </p>
              <p className="text-xs text-muted-foreground">
                por {configLocal.usuario.nombre}
              </p>
            </div>
          </div>
          <div className="sm:ml-auto">
            <p className="text-xs text-muted-foreground">Monto de apertura</p>
            <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {formatARS(APERTURA)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ventas en esta caja</p>
            <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {VENTAS_SESION}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* Desglose por medio de pago */}
          <section className="lg:col-span-2">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Receipt className="size-4 text-muted-foreground" />
              Ventas por medio de pago
            </h3>
            <div className="rounded-xl border border-border bg-card">
              <ul className="divide-y divide-border">
                {desglose.map((d) => (
                  <li
                    key={d.medio}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <d.icon className="size-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{d.medio}</span>
                    <span className="ml-auto font-mono text-sm font-medium tabular-nums text-foreground">
                      {formatARS(d.monto)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-3.5">
                <span className="text-sm font-semibold text-foreground">
                  Total vendido
                </span>
                <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {formatARS(TOTAL_VENDIDO)}
                </span>
              </div>
            </div>
          </section>

          {/* Arqueo de efectivo (foco) */}
          <section className="lg:col-span-3">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Banknote className="size-4 text-primary" />
              Arqueo de efectivo
            </h3>
            <div className="rounded-xl border-2 border-primary/20 bg-card p-5 shadow-sm">
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                Solo se cuenta el efectivo, que es lo único físico en el cajón.
                Débito, crédito y transferencia son electrónicos y no se
                arquean.
              </p>

              <dl className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">Monto de apertura</dt>
                  <dd className="font-mono tabular-nums text-foreground">
                    {formatARS(APERTURA)}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">
                    + Ventas en efectivo
                  </dt>
                  <dd className="font-mono tabular-nums text-foreground">
                    {formatARS(VENTAS_EFECTIVO)}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-accent px-3 py-2.5">
                  <dt className="text-sm font-semibold text-accent-foreground">
                    = Efectivo esperado en caja
                  </dt>
                  <dd className="font-mono text-lg font-bold tabular-nums text-accent-foreground">
                    {formatARS(ESPERADO)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <label
                  htmlFor="contado"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Efectivo contado
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xl font-semibold text-muted-foreground">
                    $
                  </span>
                  <input
                    id="contado"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={contadoStr}
                    onChange={(e) => setContadoStr(e.target.value)}
                    className={cn(
                      "h-14 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-right font-mono text-2xl font-bold tabular-nums text-foreground outline-none transition-colors",
                      "focus:border-ring focus:ring-2 focus:ring-ring/30",
                    )}
                  />
                </div>
              </div>

              <div
                className={cn(
                  "mt-4 flex items-center justify-between rounded-xl border p-4",
                  estadoInfo.border,
                  estadoInfo.bg,
                )}
              >
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Diferencia
                  </p>
                  <p className={cn("text-sm font-semibold", estadoInfo.text)}>
                    {estadoInfo.label}
                  </p>
                </div>
                <p
                  className={cn(
                    "font-mono text-3xl font-bold tabular-nums",
                    estadoInfo.text,
                  )}
                >
                  {diferencia > 0 ? "+" : ""}
                  {formatARS(tieneValor ? diferencia : 0)}
                </p>
              </div>

              {cierre ? (
                <div className="mt-5 rounded-xl border border-success/30 bg-success/10 p-4 text-center">
                  <p className="text-sm font-semibold text-success">
                    Caja cerrada
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Diferencia final: {cierre.diferencia > 0 ? "+" : ""}
                    {formatARS(cierre.diferencia)} · {cierre.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCierre(null)
                      setContadoStr(String(montoApertura))
                    }}
                    className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Abrir nueva caja
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCierre({ diferencia, label: estadoInfo.label })
                    cerrarCaja()
                  }}
                  className={cn(
                    "mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-bold transition-colors",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  Cerrar caja
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
