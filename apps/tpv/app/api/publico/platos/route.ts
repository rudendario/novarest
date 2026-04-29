import { esquemaPlatoPublico } from "@el-jardin/contratos";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { obtenerPlatosPublicos } from "@/src/api/publico/consultas-publicas";
import { validarRateLimit } from "@/src/api/publico/rate-limit";
import { responderErrorApi, responderOk } from "@/src/api/publico/respuestas";

const esquemaPlatosPublicos = z.array(esquemaPlatoPublico);

export async function GET(request: NextRequest) {
  const limite = validarRateLimit(request, {
    clave: "publico:platos",
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
    const platos = await obtenerPlatosPublicos();
    const payload = esquemaPlatosPublicos.parse(platos);

    return responderOk(payload, 180);
  } catch {
    return responderErrorApi(500, "error_interno", "No se pudo consultar platos publicos");
  }
}
