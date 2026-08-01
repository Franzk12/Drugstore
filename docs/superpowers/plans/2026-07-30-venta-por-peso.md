# Venta por peso — Plan de implementación

> **Para el que implementa:** ejecutar tarea por tarea, en orden. Cada tarea
> termina con verificación real y un commit. Marcá los `- [ ]` a medida que avanzás.

**Goal:** habilitar venta por peso (precio por kg) en el POS, con un rubro demo de verdulería, sin backend.

**Architecture:** marca por producto (`unidadVenta: "unidad" | "kg"`) en el catálogo; el POS pide el peso al agregar un producto por kg; carrito, conteo de ítems y pantalla de Productos se adaptan. Todo en memoria (se resetea al refrescar).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4. Estado de sesión con React Context (`lib/session-store.tsx`).

## Global Constraints (copiadas del spec — aplican a TODAS las tareas)

- **Front-only, en memoria.** No agregar backend, DB, auth ni persistencia.
- **Balanza fuera de alcance:** el peso se ingresa a mano.
- El modal de actualización masiva **arranca cerrado**.
- **Modo claro** fijo (no tocar `colorScheme`).
- **Un solo catálogo activo** por vez (selección por rubro en `config-local.ts`).
- Formato **es-AR** (`formatARS`, `formatKg` con coma decimal).
- Seguir patrones existentes; los catálogos `lib/catalogos/<rubro>.ts` son **generados** (no editar a mano).

## Verificación (reemplaza al TDD; este repo no tiene tests unitarios)

El "test" de cada tarea es este loop, con comandos y observación esperada:
1. `npx tsc --noEmit` → sin salida (sin errores de tipo).
2. `npm run build` → "Compiled successfully" + "Running TypeScript" en verde.
3. Cuando la tarea toca UI: `npm run dev` y manejar el flujo afectado con la skill `agent-browser`, observando el resultado concreto que indica la tarea.

## File Structure

- `lib/catalogos/tipos.ts` — agrega el campo `unidadVenta` al tipo.
- `scripts/cargar-catalogo.mjs` — reconoce la columna `unidadVenta`; márgenes/stock de verdulería.
- `scripts/catalogos-seed/verduleria.csv` — nuevo (semilla, ~35 productos por kg).
- `lib/catalogos/{drugstore,panaderia,verduleria}.ts` — regenerados con `unidadVenta`.
- `lib/catalogo-data.ts` — registra rubro `verduleria`; `Producto` suma `unidadVenta`; helper `formatKg`.
- `lib/session-store.tsx` — deriva `unidadVenta` en `productos`.
- `components/pos/sell-screen.tsx` — prompt de peso al agregar; conteo de ítems.
- `components/pos/cart-list.tsx` — línea por kg con peso editable.
- `components/pos/products-screen.tsx` — sufijos "/kg" y kg en columnas.

---

## Task 1: Modelo de datos, script y semilla verdulería

**Files:**
- Modify: `lib/catalogos/tipos.ts`
- Modify: `scripts/cargar-catalogo.mjs`
- Create: `scripts/catalogos-seed/verduleria.csv`
- Regenerate: `lib/catalogos/{drugstore,panaderia,verduleria}.ts`
- Modify: `lib/catalogo-data.ts` (registrar rubro)

**Interfaces:**
- Produces: `ProductoCatalogo.unidadVenta: "unidad" | "kg"`; módulo `lib/catalogos/verduleria.ts` con `catalogo/categorias/proveedores`; rubro `"verduleria"` en el objeto `rubros`.

- [ ] **Step 1: Agregar el campo al tipo.** En `lib/catalogos/tipos.ts`, dentro de `ProductoCatalogo`, después de `proveedor`:

```ts
  proveedor: string
  /** Forma de venta: por unidad o por kilo. Para "kg", precio/stock son por kg. */
  unidadVenta: "unidad" | "kg"
  precioCosto: number
```

