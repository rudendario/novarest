export const CODIGOS_ERROR_API = [
  "solicitud_invalida",
  "no_autenticado",
  "sin_permiso",
  "no_encontrado",
  "conflicto",
  "limite_superado",
  "error_interno",
] as const;

export type CodigoErrorApi = (typeof CODIGOS_ERROR_API)[number];

export type ErrorApi = {
  codigo: CodigoErrorApi;
  mensaje: string;
  detalle?: string;
  requestId?: string;
};
