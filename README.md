# Mostrador — POS (demo)

Punto de venta web para comercios chicos (drugstores, kioscos, almacenes).
**Front-only a propósito**: no tiene backend. Es la demo extendida que se deja
cargada en el local del prospecto para que la pruebe dos semanas. El backend
(Supabase + multi-tenant) recién se construye cuando un local dice que sí.

Stack: Next.js 16 · React 19 · Tailwind v4 · TypeScript.

---

## 1. Correr local — para la reunión (sin internet)

La demo en vivo se hace con la notebook en el local, donde el wifi puede ser
malo o no haber. Por eso **tiene que correr sin conexión**.

Requisito único: haber corrido `npm install` **una vez con internet**. Ya está
hecho — la carpeta `node_modules/` está presente. Después:

```bash
npm run dev
```

Abre http://localhost:3000. No necesita internet.

> Si algún día trabajás desde otra notebook: `npm install` una sola vez con
> conexión y queda listo para siempre offline.

---

## 2. Preparar un prospecto nuevo

Cada prospecto es una **branch** de git. Solo se toca el catálogo del rubro y
`lib/config-local.ts` (rubro + nombre del local + usuario).

```bash
git checkout main
git checkout -b prospecto/san-cayetano      # slug del local

# 1. Cargar SU catálogo desde el CSV/Excel del cliente (exportado a CSV).
#    Genera lib/catalogos/<rubro>.ts. Lo único obligatorio en el CSV es
#    nombre, categoría y precio; EAN, código interno y costo se completan solos.
node scripts/cargar-catalogo.mjs drugstore ~/lista-san-cayetano.csv

# 2. Editar lib/config-local.ts:
#      rubro: "drugstore"                     # o "panaderia"
#      nombreLocal: "Drugstore San Cayetano"
#      usuario: { nombre: "...", rol: "..." }

git commit -am "prospecto: San Cayetano"
```

`main` queda siempre como **plantilla limpia**, sin datos de ningún cliente.

### Rubros / inventarios disponibles

El campo `rubro` en `config-local.ts` elige qué catálogo se muestra. Hoy hay dos
semillas listas en `scripts/catalogos-seed/`:

- **`drugstore`** — 200 productos más vendidos (cigarrillos, bebidas, cervezas,
  snacks, golosinas, almacén, lácteos, limpieza, perfumería, kiosco).
- **`panaderia`** — facturas, pan, pastelería, sándwiches, fiambrería y almacén.
- **`verduleria`** — frutas y verduras **por peso** (precio por kg). Ver también
  la nota de "venta por peso" en `docs/superpowers/specs/`.

Regenerar una semilla tras editar su CSV: `node scripts/cargar-catalogo.mjs <rubro>`
(sin pasar ruta, usa `scripts/catalogos-seed/<rubro>.csv`).

Para **sumar un rubro nuevo** (ej. `kiosco`, `verduleria`): crear su CSV en
`scripts/catalogos-seed/`, correr el script, y agregarlo al objeto `rubros` de
`lib/catalogo-data.ts`.

---

## 3. Deploy — Netlify (sitio estático)

La app compila como **sitio estático** (`output: "export"` → carpeta `out/`),
así que se hostea en Netlify (o cualquier hosting estático). El repo está en
GitHub: `https://github.com/Franzk12/Drugstore`.

### Una vez (conectar el repo)

1. En [app.netlify.com](https://app.netlify.com) → **Add new site → Import from
   GitHub** → elegir el repo `Franzk12/Drugstore`.
2. Netlify lee `netlify.toml` solo: build `npm run build`, publish `out/`.
   Confirmá y **Deploy**. Queda en `https://<algo>.netlify.app`
   (renombrable en Site settings → Change site name).

Desde ahí, **cada `git push` a `main` redeploya solo**.

### Un prospecto = una branch

Cada prospecto cambia solo su catálogo + `lib/config-local.ts`:

```bash
git checkout -b prospecto/san-cayetano
node scripts/cargar-catalogo.mjs <rubro> ~/lista-cliente.csv   # su catálogo
# editar lib/config-local.ts (rubro + nombreLocal + usuario)
git commit -am "prospecto: San Cayetano"
git push -u origin prospecto/san-cayetano
```

En Netlify, cada branch genera un **deploy preview** con su propia URL
(`prospecto-san-cayetano--<sitio>.netlify.app`), o creás un site aparte por
prospecto apuntado a su branch si querés una URL más linda por local.

> **Probar el build estático localmente:** `npm run build` y servís `out/` con
> cualquier server estático (ej. `npx serve out`).

---

## Notas

- **Modo claro bloqueado a propósito** (`colorScheme: 'light'` en el layout). No
  tocar: el cliente es un dueño de local conservador.
- El **plan comercial** (`plan-saas-drugstore.md`) vive **fuera** de este repo, a
  propósito: tiene precios y estrategia que no deben viajar a un deploy público.
- Sin backend, base de datos ni auth. Todavía.
