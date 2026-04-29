import { esquemaPlatoPublico } from "@el-jardin/contratos";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { obtenerPlatoPublicoPorSlug } from "@/src/api/publico/consultas-publicas";
import { validarRateLimit } from "@/src/api/publico/rate-limit";
import { responderErrorApi, responderOk } from "@/src/api/publico/respuestas";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const limite = validarRateLimit(request, {
    clave: "publico:plato-detalle",
    ventanaMs: 60_000,
    maxPeticiones: 120,
  });
  if (!limite.permitido) {
    return NextResponse.json(
      { codigo: "limite_superado", mensaje: "Demasiadas solicitudes" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limite.reiniciaEn - Date.now()) / 1000)) },
      },
    );
  }

  const { slug } = await params;

  try {
    const plato = await obtenerPlatoPublicoPorSlug(slug);

    if (!plato) {
      return responderErrorApi(404, "no_encontrado", "Plato no encontrado");
    }

    const payload = esquemaPlatoPublico.parse(plato);

    return responderOk(payload, 180);
  } catch {
    return responderErrorApi(500, "error_interno", "No se pudo consultar el plato");
  }
}
