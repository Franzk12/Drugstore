"use client"

import { useMemo, useRef, useState } from "react"
import { Plus, Search } from "lucide-react"
import { formatARS, type MedioPago, type Producto } from "@/lib/catalogo-data"
import { useSession } from "@/lib/session-store"
import { CartList, type LineaCarrito } from "@/components/pos/cart-list"
import { CheckoutPanel } from "@/components/pos/checkout-panel"

// Cantidades del carrito de ejemplo, para que la pantalla no arranque vacía.
const cantidadesEjemplo = [2, 1, 3, 1, 1]

// Elige N productos de categorías distintas para que el carrito de ejemplo se
// vea variado (y no, p. ej., 5 gaseosas seguidas). Si hay menos categorías que
// N, completa con los siguientes del catálogo.
function muestraVariada(productos: Producto[], n: number): Producto[] {
  const elegidos: Producto[] = []
  const categorias = new Set<string>()
  for (const p of productos) {
    if (!categorias.has(p.categoria)) {
      categorias.add(p.categoria)
      elegidos.push(p)
      if (elegidos.length === n) return elegidos
    }
  }
  for (const p of productos) {
    if (!elegidos.includes(p)) {
      elegidos.push(p)
      if (elegidos.length === n) break
    }
  }
  return elegidos
}

export function SellScreen() {
  const { productos, registrarVenta } = useSession()
  // Carrito de ejemplo variado, del catálogo del rubro activo. Al derivarlo del
  // catálogo, funciona igual para drugstore, panadería, etc.
  const [lineas, setLineas] = useState<LineaCarrito[]>(() =>
    muestraVariada(productos, 5).map((p, i) => ({
      ...p,
      cantidad: cantidadesEjemplo[i] ?? 1,
    })),
  )
  const [busqueda, setBusqueda] = useState("")
  const [medioPago, setMedioPago] = useState<MedioPago>("efectivo")
  const inputRef = useRef<HTMLInputElement>(null)
  // Producto por kg esperando que se ingrese el peso (null = no hay prompt).
  const [pendiente, setPendiente] = useState<Producto | null>(null)
  const [pesoStr, setPesoStr] = useState("")
  const pesoRef = useRef<HTMLInputElement>(null)

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
    () =>
      lineas.reduce(
        (acc, l) => acc + (l.unidadVenta === "unidad" ? l.cantidad : 1),
        0,
      ),
    [lineas],
  )

  function agregar(producto: Producto) {
    if (producto.unidadVenta === "kg") {
      setPendiente(producto)
      setPesoStr("")
      setBusqueda("")
      setTimeout(() => pesoRef.current?.focus(), 0)
      return
    }
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

  const pesoNum = Number.parseFloat(pesoStr.replace(",", "."))
  const pesoValido = pesoStr !== "" && Number.isFinite(pesoNum) && pesoNum > 0

  function confirmarPeso() {
    if (!pendiente || !pesoValido) return
    const prod = pendiente
    setLineas((prev) => {
      const existe = prev.find((l) => l.id === prod.id)
      if (existe) {
        return prev.map((l) =>
          l.id === prod.id ? { ...l, cantidad: l.cantidad + pesoNum } : l,
        )
      }
      return [...prev, { ...prod, cantidad: pesoNum }]
    })
    setPendiente(null)
    setPesoStr("")
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
    // En mobile se apila (carrito arriba, cobro abajo) y la página scrollea;
    // desde 768px vuelve a dos columnas con el panel de cobro fijo a la derecha.
    <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
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
                      {p.unidadVenta === "kg"
                        ? `${formatARS(p.precio)}/kg`
                        : formatARS(p.precio)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {pendiente && (
          <div className="mt-3 rounded-xl border border-primary/40 bg-accent/40 p-4">
            <p className="text-sm font-medium text-foreground">{pendiente.nombre}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  ref={pesoRef}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={pesoStr}
                  onChange={(e) => setPesoStr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmarPeso()
                    if (e.key === "Escape") setPendiente(null)
                  }}
                  placeholder="0,000"
                  aria-label="Peso en kilos"
                  className="h-12 w-32 rounded-lg border border-input bg-background px-3 text-right font-mono text-xl font-bold tabular-nums text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  kg
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                × {formatARS(pendiente.precio)}/kg ={" "}
                <span className="font-mono font-semibold text-foreground">
                  {formatARS(Math.round(pendiente.precio * (pesoValido ? pesoNum : 0)))}
                </span>
              </span>
              <button
                type="button"
                onClick={confirmarPeso}
                disabled={!pesoValido}
                className="ml-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                Agregar
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex min-h-[16rem] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:min-h-0">
          <CartList
            lineas={lineas}
            onCantidad={cambiarCantidad}
            onQuitar={quitar}
          />
        </div>
      </div>

      {/* Zona derecha (o inferior en mobile): cobro. Siempre visible para poder
          cobrar en cualquier tamaño de pantalla. */}
      <div className="w-full shrink-0 md:w-80 xl:w-96">
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
