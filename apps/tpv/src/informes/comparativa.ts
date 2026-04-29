export function inicioDiaLocal(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
}

export function calcularDeltaComparativa(actualTotalCentimos: number, previoTotalCentimos: number) {
  const deltaCentimos = actualTotalCentimos - previoTotalCentimos;
  const deltaPct =
    previoTotalCentimos > 0 ? Math.round((deltaCentimos / previoTotalCentimos) * 100) : 0;
  return { deltaCentimos, deltaPct };
}

export function calcularRangoPrevio(
  actualDesde: Date,
  actualHasta: Date,
  previoDesde?: Date,
  previoHasta?: Date,
) {
  const desde =
    previoDesde ??
    new Date(actualDesde.getTime() - (actualHasta.getTime() - actualDesde.getTime()));
  const hasta = previoHasta ?? actualDesde;
  return { desde, hasta };
}
