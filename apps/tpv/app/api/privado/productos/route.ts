import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCrearProducto } from "@/src/api/privado/carta-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  const productos = await clientePrisma.producto.findMany({
    where: { eliminadoEn: null },
    orderBy: [{ creadoEn: "desc" }],
  });

  return NextResponse.json(productos);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearProducto.parse(await request.json());

    const creada = await clientePrisma.producto.create({
      data: {
        nombre: entrada.nombre,
        slug: entrada.slug,
        descripcion: entrada.descripcion ?? null,
        precioCentimos: entrada.precioCentimos,
        tipo: entrada.tipo,
        destinoPreparacion: entrada.destinoPreparacion,
        categoriaId: entrada.categoriaId,
        visiblePublico: entrada.visiblePublico,
        estadoPublico: entrada.estadoPublico,
      },
    });

    return NextResponse.json(creada, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para crear producto");
  }
}
