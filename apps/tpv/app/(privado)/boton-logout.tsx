"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Boton } from "@el-jardin/ui";

export function BotonLogout() {
  const router = useRouter();
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cerrar() {
    setError(null);
    setCerrando(true);
    try {
      await fetch("/api/privado/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setError("No se pudo cerrar sesion.");
    } finally {
      setCerrando(false);
    }
  }

  return (
    <div className="grid justify-items-end gap-1">
      <Boton disabled={cerrando} onClick={cerrar} type="button" variante="fantasma">
        {cerrando ? "Cerrando..." : "Cerrar sesion"}
      </Boton>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