- [ ] **Step 2: Reconocer la columna en el script.** En `scripts/cargar-catalogo.mjs`, agregar al objeto `ALIAS`:

```js
  unidadVenta: ["unidadventa", "unidad de venta", "forma de venta", "por"],
```

Agregar a `MARGENES` (después de `perfumeria`): `verduras: 0.35, frutas: 0.35,`
Agregar a `STOCK_MIN`: `verduras: 8, frutas: 8,`

En el armado de cada producto (dentro del `for (const fila of filas)`, junto a las otras derivaciones), agregar:

```js
  const unidadRaw = clave(get(fila, "unidadVenta"))
  const unidadVenta = ["kg", "peso", "gramo", "gramos", "g", "por peso"].includes(unidadRaw)
    ? "kg"
    : "unidad"
```

Y sumar `unidadVenta` al objeto que se hace `push` a `productos`:

```js
  productos.push({
    id, nombre, ean, codigoInterno, categoria, proveedor,
    unidadVenta,
    precioCosto, precioVenta, stock, stockMinimo,
  })
```

- [ ] **Step 3: Crear la semilla de verdulería.** Crear `scripts/catalogos-seed/verduleria.csv`:

```csv
nombre,categoria,proveedor,unidadVenta,precioVenta,stock,stockMinimo
Tomate redondo,Verduras,Mercado de Abasto,kg,1200,,
Papa blanca,Verduras,Mercado de Abasto,kg,800,,
Cebolla,Verduras,Mercado de Abasto,kg,900,,
Zanahoria,Verduras,Mercado de Abasto,kg,1000,,
Zapallo anco,Verduras,Quinta local,kg,950,,
Batata,Verduras,Quinta local,kg,1100,,
Lechuga criolla,Verduras,Quinta local,kg,1800,3,8
Acelga,Verduras,Quinta local,kg,1400,,
Espinaca,Verduras,Quinta local,kg,2200,,
Morrón rojo,Verduras,Mercado de Abasto,kg,3200,,
Morrón verde,Verduras,Mercado de Abasto,kg,2400,,
Choclo,Verduras,Quinta local,kg,1300,,
Zapallito,Verduras,Quinta local,kg,1500,,
Berenjena,Verduras,Quinta local,kg,1700,,
Pepino,Verduras,Quinta local,kg,1600,,
Ajo,Verduras,Mercado de Abasto,kg,4800,,
Remolacha,Verduras,Quinta local,kg,1100,,
Chaucha,Verduras,Quinta local,kg,2600,,
Manzana roja,Frutas,Mercado de Abasto,kg,1800,,
Manzana verde,Frutas,Mercado de Abasto,kg,1900,,
Banana,Frutas,Mercado de Abasto,kg,1500,,
Naranja,Frutas,Mercado de Abasto,kg,1100,,
Mandarina,Frutas,Mercado de Abasto,kg,1300,,
Limón,Frutas,Mercado de Abasto,kg,1600,,
Pera,Frutas,Mercado de Abasto,kg,1900,,
Uva,Frutas,Mercado de Abasto,kg,3400,,
Frutilla,Frutas,Quinta local,kg,4500,2,5
Durazno,Frutas,Mercado de Abasto,kg,2600,,
Ciruela,Frutas,Mercado de Abasto,kg,2400,,
Kiwi,Frutas,Mercado de Abasto,kg,3800,,
Ananá,Frutas,Mercado de Abasto,kg,2200,,
Melón,Frutas,Quinta local,kg,1400,,
Sandía,Frutas,Quinta local,kg,900,,
Pomelo,Frutas,Mercado de Abasto,kg,1200,,
Palta,Frutas,Mercado de Abasto,kg,5200,,
```

- [ ] **Step 4: Regenerar los tres catálogos.** (drugstore y panaderia adquieren `unidadVenta:"unidad"`; verduleria queda todo en kg.)

