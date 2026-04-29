import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

import { crearRequestId, registrarErrorApi } from "@/src/api/logging";
import {
  crearSesion,
  obtenerIpRequest,
  validarRateLimitAuth,
  verificarSecretoConMigracion,
} from "@/src/api/privado/auth/servicio-auth";
import { responderErrorApi } from "@/src/api/publico/respuestas";

const esquema = z.object({
  pin: z.string().min(4).max(12),
  dispositivoToken: z.string().min(3),
});

export async function POST(request: NextRequest) {
  const ip = obtenerIpRequest(request);
  const limite = validarRateLimitAuth(`pin:${ip}`, 10, 60_000);

  if (!limite.permitido) {
    return NextResponse.json(
      { codigo: "limite_superado", mensaje: "Demasiados intentos de PIN" },
      { status: 429, headers: { "Retry-After": String(limite.reintentarEn) } },
    );
  }

  try {
    const entrada = esquema.parse(await request.json());

    const dispositivo = await clientePrisma.dispositivo.findUnique({
      where: { tokenVinculo: entrada.dispositivoToken },
    });

    if (!dispositivo || !dispositivo.activo || dispositivo.eliminadoEn) {
      return responderErrorApi(403, "sin_permiso", "Dispositivo no autorizado");
    }

    const candidatos = await clientePrisma.usuario.findMany({
      where: { activo: true, eliminadoEn: null, pinHash: { not: null } },
      include: { rol: true },
    });

    let usuarioValido: (typeof candidatos)[number] | null = null;

    for (const candidato of candidatos) {
      const pinHash = candidato.pinHash;
      if (!pinHash) continue;

      const ok = await verificarSecretoConMigracion(pinHash, entrada.pin, async (nuevoHash) => {
        await clientePrisma.usuario.update({
          where: { id: candidato.id },
          data: { pinHash: nuevoHash },
        });
      });
      if (ok) {
        usuarioValido = candidato;
        break;
      }
    }

    if (!usuarioValido) {
      return responderErrorApi(401, "no_autenticado", "PIN invalido");
    }

    const sesion = await crearSesion({
      usuarioId: usuarioValido.id,
      dispositivoId: dispositivo.id,
      ip,
    });

    const respuesta = NextResponse.json({
      ok: true,
      token: sesion.tokenPlano,
      expiraEn: sesion.expiraEn.toISOString(),
      usuario: {
        id: usuarioValido.id,
        email: usuarioValido.email,
        nombre: usuarioValido.nombre,
        rol: usuarioValido.rol.nombre,
      },
    });

    respuesta.cookies.set("tpv_sesion", sesion.tokenPlano, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: sesion.expiraEn,
      path: "/",
    });

    return respuesta;
  } catch (error) {
    const requestId = crearRequestId();
    registrarErrorApi({
      requestId,
      scope: "api_privada_auth_pin",
      ruta: "/api/privado/auth/pin",
      metodo: "POST",
      detalle: "fallo_proceso_login_pin",
      error,
    });
    return responderErrorApi(
      400,
      "solicitud_invalida",
      "Datos invalidos para login por PIN",
      requestId,
    );
  }
}
