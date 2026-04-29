"use client";

import { useCallback, useEffect, useState } from "react";

import { Boton, Input, Tarjeta } from "@el-jardin/ui";

import {
  type DisponibilidadStock,
  type ResultadoInvariantesStock,
  ajustarStock,
  obtenerDisponibilidadStock,
  validarInvariantesStock,
} from "@/src/cliente-api/sala";

export function PanelStock() {
  const [filas, setFilas] = useState<DisponibilidadStock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [deltaPorProducto, setDeltaPorProducto] = useState<Record<string, string>>({});
  const [invariantes, setInvariantes] = useState<ResultadoInvariantesStock | null>(null);

  const recargar = useCallback(async () => {
    try {
      setError(null);
      setFilas(await obtenerDisponibilidadStock());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar stock");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void recargar();
    }, 0);
    return () => clearTimeout(timer);
  }, [recargar]);

  async function aplicarAjuste(productoId: string) {
    const delta = Number(deltaPorProducto[productoId] ?? "0");
    if (!Number.isFinite(delta) || delta === 0) return;

    setAccion(productoId);
    try {
      await ajustarStock({
        productoId,
        cantidadDelta: Math.trunc(delta),
        motivo: "ajuste_manual_ui_stock",
      });
      setDeltaPorProducto((prev) => ({ ...prev, [productoId]: "" }));
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo ajustar stock");
    } finally {
      setAccion(null);
    }
  }

  async function revisarInvariantes() {
    setAccion("invariantes");
    try {
      setError(null);
      setInvariantes(await validarInvariantesStock());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo validar invariantes");
    } finally {
      setAccion(null);
    }
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Stock operativo</h1>
          <p className="text-sm text-slate-600">
            Disponibilidad, reservas activas y ajustes manuales.
          </p>
        </div>
        <Boton onClick={() => void recargar()} variante="secundario">
          Refrescar
        </Boton>
      </header>
      <div className="flex gap-2">
        <Boton
          disabled={accion === "invariantes"}
          onClick={() => void revisarInvariantes()}
          variante="secundario"
        >
          Validar invariantes
        </Boton>
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {invariantes ? (
        <Tarjeta>
          <p className="text-sm font-medium">
            Invariantes: {invariantes.ok ? "OK" : "Con incidencias"} (revisados:{" "}
            {invariantes.revisados})
          </p>
          {invariantes.incidencias.map((item) => (
            <p className="mt-1 text-xs text-rose-700" key={item.productoId}>
              {item.productoId}: {item.mensaje} (fisico {item.cantidadFisica} / reservado{" "}
              {item.cantidadReservada})
            </p>
          ))}
        </Tarjeta>
      ) : null}

      {filas.length === 0 ? (
        <Tarjeta>
          <p className="text-sm text-slate-600">Sin productos para stock.</p>
        </Tarjeta>
      ) : (
        <div className="grid gap-3">
          {filas.map((fila) => (
            <Tarjeta key={fila.productoId}>
              <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_1.2fr_auto] md:items-center">
                <p className="font-medium">{fila.nombre}</p>
                <p className="text-sm">Fisico: {fila.cantidadFisica}</p>
                <p className="text-sm">Reservado: {fila.cantidadReservada}</p>
                <p className="text-sm">Libre: {fila.cantidadLibre}</p>
                <Input
                  onChange={(e) =>
                    setDeltaPorProducto((prev) => ({ ...prev, [fila.productoId]: e.target.value }))
                  }
                  placeholder="Delta (+/-)"
                  type="number"
                  value={deltaPorProducto[fila.productoId] ?? ""}
                />
                <Boton
                  disabled={
                    accion === fila.productoId || !(deltaPorProducto[fila.productoId] ?? "").trim()
                  }
                  onClick={() => void aplicarAjuste(fila.productoId)}
                  variante="secundario"
                >
                  Ajustar
                </Boton>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </section>
  );
}
