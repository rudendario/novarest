export function escaparCampoCsv(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined) return "";
  const texto = String(valor);
  const requiereComillas = /[",\n\r]/.test(texto);
  const escapado = texto.replaceAll('"', '""');
  return requiereComillas ? `"${escapado}"` : escapado;
}

export function lineaCsv(columnas: Array<string | number | null | undefined>) {
  return columnas.map(escaparCampoCsv).join(",");
}
