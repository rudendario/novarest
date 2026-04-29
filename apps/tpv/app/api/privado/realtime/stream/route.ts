import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { obtenerContextoSesionPorToken } from "@/src/api/privado/auth/servicio-auth";
import {
  type EventoRealtimeEmitido,
  filtrarCanalesPermitidos,
  suscribirRealtime,
} from "@/src/realtime/servidor-realtime";

function formatearEventoSse(evento: EventoRealtimeEmitido) {
  return `id: ${evento.id}\nevent: ${evento.nombre}\ndata: ${JSON.stringify(evento)}\n\n`;
}

export async function GET(request: Request) {
  const token = (await cookies()).get("tpv_sesion")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "Sesion requerida" }, { status: 401 });
  }

  const sesion = await obtenerContextoSesionPorToken(token);
  if (!sesion) {
    return NextResponse.json({ ok: false, error: "Sesion invalida" }, { status: 401 });
  }

  const url = new URL(request.url);
  const canalesRaw = (url.searchParams.get("canales") ?? "sala").split(",");
  const canales = filtrarCanalesPermitidos(canalesRaw, sesion.permisos);

  if (canales.length === 0) {
    return NextResponse.json({ ok: false, error: "Sin canales autorizados" }, { status: 403 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const codificador = new TextEncoder();
      controller.enqueue(
        codificador.encode(`event: ready\ndata: ${JSON.stringify({ canales })}\n\n`),
      );

      const desuscribir = suscribirRealtime({
        canales,
        enviar: (evento) => {
          controller.enqueue(codificador.encode(formatearEventoSse(evento)));
        },
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(codificador.encode("event: ping\ndata: {}\n\n"));
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        desuscribir();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
