import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { clientePrisma } from "@el-jardin/infra";

import { GET as getAuditoria } from "@/app/api/privado/auditoria/route";
import { GET as getDesgloseCategoria } from "@/app/api/privado/informes/desglose-categoria/route";
import { GET as getDesgloseProducto } from "@/app/api/privado/informes/desglose-producto/route";
import { GET as getDesgloseTurno } from "@/app/api/privado/informes/desglose-turno/route";
import { GET as getResumen } from "@/app/api/privado/informes/resumen/route";

const tieneDatabaseUrl = Boolean(process.env.DATABASE_URL);
const ejecucionDbHabilitada = process.env.RUN_DB_TESTS === "1";

describe.skipIf(!(tieneDatabaseUrl && ejecucionDbHabilitada))(
  "Integracion DB - informes privados",
  () => {
    const idPrueba = randomUUID();
    const tokenPlano = `token_${idPrueba}`;
    const tokenHash = createHash("sha256").update(tokenPlano).digest("hex");

    const desde = new Date("2035-01-01T10:00:00.000Z");
    const hasta = new Date("2035-01-01T10:10:00.000Z");

    let rolId = "";
    let usuarioId = "";
    let dispositivoId = "";
    let sesionId = "";
    let zonaId = "";
    let mesaId = "";
    let cajaId = "";
    let pedidoId = "";
    let categoriaId = "";
    let productoId = "";
    let auditoriaId = "";
    let movimientoCajaEntradaId = "";
    let movimientoCajaSalidaId = "";
    let movimientoStockConsumoId = "";
    let movimientoStockRecepcionId = "";
    let lineaPedidoId = "";
    let pagoId = "";

    beforeAll(async () => {
      const rol = await clientePrisma.rolUsuario.upsert({
        where: { nombre: "administrador" },
        update: {},
        create: { nombre: "administrador" },
      });
      rolId = rol.id;

      const usuario = await clientePrisma.usuario.create({
        data: {
          email: `it-${idPrueba}@el-jardin.local`,
          nombre: "IT Informes",
          hashPassword: "hash_prueba",
          rolId,
        },
      });
      usuarioId = usuario.id;

      const dispositivo = await clientePrisma.dispositivo.create({
        data: {
          nombre: `it-dispositivo-${idPrueba}`,
          tipo: "test",
          tokenVinculo: `vinculo-${idPrueba}`,
          activo: true,
        },
      });
      dispositivoId = dispositivo.id;

      const sesion = await clientePrisma.sesion.create({
        data: {
          usuarioId,
          dispositivoId,
          tokenHash,
          expiraEn: new Date("2036-01-01T00:00:00.000Z"),
        },
      });
      sesionId = sesion.id;

      const zona = await clientePrisma.zona.create({
        data: {
          nombre: `it-zona-${idPrueba}`,
          orden: 1,
        },
      });
      zonaId = zona.id;

      const mesa = await clientePrisma.mesa.create({
        data: {
          zonaId,
          nombre: `it-mesa-${idPrueba}`,
          codigo: `it-cod-${idPrueba.slice(0, 8)}`,
          capacidad: 4,
        },
      });
      mesaId = mesa.id;

      const caja = await clientePrisma.caja.create({
        data: {
          estado: "cerrada",
          abiertaEn: desde,
          cerradaEn: hasta,
          saldoInicial: 0,
          saldoFinal: 0,
        },
      });
      cajaId = caja.id;

      const pedido = await clientePrisma.pedido.create({
        data: {
          mesaId,
          estado: "cobrado",
          totalCentimos: 1100,
          abiertoEn: new Date("2035-01-01T10:02:00.000Z"),
        },
      });
      pedidoId = pedido.id;

      const categoria = await clientePrisma.categoriaProducto.create({
        data: {
          nombre: `it-categoria-${idPrueba}`,
          slug: `it-categoria-${idPrueba}`,
          visiblePublico: false,
        },
      });
      categoriaId = categoria.id;

      const producto = await clientePrisma.producto.create({
        data: {
          nombre: `it-producto-${idPrueba}`,
          slug: `it-producto-${idPrueba}`,
          precioCentimos: 550,
          tipo: "plato",
          destinoPreparacion: "cocina",
          estadoInterno: "disponible",
          estadoPublico: "oculto",
          visiblePublico: false,
          categoriaId,
        },
      });
      productoId = producto.id;

      const lineaPedido = await clientePrisma.lineaPedido.create({
        data: {
          pedidoId,
          productoId,
          nombreSnapshot: producto.nombre,
          precioUnitCentimos: 550,
          cantidad: 2,
          estado: "servida",
          creadoEn: new Date("2035-01-01T10:03:00.000Z"),
        },
      });
      lineaPedidoId = lineaPedido.id;

      const pago = await clientePrisma.pagoPedido.create({
        data: {
          pedidoId,
          cajaId,
          metodo: "tarjeta",
          montoTotal: 1100,
          montoEfectivo: 100,
          montoTarjeta: 1000,
          cobradoEn: new Date("2035-01-01T10:04:00.000Z"),
        },
      });
      pagoId = pago.id;

      const movEntrada = await clientePrisma.movimientoCaja.create({
        data: {
          cajaId,
          tipo: "entrada_manual",
          metodo: "efectivo",
          cantidad: 300,
          creadoEn: new Date("2035-01-01T10:05:00.000Z"),
        },
      });
      movimientoCajaEntradaId = movEntrada.id;

      const movSalida = await clientePrisma.movimientoCaja.create({
        data: {
          cajaId,
          tipo: "salida_manual",
          metodo: "efectivo",
          cantidad: 120,
          creadoEn: new Date("2035-01-01T10:06:00.000Z"),
        },
      });
      movimientoCajaSalidaId = movSalida.id;

      const movConsumo = await clientePrisma.movimientoStock.create({
        data: {
          productoId,
          tipo: "consumo_cobro",
          cantidad: 2,
          creadoEn: new Date("2035-01-01T10:07:00.000Z"),
        },
      });
      movimientoStockConsumoId = movConsumo.id;

      const movRecepcion = await clientePrisma.movimientoStock.create({
        data: {
          productoId,
          tipo: "recepcion_compra",
          cantidad: 5,
          creadoEn: new Date("2035-01-01T10:08:00.000Z"),
        },
      });
      movimientoStockRecepcionId = movRecepcion.id;

      const auditoria = await clientePrisma.registroAuditoria.create({
        data: {
          usuarioId,
          rolNombre: "administrador",
          accion: "it_informe",
          entidad: "it_suite",
          entidadId: idPrueba,
          creadoEn: new Date("2035-01-01T10:09:00.000Z"),
        },
      });
      auditoriaId = auditoria.id;
    });

    afterAll(async () => {
      await clientePrisma.registroAuditoria.deleteMany({ where: { id: auditoriaId } });
      await clientePrisma.movimientoStock.deleteMany({
        where: { id: { in: [movimientoStockConsumoId, movimientoStockRecepcionId] } },
      });
      await clientePrisma.movimientoCaja.deleteMany({
        where: { id: { in: [movimientoCajaEntradaId, movimientoCajaSalidaId] } },
      });
      await clientePrisma.pagoPedido.deleteMany({ where: { id: pagoId } });
      await clientePrisma.lineaPedido.deleteMany({ where: { id: lineaPedidoId } });
      await clientePrisma.pedido.deleteMany({ where: { id: pedidoId } });
      await clientePrisma.caja.deleteMany({ where: { id: cajaId } });
      await clientePrisma.producto.deleteMany({ where: { id: productoId } });
      await clientePrisma.categoriaProducto.deleteMany({ where: { id: categoriaId } });
      await clientePrisma.mesa.deleteMany({ where: { id: mesaId } });
      await clientePrisma.zona.deleteMany({ where: { id: zonaId } });
      await clientePrisma.sesion.deleteMany({ where: { id: sesionId } });
      await clientePrisma.dispositivo.deleteMany({ where: { id: dispositivoId } });
      await clientePrisma.usuario.deleteMany({ where: { id: usuarioId } });
    });

    function requestConSesion(url: string) {
      return new Request(url, {
        headers: {
          authorization: `Bearer ${tokenPlano}`,
        },
      });
    }

    it("devuelve resumen consistente en rango controlado", async () => {
      const res = await getResumen(
        requestConSesion(
          `http://localhost/api/privado/informes/resumen?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`,
        ),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        ventas: {
          totalCentimos: number;
          efectivoCentimos: number;
          tarjetaCentimos: number;
          pagos: number;
          pedidos: number;
        };
        caja: {
          entradasManualCentimos: number;
          salidasManualCentimos: number;
          movimientos: number;
        };
        stock: { consumoUnidades: number; recepcionUnidades: number; movimientos: number };
      };
      expect(body.ventas).toMatchObject({
        totalCentimos: 1100,
        efectivoCentimos: 100,
        tarjetaCentimos: 1000,
        pagos: 1,
        pedidos: 1,
      });
      expect(body.caja).toMatchObject({
        entradasManualCentimos: 300,
        salidasManualCentimos: 120,
        movimientos: 2,
      });
      expect(body.stock).toMatchObject({
        consumoUnidades: 2,
        recepcionUnidades: 5,
        movimientos: 2,
      });
    });

    it("devuelve desgloses de producto, categoria y turno", async () => {
      const query = `?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`;
      const [resProducto, resCategoria, resTurno] = await Promise.all([
        getDesgloseProducto(
          requestConSesion(`http://localhost/api/privado/informes/desglose-producto${query}`),
        ),
        getDesgloseCategoria(
          requestConSesion(`http://localhost/api/privado/informes/desglose-categoria${query}`),
        ),
        getDesgloseTurno(
          requestConSesion(`http://localhost/api/privado/informes/desglose-turno${query}`),
        ),
      ]);
      expect(resProducto.status).toBe(200);
      expect(resCategoria.status).toBe(200);
      expect(resTurno.status).toBe(200);

      const bodyProducto = (await resProducto.json()) as {
        items: Array<{ productoId: string; unidades: number; ventaCentimos: number }>;
      };
      const bodyCategoria = (await resCategoria.json()) as {
        items: Array<{ categoriaId: string; unidades: number; ventaCentimos: number }>;
      };
      const bodyTurno = (await resTurno.json()) as {
        items: Array<{ turno: string; pagos: number; ventaCentimos: number }>;
      };

      expect(bodyProducto.items[0]).toMatchObject({ productoId, unidades: 2, ventaCentimos: 1100 });
      expect(bodyCategoria.items[0]).toMatchObject({
        categoriaId,
        unidades: 2,
        ventaCentimos: 1100,
      });
      expect(bodyTurno.items.find((x) => x.turno === "manana")).toMatchObject({
        turno: "manana",
        pagos: 1,
        ventaCentimos: 1100,
      });
    });

    it("devuelve auditoria filtrable por entidad/accion", async () => {
      const res = await getAuditoria(
        requestConSesion(
          "http://localhost/api/privado/auditoria?entidad=it_suite&accion=it_informe&limite=10",
        ),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Array<{ id: string; entidad: string; accion: string }>;
      const registro = body.find((item) => item.id === auditoriaId);
      expect(registro).toMatchObject({
        id: auditoriaId,
        entidad: "it_suite",
        accion: "it_informe",
      });
    });
  },
);
