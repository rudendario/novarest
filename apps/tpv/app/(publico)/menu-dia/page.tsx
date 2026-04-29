import { EstadoVacio, Tarjeta } from "@el-jardin/ui";

import { obtenerMenuDiaPublicoApi } from "@/src/cliente-api/publico";

export default async function PaginaMenuDia() {
  let menu: Awaited<ReturnType<typeof obtenerMenuDiaPublicoApi>> | null = null;

  try {
    menu = await obtenerMenuDiaPublicoApi();
  } catch {
    menu = null;
  }

  if (!menu) {
    return (
      <EstadoVacio titulo="Menu del dia no disponible" detalle="No hay menu publicado para hoy." />
    );
  }

  return (
    <section className="grid gap-6">
      <header className="grid gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Menu del dia</h2>
        <p className="text-sm text-slate-600">{menu.fecha}</p>
        <p className="text-base text-slate-700">{menu.titulo}</p>
        {menu.descripcion ? <p className="text-sm text-slate-500">{menu.descripcion}</p> : null}
        <p className="text-lg font-semibold text-emerald-700">
          {(menu.precioCentimos / 100).toFixed(2)} EUR
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {menu.cursos.map((curso) => (
          <Tarjeta className="grid gap-3" key={`${curso.nombre}-${curso.orden}`}>
            <h3 className="text-base font-semibold">{curso.nombre}</h3>
            {curso.platos.length === 0 ? (
              <p className="text-sm text-slate-500">Sin platos publicados en este curso.</p>
            ) : (
              <ul className="grid gap-2">
                {curso.platos.map((plato) => (
                  <li className="rounded-lg bg-slate-50 p-2" key={plato.id}>
                    <p className="text-sm font-medium">{plato.nombre}</p>
                    <p className="text-xs text-slate-500">
                      {plato.descripcion ?? "Sin descripcion"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        ))}
      </div>
    </section>
  );
}
