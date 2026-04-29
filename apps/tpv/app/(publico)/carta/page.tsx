import { BadgeEstado, EstadoVacio, Tarjeta } from "@el-jardin/ui";

import { obtenerCartaPublicaApi } from "@/src/cliente-api/publico";

type SearchParams = Promise<{ categoria?: string; alergeno?: string }>;

export default async function PaginaCarta({ searchParams }: { searchParams: SearchParams }) {
  const filtros = await searchParams;

  let carta: Awaited<ReturnType<typeof obtenerCartaPublicaApi>> | null = null;
  try {
    carta = await obtenerCartaPublicaApi();
  } catch {
    carta = null;
  }

  if (!carta) {
    return (
      <EstadoVacio
        titulo="No se pudo cargar la carta"
        detalle="Intenta de nuevo en unos segundos."
      />
    );
  }

  const platosFiltrados = carta.platos.filter((plato) => {
    const coincideCategoria = filtros.categoria ? plato.categoria.slug === filtros.categoria : true;
    const coincideAlergeno = filtros.alergeno
      ? plato.alergenos.some(
          (alergeno) => alergeno.toLowerCase() === filtros.alergeno?.toLowerCase(),
        )
      : true;

    return coincideCategoria && coincideAlergeno;
  });

  const alergenosDisponibles = Array.from(
    new Set(
      carta.platos.flatMap((plato) => plato.alergenos.map((alergeno) => alergeno.toLowerCase())),
    ),
  ).sort();

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">Carta</h2>
        <p className="text-sm text-slate-600">Filtra por categoria o alergeno.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <a className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm" href="/carta">
          Todas
        </a>
        {carta.categorias.map((categoria) => (
          <a
            key={categoria.id}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm"
            href={`/carta?categoria=${categoria.slug}`}
          >
            {categoria.nombre}
          </a>
        ))}
        {alergenosDisponibles.map((alergeno) => (
          <a
            key={alergeno}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-sm"
            href={`/carta?alergeno=${alergeno}`}
          >
            sin {alergeno}
          </a>
        ))}
      </div>

      {platosFiltrados.length === 0 ? (
        <EstadoVacio
          titulo="No hay platos con esos filtros"
          detalle="Prueba con otra categoria o alergeno."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platosFiltrados.map((plato) => (
            <Tarjeta className="grid gap-3" key={plato.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">{plato.nombre}</h3>
                <BadgeEstado estado={plato.estadoPublico} />
              </div>
              <p className="text-sm text-slate-600">{plato.descripcion ?? "Sin descripcion"}</p>
              <p className="text-sm text-slate-500">Categoria: {plato.categoria.nombre}</p>
              <p className="text-sm text-slate-500">
                Alergenos: {plato.alergenos.length > 0 ? plato.alergenos.join(", ") : "ninguno"}
              </p>
              <p className="text-lg font-semibold text-emerald-700">
                {(plato.precioCentimos / 100).toFixed(2)} EUR
              </p>
            </Tarjeta>
          ))}
        </div>
      )}
    </section>
  );
}
