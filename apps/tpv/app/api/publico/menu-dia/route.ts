import { esquemaMenuDiaPublico } from "@el-jardin/contratos";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { crearRequestId, registrarErrorApi } from "@/src/api/logging";
import { obtenerMenuDiaPublico } from "@/src/api/publico/consultas-publicas";
import { validarRateLimit } from "@/src/api/publico/rate-limit";
import { responderErrorApi, responderOk } from "@/src/api/publico/respuestas";

export async function GET(request: NextRequest) {
  const limite = validarRateLimit(request, {
    clave: "publico:menu-dia",
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
    const menu = await obtenerMenuDiaPublico(new Date());

    if (!menu) {
      return responderErrorApi(404, "no_encontrado", "Menu del dia no disponible");
    }

    const payload = esquemaMenuDiaPublico.parse(menu);

    return responderOk(payload, 120);
  } catch (error) {
    const requestId = crearRequestId();
    registrarErrorApi({
      requestId,
      scope: "api_publica_menu_dia",
      ruta: "/api/publico/menu-dia",
      metodo: "GET",
      detalle: "fallo_consulta_menu_dia_publico",
      error,
    });
    return responderErrorApi(500, "error_interno", "No se pudo consultar menu del dia", requestId);
  }
}
