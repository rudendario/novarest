import { randomUUID } from "node:crypto";

type NivelLog = "error" | "warn" | "info";

type ContextoLog = {
  requestId: string;
  scope: string;
  ruta?: string;
  metodo?: string;
  detalle?: string;
};

export function crearRequestId() {
  return randomUUID();
}

function serializarError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { value: String(error) };
}

export function registrarLog(nivel: NivelLog, contexto: ContextoLog, error?: unknown) {
  const payload = {
    ts: new Date().toISOString(),
    nivel,
    requestId: contexto.requestId,
    scope: contexto.scope,
    ruta: contexto.ruta,
    metodo: contexto.metodo,
    detalle: contexto.detalle,
    error: error ? serializarError(error) : undefined,
  };

  if (nivel === "error") {
    console.error(payload);
    return;
  }
  if (nivel === "warn") {
    console.warn(payload);
    return;
  }
  console.info(payload);
}

export function registrarErrorApi(params: {
  requestId: string;
  scope: string;
  ruta?: string;
  metodo?: string;
  detalle?: string;
  error: unknown;
}) {
  registrarLog(
    "error",
    {
      requestId: params.requestId,
      scope: params.scope,
      ruta: params.ruta,
      metodo: params.metodo,
      detalle: params.detalle,
    },
    params.error,
  );
}
