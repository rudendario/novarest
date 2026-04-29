import * as React from "react";

type Estado = "visible" | "agotado" | "temporalmente_no_disponible" | "oculto";

const estilos: Record<Estado, string> = {
  visible: "bg-emerald-100 text-emerald-700",
  agotado: "bg-rose-100 text-rose-700",
  temporalmente_no_disponible: "bg-amber-100 text-amber-700",
  oculto: "bg-slate-100 text-slate-600",
};

export function BadgeEstado({ estado }: { estado: Estado }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${estilos[estado]}`}>
      {estado.replaceAll("_", " ")}
    </span>
  );
}
