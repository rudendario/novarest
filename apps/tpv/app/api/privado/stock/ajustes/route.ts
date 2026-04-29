import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { ajustarStock, esquemaAjusteStock } from "@/src/api/privado/stock/stock-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeAjustarStock");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaAjusteStock.parse(await request.json());
    const resultado = await ajustarStock(entrada);
    if (resultado instanceof Response) return resultado;
    return NextResponse.json(resultado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para ajuste de stock");
  }
}
