import { esquemaCategoriaPublica } from "@el-jardin/contratos";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { crearRequestId, registrarErrorApi } from "@/src/api/logging";
import { obtenerCategoriasPublicas } from "@/src/api/publico/consultas-publicas";
import { validarRateLimit } from "@/src/api/publico/rate-limit";
import { responderErrorApi, responderOk } from "@/src/api/publico/respuestas";

const esquemaCategoriasPublicas = z.array(esquemaCategoriaPublica);

export async function GET(request: NextRequest) {
  const limite = validarRateLimit(request, {
    clave: "publico:categorias",
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
    const categorias = await obtenerCategoriasPublicas();
    const payload = esquemaCategoriasPublicas.parse(categorias);

    return responderOk(payload, 300);
  } catch (error) {
    const requestId = crearRequestId();
    registrarErrorApi({
      requestId,
      scope: "api_publica_categorias",
      ruta: "/api/publico/categorias",
      metodo: "GET",
      detalle: "fallo_consulta_categorias_publicas",
      error,
    });
    return responderErrorApi(
      500,
      "error_interno",
      "No se pudo consultar categorias publicas",
      requestId,
    );
  }
}
