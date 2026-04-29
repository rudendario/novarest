"use client";

import { useCallback, useEffect, useState } from "react";

import { Boton, Input, Tarjeta } from "@el-jardin/ui";

import {
  type ClienteReserva,
  type EntradaListaEspera,
  type MesaSala,
  type ReservaTurno,
  actualizarEstadoListaEspera,
  actualizarEstadoReserva,
  asignarMesaAReserva,
  crearClienteReserva,
  crearEntradaListaEspera,
  crearReserva,
  obtenerClientesReserva,
  obtenerListaEspera,
  obtenerMesasSala,
  obtenerReservas,
  sentarReservaConApertura,
} from "@/src/cliente-api/sala";

export function PanelReservas() {
  const [clientes, setClientes] = useState<ClienteReserva[]>([]);
  const [reservas, setReservas] = useState<ReservaTurno[]>([]);
  const [espera, setEspera] = useState<EntradaListaEspera[]>([]);
  const [mesas, setMesas] = useState<MesaSala[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [mesaPorReserva, setMesaPorReserva] = useState<Record<string, string>>({});

  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  const [reservaNombre, setReservaNombre] = useState("");
  const [reservaTelefono, setReservaTelefono] = useState("");
  const [reservaComensales, setReservaComensales] = useState("2");
  const [reservaFechaHora, setReservaFechaHora] = useState("");

  const [esperaNombre, setEsperaNombre] = useState("");
  const [esperaComensales, setEsperaComensales] = useState("2");

  const recargar = useCallback(async () => {
    try {
      setError(null);
      const [clientesData, reservasData, esperaData, mesasData] = await Promise.all([
        obtenerClientesReserva(),
        obtenerReservas(),
        obtenerListaEspera(),
        obtenerMesasSala(),
      ]);
      setClientes(clientesData);
      setReservas(reservasData);
      setEspera(esperaData);
      setMesas(mesasData.filter((mesa) => mesa.activa));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar reservas");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void recargar();
    }, 0);
    return () => clearTimeout(t);
  }, [recargar]);

  async function onCrearCliente() {
    if (!clienteNombre.trim()) return;
    setAccion("crear-cliente");
    try {
      await crearClienteReserva({
        nombre: clienteNombre.trim(),
        telefono: clienteTelefono.trim() || undefined,
      });
      setClienteNombre("");
      setClienteTelefono("");
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear cliente");
    } finally {
      setAccion(null);
    }
  }

  async function onCrearReserva() {
    if (!reservaNombre.trim() || !reservaFechaHora) return;
    setAccion("crear-reserva");
    try {
      await crearReserva({
        nombreCliente: reservaNombre.trim(),
        telefonoContacto: reservaTelefono.trim() || undefined,
        fechaHora: new Date(reservaFechaHora).toISOString(),
        comensales: Math.max(1, Math.trunc(Number(reservaComensales) || 1)),
      });
      setReservaNombre("");
      setReservaTelefono("");
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear reserva");
    } finally {
      setAccion(null);
    }
  }

  async function onCrearEspera() {
    if (!esperaNombre.trim()) return;
    setAccion("crear-espera");
    try {
      await crearEntradaListaEspera({
        nombreCliente: esperaNombre.trim(),
        comensales: Math.max(1, Math.trunc(Number(esperaComensales) || 1)),
      });
      setEsperaNombre("");
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear entrada de espera");
    } finally {
      setAccion(null);
    }
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reservas y lista de espera</h1>
          <p className="text-sm text-slate-600">Base operativa de Fase 11 para gestionar turnos.</p>
        </div>
        <Boton onClick={() => void recargar()} variante="secundario">
          Refrescar
        </Boton>
      </header>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-3">
        <Tarjeta>
          <h2 className="font-semibold">Nuevo cliente</h2>
          <div className="mt-2 grid gap-2">
            <Input
              placeholder="Nombre"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
            />
            <Input
              placeholder="Telefono"
              value={clienteTelefono}
              onChange={(e) => setClienteTelefono(e.target.value)}
            />
            <Boton disabled={accion === "crear-cliente"} onClick={() => void onCrearCliente()}>
              Crear cliente
            </Boton>
          </div>
        </Tarjeta>

        <Tarjeta>
          <h2 className="font-semibold">Nueva reserva</h2>
          <div className="mt-2 grid gap-2">
            <Input
              placeholder="Nombre cliente"
              value={reservaNombre}
              onChange={(e) => setReservaNombre(e.target.value)}
            />
            <Input
              placeholder="Telefono"
              value={reservaTelefono}
              onChange={(e) => setReservaTelefono(e.target.value)}
            />
            <Input
              type="datetime-local"
              value={reservaFechaHora}
              onChange={(e) => setReservaFechaHora(e.target.value)}
            />
            <Input
              type="number"
              min={1}
              value={reservaComensales}
              onChange={(e) => setReservaComensales(e.target.value)}
            />
            <Boton disabled={accion === "crear-reserva"} onClick={() => void onCrearReserva()}>
              Crear reserva
            </Boton>
          </div>
        </Tarjeta>

        <Tarjeta>
          <h2 className="font-semibold">Lista de espera</h2>
          <div className="mt-2 grid gap-2">
            <Input
              placeholder="Nombre cliente"
              value={esperaNombre}
              onChange={(e) => setEsperaNombre(e.target.value)}
            />
            <Input
              type="number"
              min={1}
              value={esperaComensales}
              onChange={(e) => setEsperaComensales(e.target.value)}
            />
            <Boton disabled={accion === "crear-espera"} onClick={() => void onCrearEspera()}>
              Anadir a espera
            </Boton>
          </div>
        </Tarjeta>
      </div>

      <Tarjeta>
        <h2 className="font-semibold">Reservas ({reservas.length})</h2>
        <div className="mt-2 grid gap-2">
          {reservas.length === 0 ? <p className="text-sm text-slate-500">Sin reservas.</p> : null}
          {reservas.map((reserva) => (
            <div key={reserva.id} className="rounded-md border border-slate-200 p-2 text-sm">
              <p>
                {reserva.nombreCliente} - {reserva.comensales} pax
              </p>
              <p className="text-slate-500">
                {new Date(reserva.fechaHora).toLocaleString("es-ES")} - {reserva.estado}
              </p>
              <p className="text-slate-500">
                Mesa: {reserva.mesaId ? reserva.mesaId.slice(0, 8) : "sin asignar"}
              </p>
              <div className="mt-2 flex gap-2">
                <select
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  onChange={(e) =>
                    setMesaPorReserva((prev) => ({ ...prev, [reserva.id]: e.target.value }))
                  }
                  value={mesaPorReserva[reserva.id] ?? ""}
                >
                  <option value="">Asignar mesa...</option>
                  {mesas.map((mesa) => (
                    <option key={mesa.id} value={mesa.id}>
                      {mesa.nombre} ({mesa.zona.nombre}, cap {mesa.capacidad})
                    </option>
                  ))}
                </select>
                <Boton
                  variante="secundario"
                  onClick={async () => {
                    const mesaId = mesaPorReserva[reserva.id];
                    if (!mesaId) return;
                    await asignarMesaAReserva(reserva.id, mesaId);
                    await recargar();
                  }}
                >
                  Asignar
                </Boton>
              </div>
              <div className="mt-2 flex gap-2">
                <Boton
                  variante="secundario"
                  onClick={async () => {
                    await actualizarEstadoReserva(reserva.id, { estado: "confirmada" });
                    await recargar();
                  }}
                >
                  Confirmar
                </Boton>
                <Boton
                  variante="secundario"
                  onClick={async () => {
                    await sentarReservaConApertura(reserva.id);
                    await recargar();
                  }}
                >
                  Sentar
                </Boton>
                <Boton
                  variante="fantasma"
                  onClick={async () => {
                    await actualizarEstadoReserva(reserva.id, { estado: "cancelada" });
                    await recargar();
                  }}
                >
                  Cancelar
                </Boton>
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Cola de espera ({espera.length})</h2>
        <div className="mt-2 grid gap-2">
          {espera.length === 0 ? (
            <p className="text-sm text-slate-500">Sin entradas en espera.</p>
          ) : null}
          {espera.map((entrada) => (
            <div key={entrada.id} className="rounded-md border border-slate-200 p-2 text-sm">
              <p>
                {entrada.nombreCliente} - {entrada.comensales} pax
              </p>
              <p className="text-slate-500">{entrada.estado}</p>
              <div className="mt-2 flex gap-2">
                <Boton
                  variante="secundario"
                  onClick={async () => {
                    await actualizarEstadoListaEspera(entrada.id, "avisado");
                    await recargar();
                  }}
                >
                  Avisar
                </Boton>
                <Boton
                  variante="secundario"
                  onClick={async () => {
                    await actualizarEstadoListaEspera(entrada.id, "sentado");
                    await recargar();
                  }}
                >
                  Sentado
                </Boton>
                <Boton
                  variante="fantasma"
                  onClick={async () => {
                    await actualizarEstadoListaEspera(entrada.id, "cancelado");
                    await recargar();
                  }}
                >
                  Cancelar
                </Boton>
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-semibold">Clientes ({clientes.length})</h2>
        <div className="mt-2 grid gap-1 text-sm">
          {clientes.length === 0 ? (
            <p className="text-slate-500">Sin clientes registrados.</p>
          ) : null}
          {clientes.slice(0, 30).map((cliente) => (
            <p key={cliente.id}>
              {cliente.nombre} {cliente.telefono ? `- ${cliente.telefono}` : ""}
            </p>
          ))}
        </div>
      </Tarjeta>
    </section>
  );
}
