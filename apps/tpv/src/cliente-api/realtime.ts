export type EventoRealtimeCliente = {
  id: number;
  nombre: string;
  version: 1;
  ocurridoEn: string;
  canales: string[];
  payload: Record<string, unknown>;
};

type Params = {
  canales: string[];
  onEvento: (evento: EventoRealtimeCliente) => void;
};

export function conectarRealtime(params: Params) {
  let activo = true;
  let source: EventSource | null = null;
  let ultimoId = 0;

  const canalesParam = encodeURIComponent(params.canales.join(","));

  async function reproducirBacklog() {
    const respuesta = await fetch(
      `/api/privado/realtime/backlog?canales=${canalesParam}&desdeId=${ultimoId}&limite=200`,
      { cache: "no-store" },
    );
    if (!respuesta.ok) return;

    const data = (await respuesta.json()) as { ok: boolean; eventos?: EventoRealtimeCliente[] };
    for (const evento of data.eventos ?? []) {
      if (evento.id <= ultimoId) continue;
      ultimoId = evento.id;
      params.onEvento(evento);
    }
  }

  async function abrir() {
    if (!activo) return;

    await reproducirBacklog();
    if (!activo) return;

    source = new EventSource(`/api/privado/realtime/stream?canales=${canalesParam}`);

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as EventoRealtimeCliente;
        if (payload.id <= ultimoId) return;
        ultimoId = payload.id;
        params.onEvento(payload);
      } catch {
        // noop
      }
    };

    source.onerror = () => {
      source?.close();
      source = null;
      if (activo) {
        setTimeout(() => {
          void abrir();
        }, 1500);
      }
    };
  }

  void abrir();

  return () => {
    activo = false;
    source?.close();
    source = null;
  };
}
