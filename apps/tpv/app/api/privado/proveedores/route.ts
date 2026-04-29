import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCrearProveedor } from "@/src/api/privado/compras/compras-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  const proveedores = await clientePrisma.proveedor.findMany({
    where: { eliminadoEn: null },
    orderBy: [{ nombre: "asc" }],
    take: 300,
  });

  return NextResponse.json(proveedores);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearProveedor.parse(await request.json());
    const creada = await clientePrisma.proveedor.create({
      data: {
        nombre: entrada.nombre,
        codigo: entrada.codigo,
        telefono: entrada.telefono ?? null,
        email: entrada.email ?? null,
        contacto: entrada.contacto ?? null,
      },
    });
    return NextResponse.json(creada, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para proveedor");
  }
}
