#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// cargar-catalogo.mjs
// Genera lib/catalogos/<rubro>.ts a partir de un CSV.
//
//   node scripts/cargar-catalogo.mjs <rubro> [ruta-al-csv]
//
// Si no se pasa CSV, usa scripts/catalogos-seed/<rubro>.csv
//
// Columnas reconocidas (sin distinguir mayúsculas/acentos):
//   nombre       (req)   · producto, descripcion, detalle
//   categoria    (req)   · rubro, seccion
//   precioventa  (req)   · precio, venta, pventa
//   proveedor            · distribuidor, marca
//   preciocosto          · costo, pcosto        (si falta: se deriva por margen)
//   ean / ean13          · codigo, codigobarras (si falta: se genera con díg. verif.)
//   codigointerno        · sku, interno         (si falta: se genera PREFIJO-000)
//   stock                · cantidad, existencia (si falta: se genera saludable)
//   stockminimo          · minimo, min          (si falta: default por categoría)
//
// Para cargar el catálogo de un prospecto: pasar SU CSV/Excel exportado a CSV.
// Lo único obligatorio es nombre, categoría y precio; el resto se completa solo.
// ─────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve, relative } from "node:path"
import { fileURLToPath } from "node:url"

const aca = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aca, "..")

const rubro = process.argv[2]
if (!rubro) {
  console.error("Uso: node scripts/cargar-catalogo.mjs <rubro> [csv]")
  process.exit(1)
}
const csvPath = process.argv[3]
  ? resolve(process.cwd(), process.argv[3])
  : resolve(raiz, "scripts/catalogos-seed", `${rubro}.csv`)

// Margen (precio de venta sobre el costo) usado para derivar el costo cuando no viene.
const MARGENES = {
  cigarrillos: 0.12, // margen finito, como en la vida real
  bebidas: 0.35,
  "cervezas y vinos": 0.30,
  snacks: 0.45,
  golosinas: 0.45,
  almacen: 0.28,
  lacteos: 0.25,
  limpieza: 0.35,
  perfumeria: 0.45,
  kiosco: 0.40,
  panaderia: 0.55,
  facturas: 0.60,
  pasteleria: 0.60,
  sandwiches: 0.50,
  fiambreria: 0.30,
}
const MARGEN_DEFAULT = 0.30

const STOCK_MIN = {
  bebidas: 12, "cervezas y vinos": 8, cigarrillos: 10, snacks: 10,
  golosinas: 15, almacen: 12, lacteos: 8, limpieza: 8, perfumeria: 6,
  kiosco: 8, panaderia: 10, facturas: 10, pasteleria: 10, sandwiches: 6,
  fiambreria: 4,
}
const STOCK_MIN_DEFAULT = 6

const sinAcentos = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "")
const clave = (s) => sinAcentos(String(s)).toLowerCase().trim()
const slug = (s) =>
  sinAcentos(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function digitoVerificadorEan(d12) {
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number(d12[i]) * (i % 2 === 0 ? 1 : 3)
  return (10 - (sum % 10)) % 10
}
function generarEan(n) {
  const base = "779" + String(n).padStart(9, "0").slice(-9) // 779 = prefijo Argentina
  return base + digitoVerificadorEan(base)
}

const prefijoCategoria = (cat) =>
  sinAcentos(cat).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "GEN"

function parseNumero(v) {
  if (v == null || v === "") return null
  const limpio = String(v).replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".")
  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}

function parseCSV(texto) {
  const filas = []
  let campo = "", fila = [], enComillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++ } else enComillas = false
      } else campo += c
    } else if (c === '"') enComillas = true
    else if (c === ",") { fila.push(campo); campo = "" }
    else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = "" }
    else if (c !== "\r") campo += c
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila) }
  return filas.filter((f) => f.some((x) => x.trim() !== ""))
}

