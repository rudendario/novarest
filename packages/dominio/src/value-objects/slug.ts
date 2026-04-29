export class ErrorSlugInvalido extends Error {
  constructor(slug: string) {
    super(`Slug invalido: ${slug}`);
    this.name = "ErrorSlugInvalido";
  }
}

export class Slug {
  private constructor(public readonly valor: string) {}

  static crear(entrada: string): Slug {
    const slug = entrada.trim().toLowerCase();
    const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!regex.test(slug)) {
      throw new ErrorSlugInvalido(entrada);
    }

    return new Slug(slug);
  }
}