Run:
```bash
node scripts/cargar-catalogo.mjs drugstore
node scripts/cargar-catalogo.mjs panaderia
node scripts/cargar-catalogo.mjs verduleria
```
Expected: `✓ verduleria: 35 productos → lib/catalogos/verduleria.ts`

- [ ] **Step 5: Registrar el rubro.** En `lib/catalogo-data.ts`, agregar el import y sumarlo a `rubros`:

```ts
import * as verduleria from "@/lib/catalogos/verduleria"
```
```ts
const rubros = {
  drugstore,
  panaderia,
  verduleria,
} as const
```

- [ ] **Step 6: Verificar.** Confirmar que el generado trae el campo:
```bash
grep -m1 unidadVenta lib/catalogos/verduleria.ts && grep -m1 unidadVenta lib/catalogos/drugstore.ts
npx tsc --noEmit
```
Expected: aparece `"unidadVenta": "kg"` (verduleria) y `"unidadVenta": "unidad"` (drugstore); tsc sin errores.

- [ ] **Step 7: Commit.**
```bash
git add lib/catalogos scripts lib/catalogo-data.ts
git commit -m "feat(peso): modelo unidadVenta + script + semilla verdulería"
```

---

## Task 2: Derivación en catálogo/store + helper formatKg

**Files:**
- Modify: `lib/catalogo-data.ts`
- Modify: `lib/session-store.tsx`

**Interfaces:**
- Consumes: `ProductoCatalogo.unidadVenta` (Task 1).
- Produces: `Producto.unidadVenta`; `formatKg(kg: number): string`.

- [ ] **Step 1: Sumar `unidadVenta` al tipo `Producto`.** En `lib/catalogo-data.ts`, dentro de `export type Producto`:

```ts
export type Producto = {
  id: string
  nombre: string
  precio: number
  categoria: string
  codigo: string
  codigoInterno: string
  unidadVenta: "unidad" | "kg"
}
```

- [ ] **Step 2: Agregar el helper `formatKg`.** En `lib/catalogo-data.ts`, después de `formatARS`:

```ts
/** Formatea un peso en kg con coma decimal (es-AR). Ej: 0.75 → "0,750 kg". */
export function formatKg(kg: number): string {
  return (
    new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(kg) + " kg"
  )
}
```

- [ ] **Step 3: Derivar `unidadVenta` en el store.** En `lib/session-store.tsx`, en el `.map` que arma `productos`, agregar la propiedad:

```ts
  const productos = useMemo<Producto[]>(
    () =>
      catalogo.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precioVenta,
        categoria: p.categoria,
        codigo: p.ean,
        codigoInterno: p.codigoInterno,
        unidadVenta: p.unidadVenta,
      })),
    [catalogo],
  )
```

- [ ] **Step 4: Verificar.**
```bash
npx tsc --noEmit && npm run build 2>&1 | grep -iE "compiled|error"
```
Expected: "Compiled successfully", sin errores.

- [ ] **Step 5: Commit.**
```bash
git add lib/catalogo-data.ts lib/session-store.tsx
git commit -m "feat(peso): Producto.unidadVenta derivado + helper formatKg"
```

---

## Task 3: POS Vender — prompt de peso al agregar + conteo de ítems

**Files:**
- Modify: `components/pos/sell-screen.tsx`

**Interfaces:**
- Consumes: `Producto.unidadVenta`, `formatKg`, `formatARS` (Tasks 1-2).
- Produces: para el carrito, líneas donde `cantidad` es kg si `unidadVenta === "kg"`. Callback `onPeso(id, kg)` que consume Task 4.

- [ ] **Step 1: Importar `formatKg` y agregar estado del prompt.** En el import de `@/lib/catalogo-data`, sumar `formatKg`. Dentro de `SellScreen`, después de `const [medioPago, ...]`:

```ts
  // Producto por kg esperando que se ingrese el peso (null = no hay prompt).
  const [pendiente, setPendiente] = useState<Producto | null>(null)
  const [pesoStr, setPesoStr] = useState("")
  const pesoRef = useRef<HTMLInputElement>(null)
```

