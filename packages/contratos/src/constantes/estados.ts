export const ESTADOS_PRODUCTO_INTERNO = [
  "disponible",
  "stock_bajo",
  "ultimas_unidades",
  "agotado",
  "pausado",
  "demora",
] as const;

export const ESTADOS_PRODUCTO_PUBLICO = [
  "visible",
  "oculto",
  "agotado",
  "temporalmente_no_disponible",
] as const;

export const ESTADOS_MENU_DIA = ["borrador", "publicado", "retirado"] as const;

export const ESTADOS_PEDIDO = [
  "abierto",
  "enviado",
  "parcialmente_servido",
  "servido",
  "en_cobro",
  "cobrado",
  "cancelado",
] as const;

export const ESTADOS_LINEA_PEDIDO = [
  "pendiente",
  "confirmada",
  "en_preparacion",
  "lista",
  "servida",
  "cancelada",
] as const;

export const ESTADOS_CAJA = ["cerrada", "abierta", "cuadrada", "descuadrada"] as const;

export const ESTADOS_RESERVA = [
  "solicitud",
  "confirmada",
  "en_riesgo",
  "no_presentado",
  "completada",
  "cancelada",
] as const;

export const ESTADOS_LISTA_ESPERA = [
  "esperando",
  "avisado",
  "atendido",
  "cancelado",
  "sin_respuesta",
] as const;
