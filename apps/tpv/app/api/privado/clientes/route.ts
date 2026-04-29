import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCrearCliente } from "@/src/api/privado/reservas/reservas-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  const clientes = await clientePrisma.cliente.findMany({
    where: {
      eliminadoEn: null,
      ...(q
        ? {
            OR: [
              { nombre: { contains: q, mode: "insensitive" } },
              { telefono: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ nombre: "asc" }],
    take: 200,
  });

  return NextResponse.json(clientes);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearCliente.parse(await request.json());
    const cliente = await clientePrisma.cliente.create({
      data: {
        nombre: entrada.nombre,
        telefono: entrada.telefono ?? null,
        email: entrada.email ?? null,
        notas: entrada.notas ?? null,
      },
    });
    return NextResponse.json(cliente, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para cliente");
  }
}
