import { type NextRequest, NextResponse } from "next/server";

const rutasAuthPublicas = [
  "/api/privado/auth/login",
  "/api/privado/auth/pin",
  "/api/privado/auth/logout",
  "/api/privado/auth/sesion",
];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (!path.startsWith("/api/privado")) {
    return NextResponse.next();
  }

  if (rutasAuthPublicas.some((ruta) => path.startsWith(ruta))) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");
  const tokenHeader = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const tokenCookie = request.cookies.get("tpv_sesion")?.value ?? null;

  if (!tokenHeader && !tokenCookie) {
    return NextResponse.json(
      { codigo: "no_autenticado", mensaje: "Sesion requerida" },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/privado/:path*"],
};
