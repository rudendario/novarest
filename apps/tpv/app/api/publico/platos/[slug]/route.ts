import { esquemaPlatoPublico } from "@el-jardin/contratos";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { crearRequestId, registrarErrorApi } from "@/src/api/logging";
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
  } catch (error) {
    const requestId = crearRequestId();
    registrarErrorApi({
      requestId,
      scope: "api_publica_plato_detalle",
      ruta: "/api/publico/platos/[slug]",
      metodo: "GET",
      detalle: "fallo_consulta_plato_publico_por_slug",
      error,
    });
    return responderErrorApi(500, "error_interno", "No se pudo consultar el plato", requestId);
  }
}
