"use client";

import { useCallback, useEffect, useState } from "react";

import { Boton, Input, Tarjeta } from "@el-jardin/ui";

import {
  type ImpresoraTpv,
  type TrabajoImpresion,
  crearImpresora,
  enviarTrabajoImpresion,
  obtenerImpresoras,
  obtenerTrabajosImpresion,
  procesarPendientesImpresion,
  reintentarTrabajoImpresion,
} from "@/src/cliente-api/sala";

export function PanelImpresoras() {
  const [impresoras, setImpresoras] = useState<ImpresoraTpv[]>([]);
  const [trabajos, setTrabajos] = useState<TrabajoImpresion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [endpoint, setEndpoint] = useState("");

  const recargar = useCallback(async () => {
    try {
      setError(null);
      const [imp, trab] = await Promise.all([obtenerImpresoras(), obtenerTrabajosImpresion()]);
      setImpresoras(imp);
      setTrabajos(trab);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar impresoras");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void recargar();
    }, 0);
    return () => clearTimeout(t);
  }, [recargar]);

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Impresoras y cola</h1>
          <p className="text-sm text-slate-600">
            Gestion de impresoras por zona y fallos de impresion.
          </p>
        </div>
        <Boton onClick={() => void recargar()} variante="secundario">
          Refrescar
        </Boton>
      </header>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <Tarjeta>
        <h2 className="font-semibold">Nueva impresora</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input
            placeholder="Endpoint (opcional)"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
          <Boton
            onClick={async () => {
              if (!nombre.trim()) return;
              await crearImpresora({
                nombre: nombre.trim(),
                endpoint: endpoint.trim() || undefined,
              });
              setNombre("");
              setEndpoint("");
              await recargar();
            }}
          >
            Crear impresora
          </Boton>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Prueba de impresion</h2>
        <div className="flex gap-2">
          <Boton
            onClick={async () => {
              await enviarTrabajoImpresion({
                tipoTicket: "prueba",
                referenciaTipo: "prueba_manual",
                contenido: { mensaje: "Prueba manual de impresion" },
              });
              await recargar();
            }}
          >
            Enviar prueba
          </Boton>
          <Boton
            variante="secundario"
            onClick={async () => {
              await procesarPendientesImpresion(20);
              await recargar();
            }}
          >
            Reprocesar cola
          </Boton>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Impresoras ({impresoras.length})</h2>
        <div className="mt-2 grid gap-2 text-sm">
          {impresoras.length === 0 ? <p className="text-slate-500">Sin impresoras.</p> : null}
          {impresoras.map((impresora) => (
            <div key={impresora.id} className="rounded-md border border-slate-200 p-2">
              <p>{impresora.nombre}</p>
              <p className="text-slate-500">
                {impresora.activa ? "activa" : "inactiva"} - prioridad {impresora.prioridad}
              </p>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Ultimos trabajos ({trabajos.length})</h2>
        <div className="mt-2 grid gap-2 text-sm">
          {trabajos.length === 0 ? <p className="text-slate-500">Sin trabajos.</p> : null}
          {trabajos.slice(0, 30).map((trabajo) => (
            <div key={trabajo.id} className="rounded-md border border-slate-200 p-2">
              <p>
                {trabajo.tipoTicket} - {trabajo.estado}
              </p>
              <p className="text-slate-500">{new Date(trabajo.creadoEn).toLocaleString("es-ES")}</p>
              {trabajo.errorDetalle ? (
                <p className="text-rose-700">Error: {trabajo.errorDetalle}</p>
              ) : null}
              {trabajo.estado === "error" || trabajo.estado === "pendiente" ? (
                <div className="mt-2">
                  <Boton
                    variante="secundario"
                    onClick={async () => {
                      await reintentarTrabajoImpresion(trabajo.id);
                      await recargar();
                    }}
                  >
                    Reintentar
                  </Boton>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Tarjeta>
    </section>
  );
}
