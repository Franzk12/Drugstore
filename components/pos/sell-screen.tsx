"use client"

import { useMemo, useRef, useState } from "react"
import { Plus, Search } from "lucide-react"
import { formatARS, type MedioPago, type Producto } from "@/lib/catalogo-data"
import { useSession } from "@/lib/session-store"
import { CartList, type LineaCarrito } from "@/components/pos/cart-list"
import { CheckoutPanel } from "@/components/pos/checkout-panel"

// Cantidades del carrito de ejemplo, para que la pantalla no arranque vacía.
const cantidadesEjemplo = [2, 1, 3, 1, 1]

export function SellScreen() {
  const { productos, registrarVenta } = useSession()
  // Carrito de ejemplo: los primeros productos del catálogo del rubro activo.
  // Al derivarlo del catálogo, funciona igual para drugstore, panadería, etc.
  const [lineas, setLineas] = useState<LineaCarrito[]>(() =>
    productos.slice(0, 5).map((p, i) => ({ ...p, cantidad: cantidadesEjemplo[i] ?? 1 })),
  )
  const [busqueda, setBusqueda] = useState("")
  const [medioPago, setMedioPago] = useState<MedioPago>("efectivo")
  const inputRef = useRef<HTMLInputElement>(null)

  const sugerencias = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return []
    return productos
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.codigo.includes(q) ||
          p.codigoInterno.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [busqueda, productos])

  const total = useMemo(
    () => lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0),
    [lineas],
  )
  const cantidadItems = useMemo(
    () => lineas.reduce((acc, l) => acc + l.cantidad, 0),
    [lineas],
  )

  function agregar(producto: Producto) {
    setLineas((prev) => {
      const existe = prev.find((l) => l.id === producto.id)
      if (existe) {
        return prev.map((l) =>
          l.id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l,
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
    setBusqueda("")
    inputRef.current?.focus()
  }

  function cambiarCantidad(id: string, delta: number) {
    setLineas((prev) =>
      prev
        .map((l) =>
          l.id === id ? { ...l, cantidad: l.cantidad + delta } : l,
        )
        .filter((l) => l.cantidad > 0),
    )
  }

  function quitar(id: string) {
    setLineas((prev) => prev.filter((l) => l.id !== id))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sugerencias.length > 0) agregar(sugerencias[0])
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Zona izquierda: búsqueda + carrito */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <form onSubmit={onSubmit} className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            autoFocus
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escaneá el código de barras o buscá un producto..."
            aria-label="Buscar o escanear producto"
            className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
          />

          {sugerencias.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              {sugerencias.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => agregar(p)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Plus className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-popover-foreground">
                        {p.nombre}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.categoria} · {p.codigo}
                      </span>
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-popover-foreground">
                      {formatARS(p.precio)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="mt-4 flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <CartList
            lineas={lineas}
            onCantidad={cambiarCantidad}
            onQuitar={quitar}
          />
        </div>
      </div>

      {/* Zona derecha: cobro */}
      {/* El panel de cobro se muestra desde 768px: si se sube el zoom del
          navegador (típico al mostrarle la pantalla a alguien), no desaparece. */}
      <div className="hidden w-80 shrink-0 md:block xl:w-96">
        <CheckoutPanel
          total={total}
          cantidadItems={cantidadItems}
          medioPago={medioPago}
          onMedioPago={setMedioPago}
          onCobrar={() => {
            registrarVenta({ total, medioPago, cantidadItems })
            setLineas([])
            inputRef.current?.focus()
          }}
          onCancelar={() => {
            setLineas([])
            inputRef.current?.focus()
          }}
        />
      </div>
    </div>
  )
}