const ALIAS = {
  nombre: ["nombre", "producto", "descripcion", "detalle"],
  categoria: ["categoria", "rubro", "seccion"],
  proveedor: ["proveedor", "distribuidor", "marca"],
  precioVenta: ["precioventa", "precio venta", "precio", "venta", "pventa"],
  precioCosto: ["preciocosto", "precio costo", "costo", "pcosto"],
  ean: ["ean", "ean13", "codigo", "codigo de barras", "codigobarras", "barcode"],
  codigoInterno: ["codigointerno", "codigo interno", "sku", "interno"],
  stock: ["stock", "cantidad", "existencia"],
  stockMinimo: ["stockminimo", "stock minimo", "minimo", "min"],
}

const filas = parseCSV(readFileSync(csvPath, "utf8"))
if (!filas.length) { console.error(`CSV vacío: ${csvPath}`); process.exit(1) }
const header = filas.shift().map(clave)

const idx = {}
for (const [campo, alias] of Object.entries(ALIAS)) {
  idx[campo] = header.findIndex((h) => alias.includes(h))
}
if (idx.nombre < 0 || idx.categoria < 0 || idx.precioVenta < 0) {
  console.error("Faltan columnas obligatorias: nombre, categoria, precio(venta).")
  console.error("Encabezado leído:", header.join(" | "))
  process.exit(1)
}
const get = (fila, campo) => (idx[campo] >= 0 ? (fila[idx[campo]] ?? "").trim() : "")

const catCount = {}
const idsUsados = new Set()
const productos = []
let n = 0

for (const fila of filas) {
  n++
  const nombre = get(fila, "nombre")
  if (!nombre) continue
  const categoria = get(fila, "categoria") || "General"
  const proveedor = get(fila, "proveedor") || "Sin proveedor"
  const ck = clave(categoria)

  const precioVenta = parseNumero(get(fila, "precioVenta"))
  if (precioVenta == null) {
    console.error(`Fila ${n}: precio de venta inválido (${nombre})`)
    process.exit(1)
  }
  let precioCosto = parseNumero(get(fila, "precioCosto"))
  if (precioCosto == null) {
    const margen = MARGENES[ck] ?? MARGEN_DEFAULT
    precioCosto = Math.round(precioVenta / (1 + margen))
  }

  const ean = get(fila, "ean") || generarEan(n)
  const pref = prefijoCategoria(categoria)
  catCount[pref] = (catCount[pref] ?? 0) + 1
  const codigoInterno =
    get(fila, "codigoInterno") || `${pref}-${String(catCount[pref]).padStart(3, "0")}`

  const stockMinimo = parseNumero(get(fila, "stockMinimo")) ?? (STOCK_MIN[ck] ?? STOCK_MIN_DEFAULT)
  let stock = parseNumero(get(fila, "stock"))
  if (stock == null) stock = stockMinimo * 3 + (hash(nombre) % 25) // saludable y variado

  let id = slug(nombre)
  const base = id
  let k = 2
  while (idsUsados.has(id)) id = `${base}-${k++}`
  idsUsados.add(id)

  productos.push({
    id, nombre, ean, codigoInterno, categoria, proveedor,
    precioCosto, precioVenta, stock, stockMinimo,
  })
}

const categorias = [...new Set(productos.map((p) => p.categoria))]
const proveedores = [...new Set(productos.map((p) => p.proveedor))]

const salida = resolve(raiz, "lib/catalogos", `${rubro}.ts`)
mkdirSync(dirname(salida), { recursive: true })

const ts = `// ⚠️ GENERADO por scripts/cargar-catalogo.mjs — NO editar a mano.
// Rubro: ${rubro} · Fuente: ${relative(raiz, csvPath)} · ${productos.length} productos
// Regenerar: node scripts/cargar-catalogo.mjs ${rubro}
import type { ProductoCatalogo } from "./tipos"

export const categorias: string[] = ${JSON.stringify(categorias, null, 2)}

export const proveedores: string[] = ${JSON.stringify(proveedores, null, 2)}

export const catalogo: ProductoCatalogo[] = ${JSON.stringify(productos, null, 2)}
`

writeFileSync(salida, ts)
console.log(`✓ ${rubro}: ${productos.length} productos → lib/catalogos/${rubro}.ts`)
console.log(`  categorías: ${categorias.length} · proveedores: ${proveedores.length}`)
