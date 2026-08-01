"use client"

import { Lock } from "lucide-react"

// Pantalla para las secciones que todavía no están construidas (Panel, Stock,
// Reportes, Clientes, Configuración). En vez de un clic muerto, muestra un
// candado y un mensaje honesto: está en el plan, no en la demo.
export function ComingSoonScreen({ nombre }: { nombre: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Lock className="size-7 text-muted-foreground" />
      </div>
      <div className="max-w-sm">
        <h2 className="text-xl font-semibold text-foreground">{nombre}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-balance">
          Esta sección todavía no está disponible en la demo. Es parte del sistema
          completo — consultá para activarla en tu local.
        </p>
      </div>
    </div>
  )
}
