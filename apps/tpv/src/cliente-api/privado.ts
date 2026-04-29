import type { PermisoBase } from "@el-jardin/contratos";

export type RespuestaSesion = {
  ok: boolean;
  sesion?: {
    usuarioId: string;
    rolNombre: string;
    permisos: PermisoBase[];
    dispositivoId: string;
    sesionId: string;
  };
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const respuesta = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!respuesta.ok) {
    const err = await respuesta.json().catch(() => ({}));
    throw new Error((err as { mensaje?: string }).mensaje ?? "Error de autenticacion");
  }

  return (await respuesta.json()) as T;
}

export function loginEmailPassword(params: {
  email: string;
  password: string;
  dispositivoToken: string;
}) {
  return postJson("/api/privado/auth/login", params);
}

export function loginPin(params: { pin: string; dispositivoToken: string }) {
  return postJson("/api/privado/auth/pin", params);
}

export async function logoutSesion() {
  await fetch("/api/privado/auth/logout", { method: "POST" });
}

export async function obtenerSesionActual(): Promise<RespuestaSesion> {
  const respuesta = await fetch("/api/privado/auth/sesion", { cache: "no-store" });
  if (!respuesta.ok) {
    return { ok: false };
  }

  return (await respuesta.json()) as RespuestaSesion;
}
