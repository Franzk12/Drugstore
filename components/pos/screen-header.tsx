"use client"

import { useEffect, useState } from "react"
import { CircleDot, Store } from "lucide-react"
import { configLocal } from "@/lib/config-local"

export function ScreenHeader() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const fecha = now
    ? now.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : ""
  const hora = now
    ? now.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--"

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-2">
        <Store className="size-5 text-muted-foreground" />
        <h1 className="text-base font-semibold text-foreground">
          {configLocal.nombreLocal}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
        <CircleDot className="size-3.5 text-primary" />
        Caja abierta
      </div>

      <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
        <span className="capitalize">{fecha}</span>
        <span className="font-mono tabular-nums text-foreground">{hora}</span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <span className="text-muted-foreground/60">Cajero:</span>
          <span className="font-medium text-foreground">
            {configLocal.usuario.nombre}
          </span>
        </span>
      </div>
    </header>
  )
}
