import { createHash, randomBytes } from "node:crypto";

import { PERMISOS_BASE, type PermisoBase } from "@el-jardin/contratos";
import { clientePrisma } from "@el-jardin/infra";
import { hash, verify } from "@node-rs/argon2";

import { responderErrorApi } from "@/src/api/publico/respuestas";

type ContextoSesion = {
  usuarioId: string;
  rolNombre: string;
  permisos: PermisoBase[];
  dispositivoId: string;
  sesionId: string;
};

type ResultadoExigirSesion =
  | { ok: true; contexto: ContextoSesion }
  | { ok: false; response: ReturnType<typeof responderErrorApi> };

const DURACION_SESION_MS = 1000 * 60 * 60 * 8;

function hashToken(tokenPlano: string) {
  return createHash("sha256").update(tokenPlano).digest("hex");
}

export async function obtenerContextoSesionPorToken(
  tokenPlano: string,
): Promise<ContextoSesion | null> {
  const tokenHash = hashToken(tokenPlano);
  const sesion = await clientePrisma.sesion.findFirst({
    where: {
      tokenHash,
      revocadaEn: null,
      expiraEn: { gt: new Date() },
    },
    include: {
      usuario: {
        include: {
          rol: true,
          permisosAsignados: true,
        },
      },
      dispositivo: true,
    },
  });

  if (
    !sesion ||
    !sesion.usuario.activo ||
    sesion.usuario.eliminadoEn ||
    !sesion.dispositivo.activo
  ) {
    return null;
  }

  const permisos = resolverPermisos(sesion.usuario.rol.nombre, sesion.usuario.permisosAsignados);

  return {
    usuarioId: sesion.usuarioId,
    rolNombre: sesion.usuario.rol.nombre,
    permisos,
    dispositivoId: sesion.dispositivoId,
    sesionId: sesion.id,
  };
}

function extraerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  const cookie = request.headers.get("cookie") ?? "";
  const entrada = cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("tpv_sesion="));

  if (!entrada) {
    return null;
  }

  return decodeURIComponent(entrada.slice("tpv_sesion=".length));
}

function resolverPermisos(
  rolNombre: string,
  permisosAsignados: Array<{ permiso: string; concedido: boolean }>,
): PermisoBase[] {
  if (rolNombre === "propietario" || rolNombre === "administrador") {
    return [...PERMISOS_BASE];
  }

  const permitidos = permisosAsignados
    .filter((permiso) => permiso.concedido)
    .map((permiso) => permiso.permiso)
    .filter((permiso): permiso is PermisoBase => PERMISOS_BASE.includes(permiso as PermisoBase));

  return Array.from(new Set(permitidos));
}

export async function hashSecreto(textoPlano: string) {
  return hash(textoPlano, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verificarSecreto(hashGuardado: string, textoPlano: string) {
  return verify(hashGuardado, textoPlano);
}

export async function crearSesion(params: {
  usuarioId: string;
  dispositivoId: string;
  requestId?: string;
  ip?: string;
}) {
  const tokenPlano = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(tokenPlano);
  const expiraEn = new Date(Date.now() + DURACION_SESION_MS);

  const sesion = await clientePrisma.sesion.create({
    data: {
      usuarioId: params.usuarioId,
      dispositivoId: params.dispositivoId,
      tokenHash,
      expiraEn,
    },
  });

  await clientePrisma.registroAuditoria.create({
    data: {
      usuarioId: params.usuarioId,
      rolNombre: "autenticado",
      accion: "login_exitoso",
      entidad: "Sesion",
      entidadId: sesion.id,
      ip: params.ip ?? null,
      requestId: params.requestId ?? null,
      valoresNuevos: { dispositivoId: params.dispositivoId, expiraEn: expiraEn.toISOString() },
    },
  });

  return { tokenPlano, sesion, expiraEn };
}

export async function cerrarSesion(tokenPlano: string) {
  const tokenHash = hashToken(tokenPlano);

  await clientePrisma.sesion.updateMany({
    where: {
      tokenHash,
      revocadaEn: null,
    },
    data: {
      revocadaEn: new Date(),
    },
  });
}

export async function exigirSesion(
  request: Request,
  permiso?: PermisoBase,
): Promise<ResultadoExigirSesion> {
  const token = extraerToken(request);
  if (!token) {
    return { ok: false, response: responderErrorApi(401, "no_autenticado", "Sesion requerida") };
  }

  const contexto = await obtenerContextoSesionPorToken(token);
  if (!contexto) {
    return {
      ok: false,
      response: responderErrorApi(401, "no_autenticado", "Sesion invalida o expirada"),
    };
  }

  if (permiso && !contexto.permisos.includes(permiso)) {
    return { ok: false, response: responderErrorApi(403, "sin_permiso", "Permiso insuficiente") };
  }

  return {
    ok: true,
    contexto,
  };
}

const intentosLogin = new Map<string, { hasta: number; total: number }>();

export function validarRateLimitAuth(clave: string, maximo: number, ventanaMs: number) {
  const ahora = Date.now();
  const actual = intentosLogin.get(clave);

  if (!actual || actual.hasta < ahora) {
    intentosLogin.set(clave, { hasta: ahora + ventanaMs, total: 1 });
    return { permitido: true, reintentarEn: 0 };
  }

  if (actual.total >= maximo) {
    return { permitido: false, reintentarEn: Math.ceil((actual.hasta - ahora) / 1000) };
  }

  actual.total += 1;
  intentosLogin.set(clave, actual);
  return { permitido: true, reintentarEn: 0 };
}

export function obtenerIpRequest(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "sin-ip"
  );
}
