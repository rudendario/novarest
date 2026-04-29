import { esquemaCartaPublica } from "@el-jardin/contratos";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { crearRequestId, registrarErrorApi } from "@/src/api/logging";
import {
  obtenerCategoriasPublicas,
  obtenerNegocioPublico,
  obtenerPlatosPublicos,
} from "@/src/api/publico/consultas-publicas";
import { validarRateLimit } from "@/src/api/publico/rate-limit";
import { responderErrorApi, responderOk } from "@/src/api/publico/respuestas";

export async function GET(request: NextRequest) {
  const limite = validarRateLimit(request, {
    clave: "publico:carta",
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

  try {
    const [negocio, categorias, platos] = await Promise.all([
      obtenerNegocioPublico(),
      obtenerCategoriasPublicas(),
      obtenerPlatosPublicos(),
    ]);

    if (!negocio) {
      return responderErrorApi(404, "no_encontrado", "Negocio publico no disponible");
    }

    const payload = esquemaCartaPublica.parse({
      negocio,
      categorias,
      platos,
    });

    return responderOk(payload, 180);
  } catch (error) {
    const requestId = crearRequestId();
    registrarErrorApi({
      requestId,
      scope: "api_publica_carta",
      ruta: "/api/publico/carta",
      metodo: "GET",
      detalle: "fallo_consulta_carta_publica",
      error,
    });
    return responderErrorApi(500, "error_interno", "No se pudo consultar carta publica", requestId);
  }
}
