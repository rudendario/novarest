import Link from "next/link";

import { Boton, Tarjeta } from "@el-jardin/ui";

export default function PaginaInicioPrivado() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Tarjeta>
        <h1 className="text-base font-semibold">Backoffice inicial</h1>
        <p className="mt-1 text-sm text-slate-600">Sesion validada para rutas privadas.</p>
        <div className="mt-3">
          <Link href="/sala">
            <Boton>Ir a sala</Boton>
          </Link>
        </div>
      </Tarjeta>
      <Tarjeta>
        <h2 className="text-base font-semibold">Carta</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gestion via API privada lista para UI de formularios.
        </p>
      </Tarjeta>
      <Tarjeta>
        <h2 className="text-base font-semibold">Menu</h2>
        <p className="mt-1 text-sm text-slate-600">
          Publicacion/despublicacion auditada habilitada.
        </p>
      </Tarjeta>
    </section>
  );
}
