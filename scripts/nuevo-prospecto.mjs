#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// nuevo-prospecto.mjs
// Prepara la demo de un prospecto en un comando: crea la branch, carga SU
// catálogo (si pasás un CSV), setea el nombre del local y el usuario, y commitea.
//
//   node scripts/nuevo-prospecto.mjs \
//     --slug san-cayetano \
//     --rubro drugstore \
//     --local "Drugstore San Cayetano" \
//     --cajero "Franco" \
//     [--rol "Vendedor"] \
//     [--csv ~/lista-precios.csv]
//
// Después:  git push -u origin prospecto/<slug>
// y en Netlify ese branch queda en su propia URL (ver README).
// ─────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const RUBROS_CONOCIDOS = ["drugstore", "panaderia", "verduleria"]

// --- parseo de argumentos --dato valor ---
const args = {}
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i]
  if (!k?.startsWith("--")) fallar(`Argumento inesperado: ${k}`)
  args[k.slice(2)] = process.argv[i + 1]
}

const { slug, rubro, local, cajero } = args
const rol = args.rol ?? "Vendedor"
const csv = args.csv

if (!slug || !rubro || !local || !cajero) {
  fallar(
    "Faltan datos. Uso:\n" +
      '  node scripts/nuevo-prospecto.mjs --slug <slug> --rubro <rubro> ' +
      '--local "<Nombre>" --cajero "<Nombre>" [--rol "<Rol>"] [--csv <archivo>]',
  )
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  fallar(`--slug inválido: "${slug}" (usá minúsculas, números y guiones)`)
}
if (!RUBROS_CONOCIDOS.includes(rubro)) {
  fallar(
    `--rubro "${rubro}" no está registrado. Conocidos: ${RUBROS_CONOCIDOS.join(", ")}.\n` +
      "Para un rubro nuevo: creá su semilla, corré cargar-catalogo.mjs y agregalo\n" +
      "al objeto `rubros` de lib/catalogo-data.ts (ver README).",
  )
}

const git = (...a) => execFileSync("git", a, { cwd: raiz, stdio: "pipe" }).toString().trim()

// --- el árbol tiene que estar limpio (para no arrastrar cambios sueltos) ---
if (git("status", "--porcelain")) {
  fallar(
    "Hay cambios sin commitear. Guardá o descartá tu trabajo antes de armar un prospecto.",
  )
}

const branch = `prospecto/${slug}`

// --- 1. crear la branch ---
try {
  git("switch", "-c", branch)
} catch {
  fallar(`No pude crear la branch "${branch}" (¿ya existe? probá con otro --slug).`)
}
console.log(`✓ branch ${branch}`)

// --- 2. cargar el catálogo del cliente (opcional) ---
if (csv) {
  execFileSync(
    process.execPath,
    [resolve(raiz, "scripts/cargar-catalogo.mjs"), rubro, resolve(process.cwd(), csv)],
    { cwd: raiz, stdio: "inherit" },
  )
} else {
  console.log(`· sin --csv: se usa el catálogo semilla de "${rubro}"`)
}

// --- 3. escribir lib/config-local.ts con los datos del local ---
const s = (v) => JSON.stringify(v) // literal TS seguro (escapa comillas/acentos)
const configTs = `// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN POR LOCAL (prospecto)
// Generado por scripts/nuevo-prospecto.mjs — editable a mano si hace falta.
// Lo único que cambia entre prospectos vive acá + su catálogo.
// ─────────────────────────────────────────────────────────────

export const configLocal = {
  /** Rubro / inventario. Valores: "drugstore" | "panaderia" | "verduleria". */
  rubro: ${s(rubro)},

  /** Nombre del comercio, tal como lo ve el cliente en el encabezado. */
  nombreLocal: ${s(local)},

  /** Usuario logueado en la demo (dueño o quien atiende el mostrador). */
  usuario: {
    nombre: ${s(cajero)},
    rol: ${s(rol)},
  },
} as const

/** Inicial para el avatar del usuario (derivada del nombre). */
export const inicialUsuario = configLocal.usuario.nombre.charAt(0).toUpperCase()
`
writeFileSync(resolve(raiz, "lib/config-local.ts"), configTs)
console.log(`✓ config-local.ts (${local} · ${rubro} · ${cajero})`)

// --- 4. commit ---
git("add", "-A")
git("commit", "-m", `prospecto: ${local}`)
console.log(`✓ commit`)

console.log(
  `\nListo. Ahora:\n` +
    `  git push -u origin ${branch}\n` +
    `y en Netlify ese branch queda en su URL (con branch deploys activados).\n` +
    `Para volver a la plantilla limpia:  git switch main`,
)

function fallar(msg) {
  console.error("✗ " + msg)
  process.exit(1)
}
