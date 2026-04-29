import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Boton } from "@el-jardin/ui";

import { obtenerContextoSesionPorToken } from "@/src/api/privado/auth/servicio-auth";
import { BotonLogout } from "./boton-logout";

export default async function LayoutPrivado({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("tpv_sesion")?.value;

  if (!token) {
    redirect("/login");
  }

  const sesion = await obtenerContextoSesionPorToken(token);
  if (!sesion) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-slate-500">Sesion activa</p>
            <p className="text-sm font-semibold text-slate-900">Rol: {sesion.rolNombre}</p>
          </div>
          <nav aria-label="Navegacion privada principal" className="flex items-center gap-2">
            <Link href="/inicio">
              <Boton variante="secundario">Inicio privado</Boton>
            </Link>
            <Link href="/sala">
              <Boton variante="secundario">Sala</Boton>
            </Link>
            <Link href="/cocina">
              <Boton variante="secundario">Cocina</Boton>
            </Link>
            <Link href="/barra">
              <Boton variante="secundario">Barra</Boton>
            </Link>
            <Link href="/cancelaciones">
              <Boton variante="secundario">Cancelaciones</Boton>
            </Link>
            <Link href="/stock">
              <Boton variante="secundario">Stock</Boton>
            </Link>
            <Link href="/caja">
              <Boton variante="secundario">Caja</Boton>
            </Link>
            <Link href="/reservas">
              <Boton variante="secundario">Reservas</Boton>
            </Link>
            <Link href="/impresoras">
              <Boton variante="secundario">Impresoras</Boton>
            </Link>
            <Link href="/compras">
              <Boton variante="secundario">Compras</Boton>
            </Link>
            <Link href="/informes">
              <Boton variante="secundario">Informes</Boton>
            </Link>
            <BotonLogout />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="contenido-principal">
        {children}
      </main>
    </div>
  );
}
