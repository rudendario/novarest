import type * as React from "react";

type PropiedadesTarjeta = React.HTMLAttributes<HTMLDivElement>;

export function Tarjeta({ className = "", ...props }: PropiedadesTarjeta) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
      {...props}
    />
  );
}
