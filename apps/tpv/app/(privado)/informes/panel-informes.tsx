"use client";

import { useCallback, useEffect, useState } from "react";

import { Boton, Input, Tarjeta } from "@el-jardin/ui";

import {
  type InformeComparativa,
  type InformeDesgloseCategoria,
  type InformeDesgloseProducto,
  type InformeDesgloseTurno,
  type InformeResumen,
  type RegistroAuditoria,
  descargarInformeCsv,
  obtenerAuditoria,
  obtenerInformeComparativa,
  obtenerInformeDesgloseCategoria,
  obtenerInformeDesgloseProducto,
  obtenerInformeDesgloseTurno,
  obtenerInformeResumen,
} from "@/src/cliente-api/sala";

export function PanelInformes() {
  const [informe, setInforme] = useState<InformeResumen | null>(null);
  const [porProducto, setPorProducto] = useState<InformeDesgloseProducto | null>(null);
  const [porCategoria, setPorCategoria] = useState<InformeDesgloseCategoria | null>(null);
  const [porTurno, setPorTurno] = useState<InformeDesgloseTurno | null>(null);
  const [comparativa, setComparativa] = useState<InformeComparativa | null>(null);
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargandoCsv, setCargandoCsv] = useState(false);
  const [entidad, setEntidad] = useState("");
  const [accion, setAccion] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const recargar = useCallback(async () => {
    try {
      setError(null);
      const rango = {
        desde: desde ? new Date(desde).toISOString() : undefined,
        hasta: hasta ? new Date(hasta).toISOString() : undefined,
      };
      const [
        resumen,
        logs,
        desgloseProducto,
        desgloseCategoria,
        desgloseTurno,
        comparativaResumen,
      ] = await Promise.all([
        obtenerInformeResumen(rango),
        obtenerAuditoria({
          entidad: entidad || undefined,
          accion: accion || undefined,
          limite: 120,
        }),
        obtenerInformeDesgloseProducto(rango),
        obtenerInformeDesgloseCategoria(rango),
        obtenerInformeDesgloseTurno(rango),
        obtenerInformeComparativa({
          actualDesde: rango.desde,
          actualHasta: rango.hasta,
        }),
      ]);
      setInforme(resumen);
      setAuditoria(logs);
      setPorProducto(desgloseProducto);
      setPorCategoria(desgloseCategoria);
      setPorTurno(desgloseTurno);
      setComparativa(comparativaResumen);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar informes");
    }
  }, [accion, desde, entidad, hasta]);

  const exportarCsv = useCallback(async () => {
    try {
      setCargandoCsv(true);
      setError(null);
      const contenido = await descargarInformeCsv({
        desde: desde ? new Date(desde).toISOString() : undefined,
        hasta: hasta ? new Date(hasta).toISOString() : undefined,
      });
      const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `informe_${new Date().toISOString().slice(0, 10)}.csv`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo exportar CSV");
    } finally {
      setCargandoCsv(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    const t = setTimeout(() => void recargar(), 0);
    return () => clearTimeout(t);
  }, [recargar]);

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Informes y auditoria</h1>
          <p className="text-sm text-slate-600">Resumen operativo y trazabilidad de acciones.</p>
        </div>
        <Boton variante="secundario" onClick={() => void recargar()}>
          Refrescar
        </Boton>
      </header>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {informe ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Tarjeta>
            <h2 className="font-semibold">Ventas</h2>
            <p className="text-sm">Total: {informe.ventas.totalCentimos} centimos</p>
            <p className="text-sm">Efectivo: {informe.ventas.efectivoCentimos}</p>
            <p className="text-sm">Tarjeta: {informe.ventas.tarjetaCentimos}</p>
            <p className="text-sm">Pagos: {informe.ventas.pagos}</p>
          </Tarjeta>
          <Tarjeta>
            <h2 className="font-semibold">Caja</h2>
            <p className="text-sm">Entradas manuales: {informe.caja.entradasManualCentimos}</p>
            <p className="text-sm">Salidas manuales: {informe.caja.salidasManualCentimos}</p>
            <p className="text-sm">Movimientos: {informe.caja.movimientos}</p>
          </Tarjeta>
          <Tarjeta>
            <h2 className="font-semibold">Stock</h2>
            <p className="text-sm">Consumo: {informe.stock.consumoUnidades}</p>
            <p className="text-sm">Recepcion: {informe.stock.recepcionUnidades}</p>
            <p className="text-sm">Movimientos: {informe.stock.movimientos}</p>
          </Tarjeta>
        </div>
      ) : null}

      {comparativa ? (
        <Tarjeta>
          <h2 className="font-semibold">Comparativa de ventas</h2>
          <p className="mt-2 text-sm">
            Actual: {comparativa.actual.totalCentimos} centimos ({comparativa.actual.pagos} pagos)
          </p>
          <p className="text-sm">
            Previo: {comparativa.previo.totalCentimos} centimos ({comparativa.previo.pagos} pagos)
          </p>
          <p className="text-sm">
            Delta: {comparativa.comparativa.deltaCentimos} centimos (
            {comparativa.comparativa.deltaPct}%)
          </p>
        </Tarjeta>
      ) : null}

      <Tarjeta>
        <h2 className="font-semibold">Rango de fechas</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Input type="datetime-local" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input type="datetime-local" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <div className="flex gap-2">
            <Boton onClick={() => void recargar()}>Aplicar rango</Boton>
            <Boton variante="secundario" onClick={() => void exportarCsv()} disabled={cargandoCsv}>
              {cargandoCsv ? "Exportando..." : "Exportar CSV"}
            </Boton>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Filtros de auditoria</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Input
            placeholder="Entidad"
            value={entidad}
            onChange={(e) => setEntidad(e.target.value)}
          />
          <Input placeholder="Accion" value={accion} onChange={(e) => setAccion(e.target.value)} />
          <Boton onClick={() => void recargar()}>Aplicar</Boton>
        </div>
      </Tarjeta>

      <div className="grid gap-3 md:grid-cols-3">
        <Tarjeta>
          <h2 className="font-semibold">Ventas por producto</h2>
          <div className="mt-2 grid gap-1 text-sm">
            {(porProducto?.items ?? []).slice(0, 8).map((i) => (
              <p key={i.productoId}>
                {i.nombre}: {i.unidades} uds / {i.ventaCentimos} cent
              </p>
            ))}
          </div>
        </Tarjeta>
        <Tarjeta>
          <h2 className="font-semibold">Ventas por categoria</h2>
          <div className="mt-2 grid gap-1 text-sm">
            {(porCategoria?.items ?? []).slice(0, 8).map((i) => (
              <p key={i.categoriaId}>
                {i.nombre}: {i.unidades} uds / {i.ventaCentimos} cent
              </p>
            ))}
          </div>
        </Tarjeta>
        <Tarjeta>
          <h2 className="font-semibold">Ventas por turno</h2>
          <div className="mt-2 grid gap-1 text-sm">
            {(porTurno?.items ?? []).map((i) => (
              <p key={i.turno}>
                {i.turno}: {i.pagos} pagos / {i.ventaCentimos} cent
              </p>
            ))}
          </div>
        </Tarjeta>
      </div>

      <Tarjeta>
        <h2 className="font-semibold">Auditoria ({auditoria.length})</h2>
        <div className="mt-2 grid gap-2 text-sm">
          {auditoria.length === 0 ? <p className="text-slate-500">Sin registros.</p> : null}
          {auditoria.map((r) => (
            <div key={r.id} className="rounded-md border border-slate-200 p-2">
              <p>
                {r.entidad} - {r.accion}
              </p>
              <p className="text-slate-500">
                {r.rolNombre} - {new Date(r.creadoEn).toLocaleString("es-ES")}
              </p>
            </div>
          ))}
        </div>
      </Tarjeta>
    </section>
  );
}
