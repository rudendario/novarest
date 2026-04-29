import * as React from "react";

export function EstadoVacio({ titulo, detalle }: { titulo: string; detalle?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-base font-semibold text-slate-800">{titulo}</p>
      {detalle ? <p className="mt-1 text-sm text-slate-500">{detalle}</p> : null}
    </div>
  );
}
