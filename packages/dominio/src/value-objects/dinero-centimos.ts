export class ErrorDineroInvalido extends Error {
  constructor(cantidadCentimos: number) {
    super(`Cantidad invalida en centimos: ${cantidadCentimos}`);
    this.name = "ErrorDineroInvalido";
  }
}

export class DineroCentimos {
  private constructor(public readonly valor: number) {}

  static crear(cantidadCentimos: number): DineroCentimos {
    if (!Number.isInteger(cantidadCentimos) || cantidadCentimos < 0) {
      throw new ErrorDineroInvalido(cantidadCentimos);
    }

    return new DineroCentimos(cantidadCentimos);
  }

  sumar(otro: DineroCentimos): DineroCentimos {
    return new DineroCentimos(this.valor + otro.valor);
  }
}