- [ ] **Step 2: Bifurcar `agregar` según la forma de venta.** Reemplazar la función `agregar` por:

```ts
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
```

- [ ] **Step 3: Confirmar peso y agregar la línea.** Agregar debajo de `agregar`:

```ts
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
```

- [ ] **Step 4: Redefinir el conteo de ítems.** Reemplazar el `cantidadItems` actual por:

```ts
  const cantidadItems = useMemo(
    () =>
      lineas.reduce(
        (acc, l) => acc + (l.unidadVenta === "unidad" ? l.cantidad : 1),
        0,
      ),
    [lineas],
  )
```

- [ ] **Step 5: Mostrar "/kg" en la sugerencia.** En el `<span>` del precio dentro de la lista de sugerencias, cambiar `{formatARS(p.precio)}` por:

```tsx
                      {p.unidadVenta === "kg"
                        ? `${formatARS(p.precio)}/kg`
                        : formatARS(p.precio)}
```

- [ ] **Step 6: Renderizar el prompt de peso.** Justo después del `</form>` (antes del contenedor del carrito), agregar:

```tsx
        {pendiente && (
          <div className="mt-3 rounded-xl border border-primary/40 bg-accent/40 p-4">
            <p className="text-sm font-medium text-foreground">{pendiente.nombre}</p>
            <div className="mt-2 flex items-center gap-3">
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
```

- [ ] **Step 7: Verificar (con navegador).**
```bash
npx tsc --noEmit && npm run build 2>&1 | grep -iE "compiled|error"
```
Después, con `rubro: "verduleria"` en `config-local.ts` temporalmente: `npm run dev`, abrir, buscar "tomate", elegirlo → aparece el campo de peso; ingresar `0,750` → muestra "$900"; Agregar → la línea entra al carrito. (El editar el peso desde el carrito llega en la Task 4. Revertir el rubro al terminar si corresponde.)

- [ ] **Step 8: Commit.**
```bash
git add components/pos/sell-screen.tsx
git commit -m "feat(peso): prompt de peso al agregar + conteo de ítems por línea"
```

---

## Task 4: Carrito — línea por kg con peso editable

**Files:**
- Modify: `components/pos/cart-list.tsx`

**Interfaces:**
- Consumes: `LineaCarrito.unidadVenta`, `onPeso(id, kg)` de Task 3, `formatKg`.
- Produces: render diferenciado por tipo de línea.

- [ ] **Step 1: Ampliar props e imports.** En `cart-list.tsx`, importar `formatKg`:

```ts
import { formatARS, formatKg, type Producto } from "@/lib/catalogo-data"
```
Agregar `onPeso` a las props del componente:

```ts
export function CartList({
  lineas,
  onCantidad,
  onQuitar,
  onPeso,
}: {
  lineas: LineaCarrito[]
  onCantidad: (id: string, delta: number) => void
  onQuitar: (id: string) => void
  onPeso: (id: string, kg: number) => void
}) {
```

- [ ] **Step 2: Render condicional de la columna cantidad/peso.** Reemplazar el bloque de la línea (`<div className="flex w-32 items-center justify-center gap-1">...</div>` con los `QtyButton`) por:

```tsx
            {linea.unidadVenta === "kg" ? (
              <div className="flex w-32 items-center justify-center gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={linea.cantidad}
                  onChange={(e) => onPeso(linea.id, Number.parseFloat(e.target.value) || 0)}
                  aria-label={`Peso en kg de ${linea.nombre}`}
                  className="h-8 w-20 rounded-md border border-border bg-background px-2 text-right font-mono text-sm tabular-nums text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-xs text-muted-foreground">kg</span>
              </div>
            ) : (
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
            )}
```

- [ ] **Step 3: Mostrar "/kg" en el precio unitario.** Reemplazar el `<span>` de "Precio unit." por:

