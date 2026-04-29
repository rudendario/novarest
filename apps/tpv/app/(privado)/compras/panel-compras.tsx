"use client";

import { useCallback, useEffect, useState } from "react";

import { Boton, Input, Tarjeta } from "@el-jardin/ui";

import {
  type PedidoCompra,
  type ProductoProveedorCompra,
  type ProductoSala,
  type ProveedorCompra,
  type RecetaEscandallo,
  actualizarPrecioProductoProveedorCompra,
  anadirLineaEscandallo,
  crearPedidoCompra,
  crearProveedorCompra,
  crearRecetaEscandallo,
  obtenerCosteEscandallo,
  obtenerEscandallos,
  obtenerPedidosCompra,
  obtenerProductosProveedorCompra,
  obtenerProductosSala,
  obtenerProveedoresCompra,
  recepcionarPedidoCompra,
  vincularProductoProveedorCompra,
} from "@/src/cliente-api/sala";

export function PanelCompras() {
  const [proveedores, setProveedores] = useState<ProveedorCompra[]>([]);
  const [productos, setProductos] = useState<ProductoSala[]>([]);
  const [vinculos, setVinculos] = useState<ProductoProveedorCompra[]>([]);
  const [pedidos, setPedidos] = useState<PedidoCompra[]>([]);
  const [recetas, setRecetas] = useState<RecetaEscandallo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [proveedorNombre, setProveedorNombre] = useState("");
  const [proveedorCodigo, setProveedorCodigo] = useState("");

  const [productoId, setProductoId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [precioNuevo, setPrecioNuevo] = useState("100");
  const [unidadesCompraNuevo, setUnidadesCompraNuevo] = useState("1");
  const [precioCambio, setPrecioCambio] = useState<Record<string, string>>({});
  const [lineaVinculoId, setLineaVinculoId] = useState("");
  const [cantidadPedido, setCantidadPedido] = useState("1");
  const [precioPedido, setPrecioPedido] = useState("100");
  const [cantidadRecepcion, setCantidadRecepcion] = useState<Record<string, string>>({});
  const [recetaProductoFinalId, setRecetaProductoFinalId] = useState("");
  const [recetaNombre, setRecetaNombre] = useState("");
  const [recetaIdLinea, setRecetaIdLinea] = useState("");
  const [ingredienteId, setIngredienteId] = useState("");
  const [cantidadIngrediente, setCantidadIngrediente] = useState("1");
  const [estrategiaCoste, setEstrategiaCoste] = useState<"ultimo" | "promedio">("ultimo");
  const [costeReceta, setCosteReceta] = useState<Record<string, number>>({});
  const [margenReceta, setMargenReceta] = useState<Record<string, number>>({});

  const recargar = useCallback(async () => {
    try {
      setError(null);
      const [prov, prod, vin, ped, rec] = await Promise.all([
        obtenerProveedoresCompra(),
        obtenerProductosSala(),
        obtenerProductosProveedorCompra(),
        obtenerPedidosCompra(),
        obtenerEscandallos(),
      ]);
      setProveedores(prov);
      setProductos(prod.filter((p) => !p.eliminadoEn));
      setVinculos(vin);
      setPedidos(ped);
      setRecetas(rec);
      if (!productoId && prod[0]) setProductoId(prod[0].id);
      if (!proveedorId && prov[0]) setProveedorId(prov[0].id);
      if (!lineaVinculoId && vin[0]) setLineaVinculoId(vin[0].id);
      if (!recetaProductoFinalId && prod[0]) setRecetaProductoFinalId(prod[0].id);
      if (!ingredienteId && prod[0]) setIngredienteId(prod[0].id);
      if (!recetaIdLinea && rec[0]) setRecetaIdLinea(rec[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar compras");
    }
  }, [
    ingredienteId,
    lineaVinculoId,
    productoId,
    proveedorId,
    recetaIdLinea,
    recetaProductoFinalId,
  ]);

  useEffect(() => {
    const t = setTimeout(() => void recargar(), 0);
    return () => clearTimeout(t);
  }, [recargar]);

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Compras y proveedores</h1>
          <p className="text-sm text-slate-600">Base Fase 12: proveedores, vinculos y precios.</p>
        </div>
        <Boton variante="secundario" onClick={() => void recargar()}>
          Refrescar
        </Boton>
      </header>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <Tarjeta>
        <h2 className="font-semibold">Nuevo proveedor</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Input
            placeholder="Nombre"
            value={proveedorNombre}
            onChange={(e) => setProveedorNombre(e.target.value)}
          />
          <Input
            placeholder="Codigo"
            value={proveedorCodigo}
            onChange={(e) => setProveedorCodigo(e.target.value)}
          />
          <Boton
            onClick={async () => {
              if (!proveedorNombre.trim() || !proveedorCodigo.trim()) return;
              await crearProveedorCompra({
                nombre: proveedorNombre.trim(),
                codigo: proveedorCodigo.trim(),
              });
              setProveedorNombre("");
              setProveedorCodigo("");
              await recargar();
            }}
          >
            Crear proveedor
          </Boton>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Vincular producto a proveedor</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-4">
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
          >
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
          >
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <Input
            type="number"
            value={precioNuevo}
            onChange={(e) => setPrecioNuevo(e.target.value)}
          />
          <Input
            type="number"
            value={unidadesCompraNuevo}
            onChange={(e) => setUnidadesCompraNuevo(e.target.value)}
          />
          <Boton
            onClick={async () => {
              await vincularProductoProveedorCompra({
                productoId,
                proveedorId,
                unidadesPorCompra: Math.max(1, Math.trunc(Number(unidadesCompraNuevo) || 1)),
                precioActualCentimos: Math.max(1, Math.trunc(Number(precioNuevo) || 1)),
              });
              await recargar();
            }}
          >
            Vincular
          </Boton>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Vinculos activos ({vinculos.length})</h2>
        <div className="mt-2 grid gap-2 text-sm">
          {vinculos.length === 0 ? <p className="text-slate-500">Sin vinculaciones.</p> : null}
          {vinculos.map((v) => (
            <div key={v.id} className="rounded-md border border-slate-200 p-2">
              <p>
                {v.producto.nombre} {"<-"} {v.proveedor.nombre}
              </p>
              <p className="text-slate-500">Precio actual: {v.precioActualCentimos} centimos</p>
              <p className="text-slate-500">Unidades por compra: {v.unidadesPorCompra}</p>
              <div className="mt-2 flex gap-2">
                <Input
                  type="number"
                  value={precioCambio[v.id] ?? v.precioActualCentimos.toString()}
                  onChange={(e) =>
                    setPrecioCambio((prev) => ({
                      ...prev,
                      [v.id]: e.target.value,
                    }))
                  }
                />
                <Boton
                  variante="secundario"
                  onClick={async () => {
                    const precio = Math.max(
                      1,
                      Math.trunc(Number(precioCambio[v.id] ?? v.precioActualCentimos) || 1),
                    );
                    await actualizarPrecioProductoProveedorCompra(v.id, {
                      precioCentimos: precio,
                      motivo: "actualizacion_manual_ui",
                    });
                    await recargar();
                  }}
                >
                  Actualizar precio
                </Boton>
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Crear pedido de compra</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-5">
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
          >
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            value={lineaVinculoId}
            onChange={(e) => setLineaVinculoId(e.target.value)}
          >
            {vinculos
              .filter((v) => v.proveedorId === proveedorId)
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.producto.nombre}
                </option>
              ))}
          </select>
          <Input
            type="number"
            value={cantidadPedido}
            onChange={(e) => setCantidadPedido(e.target.value)}
          />
          <Input
            type="number"
            value={precioPedido}
            onChange={(e) => setPrecioPedido(e.target.value)}
          />
          <Boton
            onClick={async () => {
              if (!proveedorId || !lineaVinculoId) return;
              await crearPedidoCompra({
                proveedorId,
                lineas: [
                  {
                    productoProveedorId: lineaVinculoId,
                    cantidad: Math.max(1, Math.trunc(Number(cantidadPedido) || 1)),
                    precioUnitCentimos: Math.max(1, Math.trunc(Number(precioPedido) || 1)),
                  },
                ],
              });
              await recargar();
            }}
          >
            Crear pedido
          </Boton>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Pedidos de compra ({pedidos.length})</h2>
        <div className="mt-2 grid gap-2 text-sm">
          {pedidos.length === 0 ? <p className="text-slate-500">Sin pedidos de compra.</p> : null}
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="rounded-md border border-slate-200 p-2">
              <p>
                Pedido {pedido.id.slice(0, 8)} - {pedido.proveedor.nombre}
              </p>
              <p className="text-slate-500">
                Estado: {pedido.estado} - Total: {pedido.totalCentimos} centimos
              </p>
              {pedido.lineas.map((linea) => (
                <div key={linea.id} className="mt-2 rounded border border-slate-100 p-2">
                  <p>
                    {linea.productoProveedor.producto.nombre}: {linea.cantidadRecibida}/
                    {linea.cantidad}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <Input
                      type="number"
                      value={cantidadRecepcion[linea.id] ?? "1"}
                      onChange={(e) =>
                        setCantidadRecepcion((prev) => ({
                          ...prev,
                          [linea.id]: e.target.value,
                        }))
                      }
                    />
                    <Boton
                      variante="secundario"
                      onClick={async () => {
                        const cantidad = Math.max(
                          1,
                          Math.trunc(Number(cantidadRecepcion[linea.id] ?? 1) || 1),
                        );
                        await recepcionarPedidoCompra(pedido.id, {
                          lineas: [{ lineaPedidoCompraId: linea.id, cantidadRecibida: cantidad }],
                        });
                        await recargar();
                      }}
                    >
                      Recepcionar
                    </Boton>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Crear receta/escandallo</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-4">
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            value={recetaProductoFinalId}
            onChange={(e) => setRecetaProductoFinalId(e.target.value)}
          >
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <Input
            placeholder="Nombre receta"
            value={recetaNombre}
            onChange={(e) => setRecetaNombre(e.target.value)}
          />
          <Boton
            onClick={async () => {
              if (!recetaProductoFinalId || !recetaNombre.trim()) return;
              await crearRecetaEscandallo({
                productoFinalId: recetaProductoFinalId,
                nombre: recetaNombre.trim(),
                porciones: 1,
                mermaPct: 0,
              });
              setRecetaNombre("");
              await recargar();
            }}
          >
            Crear receta
          </Boton>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Anadir ingrediente a receta</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-4">
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            value={recetaIdLinea}
            onChange={(e) => setRecetaIdLinea(e.target.value)}
          >
            {recetas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            value={ingredienteId}
            onChange={(e) => setIngredienteId(e.target.value)}
          >
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <Input
            type="number"
            value={cantidadIngrediente}
            onChange={(e) => setCantidadIngrediente(e.target.value)}
          />
          <Boton
            onClick={async () => {
              if (!recetaIdLinea || !ingredienteId) return;
              await anadirLineaEscandallo(recetaIdLinea, {
                productoId: ingredienteId,
                cantidadUnidades: Math.max(1, Math.trunc(Number(cantidadIngrediente) || 1)),
                unidadUso: "unidad",
              });
              await recargar();
            }}
          >
            Anadir ingrediente
          </Boton>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Escandallos ({recetas.length})</h2>
        <div className="mt-2 grid gap-2 text-sm">
          {recetas.length === 0 ? <p className="text-slate-500">Sin recetas.</p> : null}
          {recetas.map((r) => (
            <div key={r.id} className="rounded-md border border-slate-200 p-2">
              <p>
                {r.nombre} ({r.productoFinal.nombre})
              </p>
              <p className="text-slate-500">Ingredientes: {r.lineas.length}</p>
              <div className="mt-2 flex gap-2">
                <select
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={estrategiaCoste}
                  onChange={(e) => setEstrategiaCoste(e.target.value as "ultimo" | "promedio")}
                >
                  <option value="ultimo">Costo ultimo</option>
                  <option value="promedio">Costo promedio</option>
                </select>
                <Boton
                  variante="secundario"
                  onClick={async () => {
                    const costo = await obtenerCosteEscandallo(r.id, estrategiaCoste);
                    setCosteReceta((prev) => ({
                      ...prev,
                      [r.id]: costo.resumen.costoPorPorcionCentimos,
                    }));
                    setMargenReceta((prev) => ({ ...prev, [r.id]: costo.resumen.margenCentimos }));
                  }}
                >
                  Calcular coste
                </Boton>
              </div>
              {costeReceta[r.id] !== undefined ? (
                <p className="mt-1 text-slate-600">
                  Coste/porcion: {costeReceta[r.id]} centimos - Margen: {margenReceta[r.id]}{" "}
                  centimos
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Tarjeta>
    </section>
  );
}
