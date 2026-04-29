-- CreateEnum
CREATE TYPE "TipoTicketImpresion" AS ENUM ('cocina', 'barra', 'precuenta', 'recibo', 'prueba');

-- CreateEnum
CREATE TYPE "EstadoTrabajoImpresion" AS ENUM ('pendiente', 'enviado', 'error');

-- CreateTable
CREATE TABLE "Impresora" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "zonaId" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "tipoConexion" TEXT NOT NULL DEFAULT 'red',
    "endpoint" TEXT,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Impresora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrabajoImpresion" (
    "id" TEXT NOT NULL,
    "impresoraId" TEXT,
    "tipoTicket" "TipoTicketImpresion" NOT NULL,
    "estado" "EstadoTrabajoImpresion" NOT NULL DEFAULT 'pendiente',
    "referenciaTipo" TEXT,
    "referenciaId" TEXT,
    "contenido" JSONB NOT NULL,
    "errorDetalle" TEXT,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoEn" TIMESTAMP(3),

    CONSTRAINT "TrabajoImpresion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Impresora_zonaId_activa_prioridad_idx" ON "Impresora"("zonaId", "activa", "prioridad");

-- CreateIndex
CREATE INDEX "TrabajoImpresion_estado_creadoEn_idx" ON "TrabajoImpresion"("estado", "creadoEn");

-- CreateIndex
CREATE INDEX "TrabajoImpresion_tipoTicket_creadoEn_idx" ON "TrabajoImpresion"("tipoTicket", "creadoEn");

-- AddForeignKey
ALTER TABLE "Impresora" ADD CONSTRAINT "Impresora_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrabajoImpresion" ADD CONSTRAINT "TrabajoImpresion_impresoraId_fkey" FOREIGN KEY ("impresoraId") REFERENCES "Impresora"("id") ON DELETE SET NULL ON UPDATE CASCADE;
