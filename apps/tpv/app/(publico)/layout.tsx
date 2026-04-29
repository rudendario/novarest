import type { Metadata } from "next";
import Link from "next/link";

import { obtenerNegocioPublicoApi } from "@/src/cliente-api/publico";

export const metadata: Metadata = {
  title: "TPV El Jardin",
  description: "Carta y menu del dia",
};

export default async function LayoutPublico({ children }: { children: React.ReactNode }) {
  let nombre = "TPV El Jardin";

  try {
    const negocio = await obtenerNegocioPublicoApi();
    nombre = negocio.nombreComercial;
  } catch {
    nombre = "TPV El Jardin";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold tracking-tight">{nombre}</h1>
          <nav
            aria-label="Navegacion publica principal"
            className="flex items-center gap-3 text-sm"
          >
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/">
              Inicio
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/carta">
              Carta
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/menu-dia">
              Menu del dia
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="contenido-principal">
        {children}
      </main>
    </div>
  );
}
