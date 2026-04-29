"use client";

import { useCallback, useEffect, useState } from "react";

import { Boton, Tarjeta } from "@el-jardin/ui";

import { conectarRealtime } from "@/src/cliente-api/realtime";
import {
  type SolicitudCancelacion,
  obtenerSolicitudesCancelacion,
  resolverSolicitudCancelacion,
} from "@/src/cliente-api/sala";

export function PanelCancelaciones() {
  const [solicitudes, setSolicitudes] = useState<SolicitudCancelacion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setError(null);
      setSolicitudes(await obtenerSolicitudesCancelacion());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar cola");
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
      canales: ["admin", "sala"],
      onEvento: () => {
        void recargar();
      },
    });

    return () => desconectar();
  }, [recargar]);

  async function resolver(id: string, aprobada: boolean) {
    const motivoResolucion = aprobada ? "Aprobada por supervisor" : "Rechazada por supervisor";

    setAccion(id);
    try {
      await resolverSolicitudCancelacion(id, { aprobada, motivoResolucion });
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo resolver solicitud");
    } finally {
      setAccion(null);
    }
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cola de cancelaciones</h1>
          <p className="text-sm text-slate-600">Aprobacion/rechazo de solicitudes pendientes.</p>
        </div>
        <Boton onClick={() => void recargar()} variante="secundario">
          Refrescar
        </Boton>
      </header>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {solicitudes.length === 0 ? (
        <Tarjeta>
          <p className="text-sm text-slate-600">No hay solicitudes pendientes.</p>
        </Tarjeta>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {solicitudes.map((solicitud) => (
            <Tarjeta key={solicitud.id}>
              <p className="text-xs text-slate-500">Pedido {solicitud.pedidoId.slice(0, 8)}</p>
              <p className="mt-1 text-sm">Motivo: {solicitud.motivo}</p>
              <p className="mt-1 text-xs text-slate-500">
                Creada: {new Date(solicitud.creadaEn).toLocaleString("es-ES")}
              </p>
              <div className="mt-3 flex gap-2">
                <Boton
                  disabled={accion === solicitud.id}
                  onClick={() => void resolver(solicitud.id, true)}
                >
                  Aprobar
                </Boton>
                <Boton
                  disabled={accion === solicitud.id}
                  onClick={() => void resolver(solicitud.id, false)}
                  variante="fantasma"
                >
                  Rechazar
                </Boton>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </section>
  );
}