```tsx
            <span className="w-28 text-right font-mono text-sm tabular-nums text-muted-foreground">
              {linea.unidadVenta === "kg"
                ? `${formatARS(linea.precio)}/kg`
                : formatARS(linea.precio)}
            </span>
```

(El subtotal `formatARS(linea.precio * linea.cantidad)` ya funciona para kg — no se toca.)

- [ ] **Step 4: Cablear `onPeso` en sell-screen.** En `components/pos/sell-screen.tsx`, agregar la función junto a `cambiarCantidad`:

```ts
  function cambiarPeso(id: string, kg: number) {
    setLineas((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, cantidad: kg } : l))
        .filter((l) => l.cantidad > 0),
    )
  }
```

Y en el JSX `<CartList ... />`, agregar la prop:

```tsx
          onPeso={cambiarPeso}
```

- [ ] **Step 5: Verificar (con navegador).**
```bash
npx tsc --noEmit && npm run build 2>&1 | grep -iE "compiled|error"
```
Con rubro verdulería en dev: agregar tomate 0,750 kg; en el carrito ver "0,750 kg", "$1.200/kg" y subtotal "$900"; editar el peso a 1,5 → subtotal pasa a "$1.800".

- [ ] **Step 6: Commit.**
```bash
git add components/pos/cart-list.tsx components/pos/sell-screen.tsx
git commit -m "feat(peso): línea de carrito por kg con peso editable"
```

---

## Task 5: Pantalla Productos — sufijos /kg y kg

**Files:**
- Modify: `components/pos/products-screen.tsx`

**Interfaces:**
- Consumes: `ProductoCatalogo.unidadVenta`, `formatKg`.

- [ ] **Step 1: Importar `formatKg`.** En el import de `@/lib/catalogo-data`:

```ts
import { categorias, formatARS, formatKg } from "@/lib/catalogo-data"
```

- [ ] **Step 2: Mostrar "/kg" en precio costo y venta.** En las celdas de precio de la tabla, reemplazar:

```tsx
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
```

- [ ] **Step 3: Mostrar el stock en kg.** En el `<span>` del stock (el que muestra `{p.stock}`), reemplazar `{p.stock}` por:

```tsx
                          {p.unidadVenta === "kg" ? formatKg(p.stock) : p.stock}
```

(La lógica `stockBajo = p.stock < p.stockMinimo` no cambia.)

- [ ] **Step 4: Verificar (con navegador).**
```bash
npx tsc --noEmit && npm run build 2>&1 | grep -iE "compiled|error"
```
Con rubro verdulería en dev, ir a Productos: los precios muestran "/kg" y el stock "X,XXX kg"; "Frutilla" y "Lechuga criolla" muestran badge "Stock bajo".

- [ ] **Step 5: Commit.**
```bash
git add components/pos/products-screen.tsx
git commit -m "feat(peso): Productos muestra /kg y stock en kg"
```

---

## Task 6: Regresión + cierre

**Files:** ninguno (verificación).

- [ ] **Step 1: Confirmar que los rubros por unidad no se rompieron.** Poner `rubro: "drugstore"` en `config-local.ts`; `npm run dev`; en Vender agregar productos con +/− (Coca, etc.), cobrar, ir a Caja y confirmar el arqueo. Todo debe comportarse **igual que antes** (sin prompt de peso, sin "/kg").

- [ ] **Step 2: Confirmar el rubro verdulería de punta a punta.** `rubro: "verduleria"`: agregar 2-3 productos por peso, cobrar en efectivo, ir a Caja y confirmar que el total y el "N ítems" cuadran (cada línea pesada cuenta 1).

- [ ] **Step 3: Dejar el rubro como corresponda.** Revertir `config-local.ts` al rubro que quieras dejar por defecto (probablemente `drugstore`).

- [ ] **Step 4: Commit (si quedó algún cambio de config).**
```bash
git add lib/config-local.ts
git commit -m "chore(peso): rubro por defecto tras verificación"
```
