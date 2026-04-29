import { Prisma } from "@prisma/client";
import type { ConfiguracionNegocio } from "@prisma/client";

import { clientePrisma } from "../prisma/cliente-prisma";

export class RepositorioConfiguracionNegocioPrisma {
  async obtenerConfiguracionUnica(): Promise<ConfiguracionNegocio | null> {
    return clientePrisma.configuracionNegocio.findFirst();
  }

  async guardarConfiguracion(
    entrada: Omit<ConfiguracionNegocio, "creadoEn" | "actualizadoEn"> & {
      horarioJson?: Prisma.InputJsonValue | null;
    },
  ): Promise<ConfiguracionNegocio> {
    const horarioNormalizado = entrada.horarioJson === null ? Prisma.JsonNull : entrada.horarioJson;

    return clientePrisma.configuracionNegocio.upsert({
      where: { id: entrada.id },
      update: {
        nombreComercial: entrada.nombreComercial,
        telefono: entrada.telefono,
        email: entrada.email,
        direccion: entrada.direccion,
        moneda: entrada.moneda,
        impuestosIncluidos: entrada.impuestosIncluidos,
        horarioJson: horarioNormalizado,
        publicadoWeb: entrada.publicadoWeb,
      },
      create: {
        ...entrada,
        horarioJson: horarioNormalizado,
      },
    });
  }
}
