"use client"

import { useState } from "react"
import { AppSidebar, type View } from "@/components/pos/app-sidebar"
import { ScreenHeader } from "@/components/pos/screen-header"
import { SellScreen } from "@/components/pos/sell-screen"
import { ProductsScreen } from "@/components/pos/products-screen"
import { CashCloseScreen } from "@/components/pos/cash-close-screen"
import { SessionProvider } from "@/lib/session-store"

export default function Page() {
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState<View>("vender")

  return (
    <SessionProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          activeView={view}
          onNavigate={setView}
        />
        <main className="flex min-w-0 flex-1 flex-col">
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
