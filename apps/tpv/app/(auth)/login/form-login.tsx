"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Boton, Campo, Input, Tarjeta } from "@el-jardin/ui";

import { loginEmailPassword, loginPin } from "@/src/cliente-api/privado";

type Modo = "password" | "pin";

export function FormLogin() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("password");
  const [email, setEmail] = useState("admin@eljardin.local");
  const [password, setPassword] = useState("admin1234");
  const [pin, setPin] = useState("1234");
  const [dispositivoToken, setDispositivoToken] = useState("terminal-admin-1");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titulo = useMemo(
    () => (modo === "password" ? "Acceso por email y password" : "Acceso rapido por PIN"),
    [modo],
  );

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCargando(true);

    try {
      if (modo === "password") {
        await loginEmailPassword({ email, password, dispositivoToken });
      } else {
        await loginPin({ pin, dispositivoToken });
      }

      router.push("/inicio");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesion");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Tarjeta className="mx-auto w-full max-w-md p-6">
      <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1 text-sm">
        <button
          className={`flex-1 rounded-lg px-3 py-2 ${modo === "password" ? "bg-white font-medium" : "text-slate-600"}`}
          onClick={() => setModo("password")}
          type="button"
        >
          Email
        </button>
        <button
          className={`flex-1 rounded-lg px-3 py-2 ${modo === "pin" ? "bg-white font-medium" : "text-slate-600"}`}
          onClick={() => setModo("pin")}
          type="button"
        >
          PIN
        </button>
      </div>

      <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
      <p className="mt-1 text-sm text-slate-500">Selecciona modo y dispositivo autorizado.</p>

      <form className="mt-4 grid gap-3" onSubmit={enviar}>
        <Campo etiqueta="Token de dispositivo">
          <Input
            value={dispositivoToken}
            onChange={(e) => setDispositivoToken(e.target.value)}
            required
          />
        </Campo>

        {modo === "password" ? (
          <>
            <Campo etiqueta="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Campo>
            <Campo etiqueta="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Campo>
          </>
        ) : (
          <Campo etiqueta="PIN">
            <Input type="password" value={pin} onChange={(e) => setPin(e.target.value)} required />
          </Campo>
        )}

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        <Boton disabled={cargando} type="submit">
          {cargando ? "Entrando..." : "Iniciar sesion"}
        </Boton>
      </form>
    </Tarjeta>
  );
}
