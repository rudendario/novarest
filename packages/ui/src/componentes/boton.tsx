import type * as React from "react";

type PropiedadesBoton = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "secundario" | "fantasma";
};

const clasesPorVariante: Record<NonNullable<PropiedadesBoton["variante"]>, string> = {
  primario: "bg-emerald-600 text-white hover:bg-emerald-500",
  secundario: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  fantasma: "bg-transparent text-slate-700 hover:bg-slate-100",
};

export function Boton({ variante = "primario", className = "", ...props }: PropiedadesBoton) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${clasesPorVariante[variante]} ${className}`}
      {...props}
    />
  );
}
