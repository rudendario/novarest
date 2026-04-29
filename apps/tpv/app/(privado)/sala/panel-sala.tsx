"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Boton, Tarjeta } from "@el-jardin/ui";

import { conectarRealtime } from "@/src/cliente-api/realtime";
import {
  type MesaSala,
  type ProductoSala,
  abrirPedidoMesa,
  actualizarEstadoLinea,
  anadirLineaPedido,
  cobrarPedido,
  enviarPedido,
  fusionarMesa,
  imprimirPrecuentaPedido,
  imprimirProduccionPedido,
  imprimirReciboPedido,
  obtenerMesasSala,
  obtenerPrecuentaPedido,
  obtenerProductosSala,
  obtenerTicketPedido,
  solicitarCancelacionLinea,
  transferirMesa,
} from "@/src/cliente-api/sala";

type EstadoUI = {
  cargando: boolean;
  error: string | null;
  accion: string | null;
};

function formatearEuros(centimos: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(centimos / 100);
}

function siguienteEstadoLinea(estado: string) {
  if (estado === "confirmada") return "en_preparacion";
  if (estado === "en_preparacion") return "lista";
  if (estado === "lista") return "servida";
  return null;
}

export function PanelSala() {
  const [mesas, setMesas] = useState<MesaSala[]>([]);
  const [productos, setProductos] = useState<ProductoSala[]>([]);
  const [productoPorPedido, setProductoPorPedido] = useState<Record<string, string>>({});
  const [cantidadPorPedido, setCantidadPorPedido] = useState<Record<string, number>>({});
  const [destinoPorMesa, setDestinoPorMesa] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<EstadoUI>({ cargando: true, error: null, accion: null });

  const recargar = useCallback(async () => {
    setEstado((prev) => ({ ...prev, cargando: true, error: null }));
    try {
      const [mesasData, productosData] = await Promise.all([
        obtenerMesasSala(),
        obtenerProductosSala(),
      ]);
      setMesas(mesasData);
      setProductos(productosData.filter((producto) => !producto.eliminadoEn));
      setEstado({ cargando: false, error: null, accion: null });
    } catch (e) {
      setEstado({
        cargando: false,
        error: e instanceof Error ? e.message : "No se pudo cargar sala",
        accion: null,
      });
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const desconectar = conectarRealtime({
      canales: ["sala"],
      onEvento: () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          void recargar();
        }, 150);
      },
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      desconectar();
    };
  }, [recargar]);

  const mesasPorZona = useMemo(() => {
    const mapa = new Map<string, { zona: MesaSala["zona"]; mesas: MesaSala[] }>();
    for (const mesa of mesas) {
      const existente = mapa.get(mesa.zonaId);
      if (existente) {
        existente.mesas.push(mesa);
      } else {
        mapa.set(mesa.zonaId, { zona: mesa.zona, mesas: [mesa] });
      }
    }

    return Array.from(mapa.values()).sort((a, b) => a.zona.orden - b.zona.orden);
  }, [mesas]);

  async function onAbrirMesa(mesaId: string) {
    /* ... */
    setEstado((prev) => ({ ...prev, accion: `abrir:${mesaId}`, error: null }));
    try {
      await abrirPedidoMesa(mesaId);
      await recargar();
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        accion: null,
        error: e instanceof Error ? e.message : "No se pudo abrir mesa",
      }));
    }
  }
  async function onAnadirLinea(pedidoId: string) {
    const productoId = productoPorPedido[pedidoId] ?? productos[0]?.id;
    const cantidad = cantidadPorPedido[pedidoId] ?? 1;
    if (!productoId) return;
    setEstado((prev) => ({ ...prev, accion: `linea:${pedidoId}`, error: null }));
    try {
      await anadirLineaPedido(pedidoId, { productoId, cantidad });
      await recargar();
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        accion: null,
        error: e instanceof Error ? e.message : "No se pudo anadir linea",
      }));
    }
  }
  async function onEnviarPedido(pedidoId: string) {
    setEstado((prev) => ({ ...prev, accion: `enviar:${pedidoId}`, error: null }));
    try {
      await enviarPedido(pedidoId);
      await recargar();
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        accion: null,
        error: e instanceof Error ? e.message : "No se pudo enviar pedido",
      }));
    }
  }
  async function onSolicitarCancelacion(pedidoId: string, lineaId: string) {
    const motivo = window.prompt("Motivo de cancelacion:", "Error de carga");
    if (!motivo) return;
    setEstado((prev) => ({ ...prev, accion: `cancelar:${lineaId}`, error: null }));
    try {
      await solicitarCancelacionLinea(pedidoId, lineaId, motivo, "solicitud");
      await recargar();
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        accion: null,
        error: e instanceof Error ? e.message : "No se pudo solicitar cancelacion",
      }));
    }
  }
  async function onTransferirMesa(mesaOrigenId: string) {
    const mesaDestinoId = destinoPorMesa[mesaOrigenId];
    if (!mesaDestinoId) return;
    setEstado((prev) => ({ ...prev, accion: `transferir:${mesaOrigenId}`, error: null }));
    try {
      await transferirMesa(mesaOrigenId, mesaDestinoId);
      await recargar();
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        accion: null,
        error: e instanceof Error ? e.message : "No se pudo transferir mesa",
      }));
    }
  }
  async function onFusionarMesa(mesaOrigenId: string) {
    const mesaDestinoId = destinoPorMesa[mesaOrigenId];
    if (!mesaDestinoId) return;
    setEstado((prev) => ({ ...prev, accion: `fusionar:${mesaOrigenId}`, error: null }));
    try {
      await fusionarMesa(mesaOrigenId, mesaDestinoId, "Fusion operativa desde sala");
      await recargar();
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        accion: null,
        error: e instanceof Error ? e.message : "No se pudo fusionar mesa",
      }));
    }
  }
  async function onAvanzarEstadoLinea(pedidoId: string, lineaId: string, estadoActual: string) {
    const siguiente = siguienteEstadoLinea(estadoActual);
    if (!siguiente) return;
    setEstado((prev) => ({ ...prev, accion: `estado:${lineaId}`, error: null }));
    try {
      await actualizarEstadoLinea(pedidoId, lineaId, siguiente);
      await recargar();
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        accion: null,
        error: e instanceof Error ? e.message : "No se pudo actualizar estado de linea",
      }));
    }
  }

  async function onCobrarPedido(pedidoId: string) {
    setEstado((prev) => ({ ...prev, accion: `cobrar:${pedidoId}`, error: null }));
    try {
      const metodo = (window.prompt("Metodo de pago: efectivo | tarjeta | mixto", "efectivo") ??
        "efectivo") as "efectivo" | "tarjeta" | "mixto";

      if (metodo === "mixto") {
        const efectivo = Number(window.prompt("Monto efectivo (centimos)", "0") ?? "0");
        const tarjeta = Number(window.prompt("Monto tarjeta (centimos)", "0") ?? "0");
        await cobrarPedido(pedidoId, {
          metodo: "mixto",
          montoEfectivo: Math.max(0, Math.trunc(efectivo || 0)),
          montoTarjeta: Math.max(0, Math.trunc(tarjeta || 0)),
        });
      } else if (metodo === "tarjeta" || metodo === "efectivo") {
        const dividir = window.prompt(
          "Cuenta dividida en partes iguales? Numero de partes (0=no)",
          "0",
        );
        const partes = Math.max(0, Math.trunc(Number(dividir || 0)));
        if (partes > 1) {
          const precuenta = await obtenerPrecuentaPedido(pedidoId);
          const total = precuenta.precuenta.resumen.totalCentimos;
          const base = Math.floor(total / partes);
          let resto = total - base * partes;
          const divisiones = Array.from({ length: partes }, () => {
            const extra = resto > 0 ? 1 : 0;
            resto -= extra;
            const monto = base + extra;
            return metodo === "efectivo"
              ? { metodo: "efectivo" as const, montoEfectivo: monto, montoTarjeta: 0 }
              : { metodo: "tarjeta" as const, montoEfectivo: 0, montoTarjeta: monto };
          });
          await cobrarPedido(pedidoId, { metodo, divisiones });
        } else {
          await cobrarPedido(pedidoId, { metodo });
        }
      } else {
        await cobrarPedido(pedidoId, { metodo: "efectivo" });
      }

      await recargar();
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        accion: null,
        error: e instanceof Error ? e.message : "No se pudo cobrar pedido",
      }));
    }
  }

  async function onPrecuenta(pedidoId: string) {
    try {
      const data = await obtenerPrecuentaPedido(pedidoId);
      const total = formatearEuros(data.precuenta.resumen.totalCentimos);
      window.alert(
        `Precuenta mesa ${data.precuenta.mesa}\nLineas: ${data.precuenta.lineas.length}\nTotal: ${total}`,
      );
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        error: e instanceof Error ? e.message : "No se pudo obtener precuenta",
      }));
    }
  }

  async function onTicket(pedidoId: string) {
    try {
      const data = await obtenerTicketPedido(pedidoId);
      const total = formatearEuros(data.ticket.resumen.totalPagadoCentimos);
      window.alert(
        `Ticket ${data.ticket.pedidoId.slice(0, 8)}\nMesa ${data.ticket.mesa}\nTotal cobrado: ${total}\nPagos: ${data.ticket.pagos.length}`,
      );
    } catch (e) {
      setEstado((prev) => ({
        ...prev,
        error: e instanceof Error ? e.message : "No se pudo obtener ticket",
      }));
    }
  }

  if (estado.cargando) return <p className="text-sm text-slate-600">Cargando sala...</p>;

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Sala y pedidos</h1>
          <p className="text-sm text-slate-600">
            Flujo base: abrir mesa, anadir lineas y enviar pedido.
          </p>
        </div>
        <Boton onClick={recargar} variante="secundario">
          Refrescar
        </Boton>
      </header>
      {estado.error ? <p className="text-sm text-rose-700">{estado.error}</p> : null}
      {mesasPorZona.length === 0 ? (
        <Tarjeta>
          <p className="text-sm text-slate-600">
            No hay mesas registradas. Crea zonas/mesas por API privada.
          </p>
        </Tarjeta>
      ) : null}
      {mesasPorZona.map((bloque) => (
        <div key={bloque.zona.id} className="grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Zona {bloque.zona.nombre}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bloque.mesas.map((mesa) => {
              const pedido = mesa.pedidoActivo;
              return (
                <Tarjeta key={mesa.id}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold">Mesa {mesa.nombre}</h3>
                    <span className="text-xs text-slate-500">{mesa.codigo}</span>
                  </div>
                  {!pedido ? (
                    <div className="mt-3">
                      <Boton
                        disabled={estado.accion === `abrir:${mesa.id}`}
                        onClick={() => onAbrirMesa(mesa.id)}
                        variante="primario"
                      >
                        Abrir pedido
                      </Boton>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3">
                      <div className="rounded-lg bg-slate-50 p-3 text-sm">
                        <p>Pedido: {pedido.id.slice(0, 8)}</p>
                        <p>Estado: {pedido.estado}</p>
                        <p>Total: {formatearEuros(pedido.totalCentimos)}</p>
                      </div>
                      <div className="grid gap-2">
                        {pedido.lineas.length === 0 ? (
                          <p className="text-sm text-slate-500">Sin lineas aun.</p>
                        ) : (
                          pedido.lineas.map((linea) => (
                            <div
                              className="flex items-center justify-between rounded-lg border border-slate-200 px-2 py-1 text-sm"
                              key={linea.id}
                            >
                              <span>
                                {linea.cantidad} x {linea.nombreSnapshot} ({linea.estado})
                              </span>
                              <div className="flex gap-2">
                                <Boton
                                  disabled={estado.accion === `cancelar:${linea.id}`}
                                  onClick={() => onSolicitarCancelacion(pedido.id, linea.id)}
                                  variante="fantasma"
                                >
                                  Solicitar cancelar
                                </Boton>
                                {siguienteEstadoLinea(linea.estado) ? (
                                  <Boton
                                    disabled={estado.accion === `estado:${linea.id}`}
                                    onClick={() =>
                                      onAvanzarEstadoLinea(pedido.id, linea.id, linea.estado)
                                    }
                                    variante="secundario"
                                  >
                                    Avanzar
                                  </Boton>
                                ) : null}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="grid gap-2 rounded-lg border border-slate-200 p-2">
                        <select
                          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                          onChange={(e) =>
                            setProductoPorPedido((prev) => ({
                              ...prev,
                              [pedido.id]: e.target.value,
                            }))
                          }
                          value={productoPorPedido[pedido.id] ?? productos[0]?.id ?? ""}
                        >
                          {productos.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                              {producto.nombre} ({formatearEuros(producto.precioCentimos)})
                            </option>
                          ))}
                        </select>
                        <input
                          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                          min={1}
                          onChange={(e) =>
                            setCantidadPorPedido((prev) => ({
                              ...prev,
                              [pedido.id]: Math.max(1, Number(e.target.value) || 1),
                            }))
                          }
                          type="number"
                          value={cantidadPorPedido[pedido.id] ?? 1}
                        />
                        <Boton
                          disabled={
                            estado.accion === `linea:${pedido.id}` || productos.length === 0
                          }
                          onClick={() => onAnadirLinea(pedido.id)}
                          variante="secundario"
                        >
                          Anadir linea
                        </Boton>
                      </div>
                      <Boton
                        disabled={
                          estado.accion === `enviar:${pedido.id}` || pedido.estado !== "abierto"
                        }
                        onClick={() => onEnviarPedido(pedido.id)}
                      >
                        Enviar a cocina/barra
                      </Boton>
                      <Boton
                        disabled={
                          estado.accion === `cobrar:${pedido.id}` ||
                          !["servido", "parcialmente_servido", "en_cobro"].includes(pedido.estado)
                        }
                        onClick={() => onCobrarPedido(pedido.id)}
                        variante="primario"
                      >
                        Cobrar y consolidar stock
                      </Boton>
                      <Boton onClick={() => onPrecuenta(pedido.id)} variante="fantasma">
                        Ver precuenta
                      </Boton>
                      <Boton
                        onClick={async () => {
                          await imprimirPrecuentaPedido(pedido.id);
                          await recargar();
                        }}
                        variante="fantasma"
                      >
                        Imprimir precuenta
                      </Boton>
                      <Boton onClick={() => onTicket(pedido.id)} variante="fantasma">
                        Ver ticket
                      </Boton>
                      <Boton
                        onClick={async () => {
                          await imprimirReciboPedido(pedido.id);
                          await recargar();
                        }}
                        variante="fantasma"
                      >
                        Imprimir recibo
                      </Boton>
                      <div className="flex gap-2">
                        <Boton
                          onClick={async () => {
                            await imprimirProduccionPedido(pedido.id, "cocina");
                            await recargar();
                          }}
                          variante="fantasma"
                        >
                          Imprimir cocina
                        </Boton>
                        <Boton
                          onClick={async () => {
                            await imprimirProduccionPedido(pedido.id, "barra");
                            await recargar();
                          }}
                          variante="fantasma"
                        >
                          Imprimir barra
                        </Boton>
                      </div>
                      <div className="grid gap-2 rounded-lg border border-slate-200 p-2">
                        <p className="text-xs font-medium text-slate-600">Mover pedido de mesa</p>
                        <select
                          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                          onChange={(e) =>
                            setDestinoPorMesa((prev) => ({ ...prev, [mesa.id]: e.target.value }))
                          }
                          value={destinoPorMesa[mesa.id] ?? ""}
                        >
                          <option value="">Selecciona mesa destino...</option>
                          {mesas
                            .filter((mesaDestino) => mesaDestino.id !== mesa.id)
                            .map((mesaDestino) => (
                              <option key={mesaDestino.id} value={mesaDestino.id}>
                                {mesaDestino.nombre} - {mesaDestino.zona.nombre}
                              </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                          <Boton
                            disabled={
                              estado.accion === `transferir:${mesa.id}` || !destinoPorMesa[mesa.id]
                            }
                            onClick={() => onTransferirMesa(mesa.id)}
                            variante="secundario"
                          >
                            Transferir
                          </Boton>
                          <Boton
                            disabled={
                              estado.accion === `fusionar:${mesa.id}` || !destinoPorMesa[mesa.id]
                            }
                            onClick={() => onFusionarMesa(mesa.id)}
                            variante="fantasma"
                          >
                            Fusionar
                          </Boton>
                        </div>
                      </div>
                    </div>
                  )}
                </Tarjeta>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
