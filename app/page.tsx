"use client"

import { useState } from "react"
import { Menu, ShoppingCart } from "lucide-react"
import { AppSidebar, type View } from "@/components/pos/app-sidebar"
import { ScreenHeader } from "@/components/pos/screen-header"
import { SellScreen } from "@/components/pos/sell-screen"
import { ProductsScreen } from "@/components/pos/products-screen"
import { CashCloseScreen } from "@/components/pos/cash-close-screen"
import { SessionProvider } from "@/lib/session-store"

export default function Page() {
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState<View>("vender")
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Fondo oscuro del cajón (solo mobile, cuando está abierto) */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden"
          />
        )}

        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          activeView={view}
          onNavigate={(v) => {
            setView(v)
            setMobileOpen(false)
          }}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          {/* Barra superior con hamburguesa (solo mobile) */}
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(true)}
              className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <ShoppingCart className="size-4" />
              </div>
              <span className="text-sm font-semibold text-foreground">Mostrador</span>
            </div>
          </div>

          {view === "vender" && (
            <>
              <ScreenHeader />
              <SellScreen />
            </>
          )}
          {view === "productos" && <ProductsScreen />}
          {view === "caja" && <CashCloseScreen />}
        </main>
      </div>
    </SessionProvider>
  )
}
