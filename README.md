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

Regenerar una semilla tras editar su CSV: `node scripts/cargar-catalogo.mjs <rubro>`
(sin pasar ruta, usa `scripts/catalogos-seed/<rubro>.csv`).

Para **sumar un rubro nuevo** (ej. `kiosco`, `verduleria`): crear su CSV en
`scripts/catalogos-seed/`, correr el script, y agregarlo al objeto `rubros` de
`lib/catalogo-data.ts`.

---

## 3. Deploy — para las dos semanas de prueba

La Vercel CLI ya está logueada (`vercel whoami`). **Un proyecto Vercel por
prospecto**, cada uno con su URL gratis: `san-cayetano.vercel.app`.

Estando **en la branch del prospecto**:

```bash
vercel link          # crear/elegir el proyecto; nombre = slug del local
vercel --prod        # despliega → https://<slug>.vercel.app
```

Para volver a desplegar tras un cambio: `vercel --prod` otra vez.

> **Un prospecto a la vez.** El link al proyecto se guarda en `.vercel/`
> (ignorado por git). Al pasar a otro prospecto, `vercel link` de nuevo para
> apuntar a su proyecto.

### Opcional: auto-deploy con GitHub

Si más adelante querés que cada `git push` despliegue solo, conectás el repo en
el dashboard de Vercel (Import Project) y fijás la branch de producción de cada
proyecto a su `prospecto/<slug>`. No hace falta para el flujo de arriba.

---

## Notas

- **Modo claro bloqueado a propósito** (`colorScheme: 'light'` en el layout). No
  tocar: el cliente es un dueño de local conservador.
- El **plan comercial** (`plan-saas-drugstore.md`) vive **fuera** de este repo, a
  propósito: tiene precios y estrategia que no deben viajar a un deploy público.
- Sin backend, base de datos ni auth. Todavía.
