import type * as React from "react";

export function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 text-sm text-slate-700">
      <span className="font-medium">{etiqueta}</span>
      {children}
    </div>
  );
}
