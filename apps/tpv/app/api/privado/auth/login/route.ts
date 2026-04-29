import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

import {
  crearSesion,
  hashSecreto,
  obtenerIpRequest,
  validarRateLimitAuth,
  verificarSecreto,
} from "@/src/api/privado/auth/servicio-auth";
import { responderErrorApi } from "@/src/api/publico/respuestas";

const esquema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  dispositivoToken: z.string().min(3),
});

export async function POST(request: NextRequest) {
  const ip = obtenerIpRequest(request);
  const limite = validarRateLimitAuth(`login:${ip}`, 8, 60_000);

  if (!limite.permitido) {
    return NextResponse.json(
      { codigo: "limite_superado", mensaje: "Demasiados intentos de login" },
      { status: 429, headers: { "Retry-After": String(limite.reintentarEn) } },
    );
  }

  try {
    const entrada = esquema.parse(await request.json());

    const usuario = await clientePrisma.usuario.findUnique({
      where: { email: entrada.email },
      include: { rol: true },
    });

    if (!usuario || !usuario.activo || usuario.eliminadoEn) {
      return responderErrorApi(401, "no_autenticado", "Credenciales invalidas");
    }

    if (!usuario.hashPassword.startsWith("$argon2")) {
      const nuevoHash = await hashSecreto(entrada.password);
      await clientePrisma.usuario.update({
        where: { id: usuario.id },
        data: { hashPassword: nuevoHash },
      });
    }

    const usuarioActualizado = await clientePrisma.usuario.findUnique({
      where: { id: usuario.id },
    });
    if (!usuarioActualizado) {
      return responderErrorApi(401, "no_autenticado", "Credenciales invalidas");
    }

    const ok = await verificarSecreto(usuarioActualizado.hashPassword, entrada.password);
    if (!ok) {
      await clientePrisma.registroAuditoria.create({
        data: {
          usuarioId: usuario.id,
          rolNombre: usuario.rol.nombre,
          accion: "login_fallido",
          entidad: "Usuario",
          entidadId: usuario.id,
          ip,
        },
      });
      return responderErrorApi(401, "no_autenticado", "Credenciales invalidas");
    }

    let dispositivo = await clientePrisma.dispositivo.findUnique({
      where: { tokenVinculo: entrada.dispositivoToken },
    });

    if (!dispositivo) {
      dispositivo = await clientePrisma.dispositivo.create({
        data: {
          tokenVinculo: entrada.dispositivoToken,
          nombre: "dispositivo-auto",
          tipo: "admin",
          activo: true,
        },
      });
    }

    if (!dispositivo.activo || dispositivo.eliminadoEn) {
      return responderErrorApi(403, "sin_permiso", "Dispositivo inactivo");
    }

    const sesion = await crearSesion({
      usuarioId: usuario.id,
      dispositivoId: dispositivo.id,
      ip,
    });

    const respuesta = NextResponse.json({
      ok: true,
      token: sesion.tokenPlano,
      expiraEn: sesion.expiraEn.toISOString(),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol.nombre,
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
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para login");
  }
}
