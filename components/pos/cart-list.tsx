"use client"

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { formatARS, type Producto } from "@/lib/catalogo-data"
import { cn } from "@/lib/utils"

export type LineaCarrito = Producto & { cantidad: number }

export function CartList({
  lineas,
  onCantidad,
  onQuitar,
}: {
  lineas: LineaCarrito[]
  onCantidad: (id: string, delta: number) => void
  onQuitar: (id: string) => void
}) {
  if (lineas.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">El carrito está vacío</p>
          <p className="mt-1 text-sm text-muted-foreground text-balance">
            Escaneá un código de barras o buscá un producto para arrancar la
            venta.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>Producto</span>
        <span className="w-32 text-center">Cantidad</span>
        <span className="w-28 text-right">Precio unit.</span>
        <span className="w-28 text-right">Subtotal</span>
        <span className="w-9" />
      </div>

      <ul className="flex-1 divide-y divide-border overflow-y-auto">
        {lineas.map((linea) => (
          <li
            key={linea.id}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {linea.nombre}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {linea.categoria} · {linea.codigo}
              </p>
            </div>

            <div className="flex w-32 items-center justify-center gap-1">
              <QtyButton
                aria-label={`Restar una unidad de ${linea.nombre}`}
                onClick={() => onCantidad(linea.id, -1)}
              >
                <Minus className="size-4" />
              </QtyButton>
              <span className="w-8 text-center font-mono text-sm font-semibold tabular-nums text-foreground">
                {linea.cantidad}
              </span>
              <QtyButton
                aria-label={`Sumar una unidad de ${linea.nombre}`}
                onClick={() => onCantidad(linea.id, 1)}
              >
                <Plus className="size-4" />
              </QtyButton>
            </div>

            <span className="w-28 text-right font-mono text-sm tabular-nums text-muted-foreground">
              {formatARS(linea.precio)}
            </span>
            <span className="w-28 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
              {formatARS(linea.precio * linea.cantidad)}
            </span>

            <button
              type="button"
              aria-label={`Quitar ${linea.nombre}`}
              onClick={() => onQuitar(linea.id)}
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function QtyButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
