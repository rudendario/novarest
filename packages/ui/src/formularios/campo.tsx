import type * as React from "react";
import { Children, cloneElement, isValidElement, useId } from "react";

export function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  const inputId = useId();
  const unico = Children.only(children) as React.ReactNode;
  const elemento = isValidElement<{ id?: string }>(unico) ? unico : null;
  const idFinal = elemento?.props?.id ?? inputId;

  const hijoConId =
    elemento && !elemento.props.id ? cloneElement(elemento, { id: idFinal }) : unico;

  return (
    <div className="grid gap-1 text-sm text-slate-700">
      <label className="font-medium" htmlFor={idFinal}>
        {etiqueta}
      </label>
      {hijoConId}
    </div>
  );
}
