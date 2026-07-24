"use client"

import {
  BarChart3,
  Boxes,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { configLocal, inicialUsuario } from "@/lib/config-local"

export type View = "vender" | "productos" | "caja"

type NavItem = {
  id: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: "vender", label: "Vender", icon: ShoppingCart },
  { id: "panel", label: "Panel", icon: LayoutDashboard },
  { id: "productos", label: "Productos", icon: Package },
  { id: "stock", label: "Stock", icon: Boxes },
  { id: "caja", label: "Caja", icon: Wallet },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "configuracion", label: "Configuración", icon: Settings },
]

export function AppSidebar({
  collapsed,
  onToggle,
  activeView,
  onNavigate,
}: {
  collapsed: boolean
  onToggle: () => void
  activeView: View
  onNavigate: (view: View) => void
}) {
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <ShoppingCart className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">Mostrador</p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              Punto de venta
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className={cn(
            "ml-auto flex size-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "ml-0",
          )}
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive = item.id === activeView
          const isNavigable =
            item.id === "vender" ||
            item.id === "productos" ||
            item.id === "caja"
          return (
          <button
            key={item.id}
            type="button"
            onClick={() => isNavigable && onNavigate(item.id as View)}
            aria-current={isActive ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <item.icon className="size-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-2">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-2 py-2",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
            {inicialUsuario}
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">
                {configLocal.usuario.nombre}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {configLocal.usuario.rol}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              aria-label="Cerrar sesión"
              className="ml-auto flex size-8 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="mt-1 flex w-full items-center justify-center rounded-md py-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
