import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { FormLogin } from "./form-login";

import { obtenerContextoSesionPorToken } from "@/src/api/privado/auth/servicio-auth";

export default async function PaginaLogin() {
  const token = (await cookies()).get("tpv_sesion")?.value;
  if (token) {
    const sesion = await obtenerContextoSesionPorToken(token);
    if (sesion) {
      redirect("/inicio");
    }
  }

  return (
    <main
      className="mx-auto flex min-h-[75vh] w-full max-w-5xl items-center justify-center px-4"
      id="contenido-principal"
    >
      <FormLogin />
    </main>
  );
}
