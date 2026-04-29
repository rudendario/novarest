import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { clientePrisma } from "@el-jardin/infra";

import { POST as postLogin } from "@/app/api/privado/auth/login/route";
import { POST as postAperturaCaja } from "@/app/api/privado/caja/apertura/route";
import { POST as postCierreCaja } from "@/app/api/privado/caja/cierre/route";
import { GET as getResumen } from "@/app/api/privado/informes/resumen/route";
import { POST as postAbrirPedido } from "@/app/api/privado/mesas/[id]/abrir-pedido/route";
import { POST as postCobrarPedido } from "@/app/api/privado/pedidos/[id]/cobrar/route";
import { POST as postEnviarPedido } from "@/app/api/privado/pedidos/[id]/enviar/route";
import { POST as postEstadoLinea } from "@/app/api/privado/pedidos/[id]/lineas/[lineaId]/estado/route";
import { POST as postAnadirLinea } from "@/app/api/privado/pedidos/[id]/lineas/route";
import { hashSecreto } from "@/src/api/privado/auth/servicio-auth";

const habilitada = process.env.RUN_DB_TESTS === "1" && Boolean(process.env.DATABASE_URL);

describe.skipIf(!habilitada)("Flujo critico DB - login a informe", () => {
  const sufijo = randomUUID();
  const email = `flujo-${sufijo}@el-jardin.local`;
  const password = "secreto123";
  const dispositivoToken = `disp-${sufijo}`;

  let usuarioId = "";
  let zonaId = "";
  let mesaId = "";
  let categoriaId = "";
  let productoId = "";
  let cajaId = "";
  let pedidoId = "";
  let lineaId = "";
  const cajasIds: string[] = [];
  const pedidosIds: string[] = [];
  const lineasIds: string[] = [];
  let token = "";
  let precioProducto = 0;

  beforeAll(async () => {
    const hashPassword = await hashSecreto(password);

    await clientePrisma.caja.updateMany({
      where: { estado: "abierta" },
      data: { estado: "descuadrada", cerradaEn: new Date(), saldoFinal: 0 },
    });

    const rol = await clientePrisma.rolUsuario.upsert({
      where: { nombre: "administrador" },
      update: {},
      create: { nombre: "administrador" },
    });

    const usuario = await clientePrisma.usuario.create({
      data: {
        email,
        nombre: "Operador Flujo",
        hashPassword,
        rolId: rol.id,
      },
    });
    usuarioId = usuario.id;

    const zona = await clientePrisma.zona.create({
      data: { nombre: `zona-${sufijo}`, orden: 1, activa: true },
    });
    zonaId = zona.id;

    const mesa = await clientePrisma.mesa.create({
      data: {
        zonaId,
        nombre: `mesa-${sufijo}`,
        codigo: `cod-${sufijo.slice(0, 8)}`,
        capacidad: 4,
        activa: true,
      },
    });
    mesaId = mesa.id;

    const categoria = await clientePrisma.categoriaProducto.create({
      data: {
        nombre: `cat-${sufijo}`,
        slug: `cat-${sufijo}`,
        visiblePublico: false,
      },
    });
    categoriaId = categoria.id;

    const producto = await clientePrisma.producto.create({
      data: {
        nombre: `prod-${sufijo}`,
        slug: `prod-${sufijo}`,
        precioCentimos: 750,
        tipo: "plato",
        destinoPreparacion: "cocina",
        estadoInterno: "disponible",
        estadoPublico: "oculto",
        visiblePublico: false,
        categoriaId,
      },
    });
    productoId = producto.id;
    precioProducto = producto.precioCentimos;

    await clientePrisma.stockFisico.create({
      data: {
        productoId: producto.id,
        cantidadDisponible: 50,
      },
    });
  });

  afterAll(async () => {
    if (pedidosIds.length > 0) {
      await clientePrisma.solicitudCancelacion.deleteMany({
        where: { pedidoId: { in: pedidosIds } },
      });
      if (lineasIds.length > 0) {
        await clientePrisma.reservaStock.deleteMany({
          where: { lineaPedidoId: { in: lineasIds } },
        });
      }
      await clientePrisma.lineaPedido.deleteMany({ where: { pedidoId: { in: pedidosIds } } });
      await clientePrisma.pagoPedido.deleteMany({ where: { pedidoId: { in: pedidosIds } } });
      await clientePrisma.sesionPago.deleteMany({ where: { pedidoId: { in: pedidosIds } } });
      await clientePrisma.pedido.deleteMany({ where: { id: { in: pedidosIds } } });
    }
    if (productoId) {
      await clientePrisma.reservaStock.deleteMany({ where: { productoId } });
      await clientePrisma.movimientoStock.deleteMany({ where: { productoId } });
      await clientePrisma.stockFisico.deleteMany({ where: { productoId } });
    }
    if (cajasIds.length > 0) {
      await clientePrisma.movimientoCaja.deleteMany({ where: { cajaId: { in: cajasIds } } });
      await clientePrisma.caja.deleteMany({ where: { id: { in: cajasIds } } });
    }
    await clientePrisma.registroAuditoria.deleteMany({ where: { usuarioId } });
    await clientePrisma.sesion.deleteMany({ where: { usuarioId } });
    if (dispositivoToken) {
      const dispositivo = await clientePrisma.dispositivo.findUnique({
        where: { tokenVinculo: dispositivoToken },
        select: { id: true },
      });
      if (dispositivo) {
        await clientePrisma.dispositivo.delete({ where: { id: dispositivo.id } });
      }
    }
    await clientePrisma.usuario.deleteMany({ where: { id: usuarioId } });
    await clientePrisma.producto.deleteMany({ where: { id: productoId } });
    await clientePrisma.categoriaProducto.deleteMany({ where: { id: categoriaId } });
    await clientePrisma.mesa.deleteMany({ where: { id: mesaId } });
    await clientePrisma.zona.deleteMany({ where: { id: zonaId } });
  });

  function reqAut(url: string, init?: { method?: string; body?: unknown }) {
    return new Request(url, {
      method: init?.method ?? "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
  }

  it("completa flujo critico operativo hasta informe", async () => {
    const loginRes = await postLogin(
      new Request("http://localhost/api/privado/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          dispositivoToken,
        }),
      }) as never,
    );
    expect(loginRes.status).toBe(200);
    const loginBody = (await loginRes.json()) as { token: string };
    token = loginBody.token;
    expect(token).toBeTruthy();

    const aperturaRes = await postAperturaCaja(
      reqAut("http://localhost/api/privado/caja/apertura", {
        method: "POST",
        body: { saldoInicial: 1000 },
      }),
    );
    expect(aperturaRes.status).toBe(201);
    const aperturaBody = (await aperturaRes.json()) as { id: string };
    cajaId = aperturaBody.id;
    cajasIds.push(cajaId);

    const abrirRes = await postAbrirPedido(reqAut("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: mesaId }),
    });
    expect(abrirRes.status).toBe(201);
    const abrirBody = (await abrirRes.json()) as { id: string };
    pedidoId = abrirBody.id;
    pedidosIds.push(pedidoId);

    const anadirRes = await postAnadirLinea(
      reqAut("http://localhost", {
        method: "POST",
        body: { productoId, cantidad: 2 },
      }),
      { params: Promise.resolve({ id: pedidoId }) },
    );
    if (anadirRes.status !== 201) {
      const detalle = await anadirRes.text();
      throw new Error(`anadir_linea_status_${anadirRes.status}: ${detalle}`);
    }
    const lineaBody = (await anadirRes.json()) as { id: string };
    lineaId = lineaBody.id;
    lineasIds.push(lineaId);

    const enviarRes = await postEnviarPedido(reqAut("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: pedidoId }),
    });
    expect(enviarRes.status).toBe(200);

    for (const estado of ["en_preparacion", "lista", "servida"] as const) {
      const estadoRes = await postEstadoLinea(
        reqAut("http://localhost", { method: "POST", body: { estado } }),
        { params: Promise.resolve({ id: pedidoId, lineaId }) },
      );
      expect(estadoRes.status).toBe(200);
    }

    const total = precioProducto * 2;
    const cobrarRes = await postCobrarPedido(
      reqAut("http://localhost", {
        method: "POST",
        body: { metodo: "efectivo" },
      }),
      { params: Promise.resolve({ id: pedidoId }) },
    );
    expect(cobrarRes.status).toBe(200);

    const cierreRes = await postCierreCaja(
      reqAut("http://localhost/api/privado/caja/cierre", {
        method: "POST",
        body: { saldoFinal: 1000 + total, motivo: "cierre_test" },
      }),
    );
    expect(cierreRes.status).toBe(200);

    const desde = new Date(Date.now() - 1000 * 60 * 10).toISOString();
    const hasta = new Date(Date.now() + 1000 * 60 * 10).toISOString();
    const informeRes = await getResumen(
      reqAut(`http://localhost/api/privado/informes/resumen?desde=${desde}&hasta=${hasta}`),
    );
    expect(informeRes.status).toBe(200);
    const informeBody = (await informeRes.json()) as {
      ventas: { totalCentimos: number; pedidos: number };
    };

    expect(informeBody.ventas.totalCentimos).toBeGreaterThanOrEqual(total);
    expect(informeBody.ventas.pedidos).toBeGreaterThanOrEqual(1);
  });

  it("cubre cobro mixto/dividido y cierre descuadrado", async () => {
    const aperturaRes = await postAperturaCaja(
      reqAut("http://localhost/api/privado/caja/apertura", {
        method: "POST",
        body: { saldoInicial: 500 },
      }),
    );
    expect(aperturaRes.status).toBe(201);
    const aperturaBody = (await aperturaRes.json()) as { id: string };
    cajasIds.push(aperturaBody.id);

    const abrirRes = await postAbrirPedido(reqAut("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: mesaId }),
    });
    expect(abrirRes.status).toBe(201);
    const abrirBody = (await abrirRes.json()) as { id: string };
    const pedidoLocalId = abrirBody.id;
    pedidosIds.push(pedidoLocalId);

    const anadirRes = await postAnadirLinea(
      reqAut("http://localhost", {
        method: "POST",
        body: { productoId, cantidad: 2 },
      }),
      { params: Promise.resolve({ id: pedidoLocalId }) },
    );
    expect(anadirRes.status).toBe(201);
    const lineaBody = (await anadirRes.json()) as { id: string };
    const lineaLocalId = lineaBody.id;
    lineasIds.push(lineaLocalId);

    const enviarRes = await postEnviarPedido(reqAut("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: pedidoLocalId }),
    });
    expect(enviarRes.status).toBe(200);

    for (const estado of ["en_preparacion", "lista", "servida"] as const) {
      const estadoRes = await postEstadoLinea(
        reqAut("http://localhost", { method: "POST", body: { estado } }),
        { params: Promise.resolve({ id: pedidoLocalId, lineaId: lineaLocalId }) },
      );
      expect(estadoRes.status).toBe(200);
    }

    const total = precioProducto * 2;
    const cobrarRes = await postCobrarPedido(
      reqAut("http://localhost", {
        method: "POST",
        body: {
          metodo: "mixto",
          divisiones: [
            { metodo: "mixto", montoEfectivo: 500, montoTarjeta: 0 },
            { metodo: "mixto", montoEfectivo: 0, montoTarjeta: total - 500 },
          ],
        },
      }),
      { params: Promise.resolve({ id: pedidoLocalId }) },
    );
    if (cobrarRes.status !== 200) {
      const detalle = await cobrarRes.text();
      throw new Error(`cobro_mixto_status_${cobrarRes.status}: ${detalle}`);
    }

    const cierreRes = await postCierreCaja(
      reqAut("http://localhost/api/privado/caja/cierre", {
        method: "POST",
        body: { saldoFinal: 9999, motivo: "descuadre_controlado_test" },
      }),
    );
    expect(cierreRes.status).toBe(200);
    const cierreBody = (await cierreRes.json()) as { caja: { estado: string } };
    expect(cierreBody.caja.estado).toBe("descuadrada");
  });
});
