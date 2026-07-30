# Diseño — Venta por peso

**Proyecto:** Mostrador (POS web front-only)
**Fecha:** 2026-07-30
**Estado:** diseño aprobado en su flujo; pendiente de revisión final antes del plan de implementación.

---

## 1. Contexto y objetivo

Mostrador es un POS de mostrador para comercios chicos, con un flujo pensado para
venta **por unidad**: escanear/buscar → carrito → cobrar → arqueo de caja. Hoy es
multi-rubro por catálogo (drugstore, panadería), pero todos los rubros existentes
venden por unidad.

**Objetivo:** habilitar la **venta por peso** (precio por kg) para abrir un mercado
nuevo de comercios que hoy no puede usar el sistema: verdulerías, fruterías,
fiambrerías, dietéticas a granel. El primer rubro a bordar es **verdulería/frutería**.

**Por qué es un cambio de rumbo consciente:** rompe la regla previa de "no agregar
features nuevas". Se acepta a pedido del dueño. **Sigue siendo solo-front**, sin
backend ni persistencia (se resetea al refrescar, como el resto de la demo).

---

## 2. Alcance

**Dentro:**
- Marca por producto de la forma de venta (`unidad` o `kg`).
- Ingreso manual del peso al vender un producto por kg.
- Catálogo semilla de verdulería (~35 productos por kg).
- Ajuste del carrito, la búsqueda y la caja para soportar líneas por peso.

**Fuera (a propósito):**
- **Integración con balanza** (hardware). El peso se ingresa **a mano**. Se comunica
  al cliente igual que el "AFIP ≠ impresora fiscal": está en el plan, es futuro.
- Códigos de barras de balanza con peso/precio embebido (prefijo `2x`).
- Fraccionamiento avanzado (ml, porciones), combos, etc.

---

## 3. Enfoque elegido

**Marca por producto** (no modo por local). Cada producto define cómo se vende. El
catálogo de verdulería tendrá todos sus productos en `kg`, así que la demo se ve
"todo por peso"; pero un local puede mezclar unidad + peso sin rehacer nada.
Descartado: modo por local (encierra al mezclar) y un tipo de línea de carrito
separado (sobre-ingeniería).

---

## 4. Modelo de datos

En `lib/catalogos/tipos.ts`, `ProductoCatalogo` suma:

```ts
unidadVenta: "unidad" | "kg"   // default "unidad"
```

Semántica cuando `unidadVenta === "kg"`:
- `precioVenta` y `precioCosto` = **precio por kg**.
- `stock` y `stockMinimo` = **en kg** (pueden ser decimales).

Los productos por unidad existentes no cambian (default `"unidad"`).

---

## 5. Script de carga (`scripts/cargar-catalogo.mjs`)

- Reconoce una columna opcional `unidadVenta` (alias: `unidad`, `por`, `venta`).
  Valores `"kg"`/`"peso"`/`"gramo"` → `"kg"`; vacío u otro → `"unidad"`.
- El costo se sigue derivando por margen de categoría (ahora "por kg" para pesables).
- Se agregan márgenes/stock por defecto para categorías de verdulería
  (Verduras, Frutas); si falta, usa los defaults existentes.
- La derivación de EAN y código interno no cambia.

---

## 6. Semilla verdulería

- Nuevo `scripts/catalogos-seed/verduleria.csv`, ~35 productos por kg
  (tomate, papa, cebolla, zanahoria, zapallo, lechuga, manzana, banana, naranja,
  mandarina, pera, limón, etc.), categorías **Verduras** y **Frutas**.
- Genera `lib/catalogos/verduleria.ts`; se registra en el objeto `rubros` de
  `lib/catalogo-data.ts`.
- Demoable con `rubro: "verduleria"` en `lib/config-local.ts`.

---

## 7. Flujo en Vender (POS) — el corazón

- **Búsqueda:** la sugerencia de un producto por kg muestra el precio como
  "$X/kg" (en vez de "$X").
- **Al elegir** un producto por kg (click en la sugerencia o Enter del buscador):
  en lugar de agregarlo directo, aparece un **campo de peso** con el precio
  calculado en vivo (peso × $/kg). El cajero tipea los kg y confirma con Enter →
  se agrega la línea con ese peso. Acepta coma o punto como decimal.
