import Link from "next/link";

import { Boton, Tarjeta } from "@el-jardin/ui";

export default function InicioPublico() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Tarjeta className="p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Web publica</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Carta online actualizada</h2>
        <p className="mt-2 text-sm text-slate-600">
          Consulta platos, categorias y alergenos sincronizados con TPV.
        </p>
        <div className="mt-4">
          <Link href="/carta">
            <Boton>Ver carta</Boton>
          </Link>
        </div>
      </Tarjeta>
      <Tarjeta className="p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
          Servicio diario
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Menu del dia</h2>
        <p className="mt-2 text-sm text-slate-600">Explora cursos y platos publicados para hoy.</p>
        <div className="mt-4">
          <Link href="/menu-dia">
            <Boton variante="secundario">Ver menu</Boton>
          </Link>
        </div>
      </Tarjeta>
    </section>
  );
}
