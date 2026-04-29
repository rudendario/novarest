"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Boton, Input, Tarjeta } from "@el-jardin/ui";

import {
  type CajaActiva,
  type InformeCaja,
  abrirCaja,
  cerrarCaja,
  obtenerEstadoCaja,
  obtenerInformeCaja,
  registrarMovimientoManualCaja,
} from "@/src/cliente-api/sala";

function euros(centimos: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    centimos / 100,
  );
}

export function PanelCaja() {
  const [caja, setCaja] = useState<CajaActiva | null>(null);
  const [informe, setInforme] = useState<InformeCaja | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saldoInicial, setSaldoInicial] = useState("0");
  const [saldoFinal, setSaldoFinal] = useState("0");
  const [movCantidad, setMovCantidad] = useState("0");
  const [movMotivo, setMovMotivo] = useState("ajuste manual de caja");
  const [movMetodo, setMovMetodo] = useState<"efectivo" | "tarjeta">("efectivo");
  const [movTipo, setMovTipo] = useState<"entrada_manual" | "salida_manual">("entrada_manual");
  const [accion, setAccion] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setError(null);
      const data = await obtenerEstadoCaja();
      setCaja(data.caja);
      if (data.caja) {
        setSaldoFinal(String(data.caja.saldoInicial + data.caja.totalEfectivo));
        const reporte = await obtenerInformeCaja();
        setInforme(reporte.informe);
      } else {
        setInforme(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar caja");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void recargar();
    }, 0);
    return () => clearTimeout(t);
  }, [recargar]);

  const esperado = useMemo(() => {
    if (!caja) return 0;
    return caja.saldoInicial + caja.totalEfectivo;
  }, [caja]);

  async function onAbrir() {
    const valor = Math.max(0, Math.trunc(Number(saldoInicial) || 0));
    setAccion("abrir");
    try {
      await abrirCaja({ saldoInicial: valor });
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir caja");
    } finally {
      setAccion(null);
    }
  }

  async function onCerrar() {
    const valor = Math.max(0, Math.trunc(Number(saldoFinal) || 0));
    setAccion("cerrar");
    try {
      await cerrarCaja({ saldoFinal: valor, motivo: "cierre_turno_ui" });
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cerrar caja");
    } finally {
      setAccion(null);
    }
  }

  async function onMovimientoManual() {
    const cantidad = Math.max(1, Math.trunc(Number(movCantidad) || 0));
    setAccion("movimiento");
    try {
      await registrarMovimientoManualCaja({
        tipo: movTipo,
        metodo: movMetodo,
        cantidad,
        motivo: movMotivo,
      });
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar movimiento manual");
    } finally {
      setAccion(null);
    }
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Caja</h1>
          <p className="text-sm text-slate-600">Apertura, control de efectivo/tarjeta y cierre.</p>
        </div>
        <Boton onClick={() => void recargar()} variante="secundario">
          Refrescar
        </Boton>
      </header>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {!caja ? (
        <Tarjeta>
          <h2 className="font-semibold">Sin caja abierta</h2>
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
            />
            <Boton disabled={accion === "abrir"} onClick={() => void onAbrir()}>
              Abrir caja
            </Boton>
          </div>
        </Tarjeta>
      ) : (
        <>
          <Tarjeta>
            <h2 className="font-semibold">Caja abierta</h2>
            <p className="text-sm">Saldo inicial: {euros(caja.saldoInicial)}</p>
            <p className="text-sm">Total efectivo cobrado: {euros(caja.totalEfectivo)}</p>
            <p className="text-sm">Total tarjeta cobrado: {euros(caja.totalTarjeta)}</p>
            <p className="text-sm font-medium">Esperado en caja: {euros(esperado)}</p>

            <div className="mt-3 flex items-center gap-2">
              <Input
                type="number"
                value={saldoFinal}
                onChange={(e) => setSaldoFinal(e.target.value)}
              />
              <Boton disabled={accion === "cerrar"} onClick={() => void onCerrar()}>
                Cerrar caja
              </Boton>
            </div>
          </Tarjeta>

          <Tarjeta>
            <h2 className="font-semibold">Movimiento manual</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              <select
                className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                value={movTipo}
                onChange={(e) => setMovTipo(e.target.value as "entrada_manual" | "salida_manual")}
              >
                <option value="entrada_manual">Entrada manual</option>
                <option value="salida_manual">Salida manual</option>
              </select>
              <select
                className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                value={movMetodo}
                onChange={(e) => setMovMetodo(e.target.value as "efectivo" | "tarjeta")}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
              <Input
                type="number"
                value={movCantidad}
                onChange={(e) => setMovCantidad(e.target.value)}
              />
              <Input value={movMotivo} onChange={(e) => setMovMotivo(e.target.value)} />
            </div>
            <div className="mt-3">
              <Boton disabled={accion === "movimiento"} onClick={() => void onMovimientoManual()}>
                Registrar movimiento
              </Boton>
            </div>
          </Tarjeta>

          {informe ? (
            <Tarjeta>
              <h2 className="font-semibold">Informe de turno</h2>
              <p className="text-sm">Pagos registrados: {informe.resumen.totalPagos}</p>
              <p className="text-sm">Movimientos registrados: {informe.resumen.totalMovimientos}</p>
              <p className="text-sm font-medium">
                Saldo esperado: {euros(informe.resumen.saldoEsperado)}
              </p>
            </Tarjeta>
          ) : null}
        </>
      )}
    </section>
  );
}
