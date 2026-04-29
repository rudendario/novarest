import { esquemaNegocioPublico } from "@el-jardin/contratos";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { crearRequestId, registrarErrorApi } from "@/src/api/logging";
import { obtenerNegocioPublico } from "@/src/api/publico/consultas-publicas";
import { validarRateLimit } from "@/src/api/publico/rate-limit";
import { responderErrorApi, responderOk } from "@/src/api/publico/respuestas";

export async function GET(request: NextRequest) {
  const limite = validarRateLimit(request, {
    clave: "publico:negocio",
    ventanaMs: 60_000,
    maxPeticiones: 90,
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

  try {
    const negocio = await obtenerNegocioPublico();

    if (!negocio) {
      return responderErrorApi(404, "no_encontrado", "Negocio publico no disponible");
    }

    const payload = esquemaNegocioPublico.parse(negocio);

    return responderOk(payload, 300);
  } catch (error) {
    const requestId = crearRequestId();
    registrarErrorApi({
      requestId,
      scope: "api_publica_negocio",
      ruta: "/api/publico/negocio",
      metodo: "GET",
      detalle: "fallo_consulta_negocio_publico",
      error,
    });
    return responderErrorApi(
      500,
      "error_interno",
      "No se pudo consultar negocio publico",
      requestId,
    );
  }
}
