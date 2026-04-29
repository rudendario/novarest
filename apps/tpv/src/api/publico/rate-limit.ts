import type { NextRequest } from "next/server";

type EntradaRateLimit = {
  ventanaMs: number;
  maxPeticiones: number;
  clave: string;
};

type EstadoRateLimit = {
  reiniciaEn: number;
  peticiones: number;
};

const almacenamientoRateLimit = new Map<string, EstadoRateLimit>();

export function validarRateLimit(request: NextRequest, entrada: EntradaRateLimit) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "sin-ip";

  const ahora = Date.now();
  const llave = `${entrada.clave}:${ip}`;
  const actual = almacenamientoRateLimit.get(llave);

  if (!actual || actual.reiniciaEn <= ahora) {
    almacenamientoRateLimit.set(llave, {
      reiniciaEn: ahora + entrada.ventanaMs,
      peticiones: 1,
    });

    return {
      permitido: true,
      restantes: entrada.maxPeticiones - 1,
      reiniciaEn: ahora + entrada.ventanaMs,
    };
  }

  if (actual.peticiones >= entrada.maxPeticiones) {
    return { permitido: false, restantes: 0, reiniciaEn: actual.reiniciaEn };
  }

  actual.peticiones += 1;
  almacenamientoRateLimit.set(llave, actual);

  return {
    permitido: true,
    restantes: Math.max(entrada.maxPeticiones - actual.peticiones, 0),
    reiniciaEn: actual.reiniciaEn,
  };
}