- **Productos por unidad:** sin cambios (se agregan con cantidad 1, como hoy).
- Se mantiene el flujo teclado/lector (elegir → tipear peso → Enter).

---

## 8. Carrito (`cart-list.tsx`)

- **Línea por unidad:** igual que hoy (botones +/−, precio unitario, subtotal).
- **Línea por kg:** muestra el **peso editable** ("0,750 kg"), el "$X/kg" y el
  subtotal (peso × precio). El peso se puede corregir en la línea. El botón de
  quitar se mantiene. No hay botones +/− en las líneas por kg.
- `LineaCarrito` y el tipo `Producto` del POS incorporan `unidadVenta` para saber
  cómo renderizar cada línea. `cantidad` representa unidades (entero) o kg
  (decimal) según el producto.

---

## 9. Caja / ventas

- **Total:** sin cambios (suma de subtotales; ya funciona con decimales).
- **Conteo de ítems** ("N ítems"): se redefine para no mostrar "0,75 ítems".
  Fórmula: suma sobre las líneas de `unidadVenta === "unidad" ? cantidad : 1`.
  Es decir, cada línea pesada cuenta como 1 ítem; las de unidad suman su cantidad.
- **Arqueo:** sin cambios. La venta se registra igual (total, medio de pago).

---

## 10. Formato y utilidades

- `formatARS` sin cambios.
- Nuevo helper `formatKg(kg)` → "0,750 kg" (locale es-AR, 3 decimales).
- Precio de productos por peso se muestra con sufijo "/kg" donde corresponda
  (búsqueda, carrito, tabla de Productos).

---

## 11. Pantalla Productos

- Las columnas de precio y stock muestran el sufijo/unidad correcta para los
  pesables (p. ej. "$1.200/kg", "12,5 kg", "Stock bajo" según `stockMinimo` en kg).
- La actualización masiva de precios funciona igual (opera sobre `precioVenta`,
  que para pesables es el precio por kg).

---

## 12. Restricciones que se respetan (sin cambios)

- El modal de actualización masiva **arranca cerrado**.
- **Modo claro** fijo.
- Un solo **catálogo activo** por vez (selección por rubro).
- **Front-only**, todo en memoria; se resetea al refrescar. Sin backend/DB/auth.

---

## 13. Verificación (cómo se prueba)

1. `npm run build` + `npx tsc --noEmit` en verde.
2. Manejando el navegador (agent-browser):
   - Rubro `verduleria`: elegir "Tomate", ingresar 0,750 kg → línea "$900"
     (con $1.200/kg); cobrar; confirmar que la Caja refleja el total.
   - Confirmar el conteo de ítems (una venta de 3 productos pesados = "3 ítems").
   - Volver a `rubro: "drugstore"` y confirmar que la venta por unidad sigue
     **igual** (no se rompió nada).
   - Verificar "stock bajo" con un pesable por debajo de su `stockMinimo` en kg.

---

## 14. Archivos afectados (estimado)

- `lib/catalogos/tipos.ts` — nuevo campo `unidadVenta`.
- `scripts/cargar-catalogo.mjs` — columna `unidadVenta` + márgenes verdulería.
- `scripts/catalogos-seed/verduleria.csv` — nuevo.
- `lib/catalogos/verduleria.ts` — generado.
- `lib/catalogo-data.ts` — registrar rubro `verduleria`; `Producto` suma `unidadVenta`;
  helper `formatKg`.
- `lib/session-store.tsx` — derivar `unidadVenta` en `productos`; conteo de ítems.
- `components/pos/sell-screen.tsx` — prompt de peso al agregar; conteo de ítems.
- `components/pos/cart-list.tsx` — render de línea por kg (peso editable).
- `components/pos/checkout-panel.tsx` — usar el nuevo conteo de ítems.
- `components/pos/products-screen.tsx` — sufijos "/kg" y kg en columnas.

---

## 15. Riesgos / notas

- **Balanza:** no venderla como incluida. Peso a mano en la demo; integración con
  balanza es hardware (futuro), igual que la impresora fiscal.
- **"Todo por peso" del cliente:** se implementa como marca por producto para no
  encerrarse; el catálogo demo es 100% kg y se ve igual.
- **Simplicidad del pitch:** el ingreso de peso agrega un paso al flujo "escaneá y
  listo"; para verdulerías es natural (pesás y tipeás), pero tenerlo en cuenta al
  demostrar.
