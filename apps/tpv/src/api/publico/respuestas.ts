import { NextResponse } from "next/server";

import type { ErrorApi } from "@el-jardin/contratos";

export function responderErrorApi(
  estado: number,
  codigo: ErrorApi["codigo"],
  mensaje: string,
  requestId?: string,
) {
  const error: ErrorApi = { codigo, mensaje, requestId };

  return NextResponse.json(error, {
    status: estado,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export function responderOk<T>(payload: T, segundosCache = 60) {
  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": `public, s-maxage=${segundosCache}, stale-while-revalidate=60`,
    },
  });
}
