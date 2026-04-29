"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Boton, Tarjeta } from "@el-jardin/ui";

import { conectarRealtime } from "@/src/cliente-api/realtime";
import { type MesaSala, actualizarEstadoLinea, obtenerMesasSala } from "@/src/cliente-api/sala";

type Destino = "cocina" | "barra";

function siguiente(estado: string) {
  if (estado === "confirmada") return "en_preparacion" as const;
  if (estado === "en_preparacion") return "lista" as const;
  if (estado === "lista") return "servida" as const;
  return null;
}

export function PanelProduccion({ destino }: { destino: Destino }) {
  const [mesas, setMesas] = useState<MesaSala[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setError(null);
      setMesas(await obtenerMesasSala());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar produccion");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void recargar();
    }, 0);

    return () => clearTimeout(timer);
  }, [recargar]);

  useEffect(() => {
    const desconectar = conectarRealtime({
      canales: [destino],
      onEvento: () => {
        void recargar();
      },
    });

    return () => desconectar();
  }, [destino, recargar]);

  const lineas = useMemo(() => {
    return mesas.flatMap((mesa) => {
      const pedido = mesa.pedidoActivo;
      if (!pedido)
        return [] as Array<{
          mesa: string;
          pedidoId: string;
          lineaId: string;
          nombre: string;
          cantidad: number;
          estado: string;
        }>;

      return pedido.lineas
        .filter((linea) => {
          const destinoLinea = linea.producto.destinoPreparacion;
          const aplicaDestino = destinoLinea === destino || destinoLinea === "ambos";
          return aplicaDestino && linea.estado !== "cancelada" && linea.estado !== "servida";
        })
        .map((linea) => ({
          mesa: mesa.nombre,
          pedidoId: pedido.id,
          lineaId: linea.id,
          nombre: linea.nombreSnapshot,
          cantidad: linea.cantidad,
          estado: linea.estado,
        }));
    });
  }, [destino, mesas]);

  async function avanzar(item: { pedidoId: string; lineaId: string; estado: string }) {
    const estadoDestino = siguiente(item.estado);
    if (!estadoDestino) return;
    setAccion(item.lineaId);
    try {
      await actualizarEstadoLinea(item.pedidoId, item.lineaId, estadoDestino);
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo avanzar linea");
    } finally {
      setAccion(null);
    }
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{destino === "cocina" ? "Cocina" : "Barra"}</h1>
          <p className="text-sm text-slate-600">Vista en vivo por canal realtime {destino}.</p>
        </div>
        <Boton onClick={() => void recargar()} variante="secundario">
          Refrescar
        </Boton>
      </header>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {lineas.length === 0 ? (
        <Tarjeta>
          <p className="text-sm text-slate-600">Sin lineas pendientes para este destino.</p>
        </Tarjeta>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lineas.map((linea) => (
            <Tarjeta key={linea.lineaId}>
              <p className="text-xs text-slate-500">Mesa {linea.mesa}</p>
              <h2 className="mt-1 text-base font-semibold">
                {linea.cantidad} x {linea.nombre}
              </h2>
              <p className="mt-1 text-sm text-slate-600">Estado: {linea.estado}</p>
              <div className="mt-3">
                <Boton
                  disabled={accion === linea.lineaId || !siguiente(linea.estado)}
                  onClick={() => void avanzar(linea)}
                >
                  Avanzar
                </Boton>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </section>
  );
}
