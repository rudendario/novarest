-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('pendiente', 'confirmada', 'sentada', 'completada', 'cancelada', 'no_show');

-- CreateEnum
CREATE TYPE "EstadoListaEspera" AS ENUM ('esperando', 'avisado', 'sentado', 'cancelado');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "mesaId" TEXT,
    "nombreCliente" TEXT NOT NULL,
    "telefonoContacto" TEXT,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "comensales" INTEGER NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,
    "canceladaEn" TIMESTAMP(3),

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntradaEspera" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "nombreCliente" TEXT NOT NULL,
    "telefonoContacto" TEXT,
    "comensales" INTEGER NOT NULL,
    "estado" "EstadoListaEspera" NOT NULL DEFAULT 'esperando',
    "notas" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,
    "atendidaEn" TIMESTAMP(3),

    CONSTRAINT "EntradaEspera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_telefono_idx" ON "Cliente"("telefono");

-- CreateIndex
CREATE INDEX "Reserva_fechaHora_estado_idx" ON "Reserva"("fechaHora", "estado");

-- CreateIndex
CREATE INDEX "Reserva_clienteId_fechaHora_idx" ON "Reserva"("clienteId", "fechaHora");

-- CreateIndex
CREATE INDEX "Reserva_mesaId_fechaHora_idx" ON "Reserva"("mesaId", "fechaHora");

-- CreateIndex
CREATE INDEX "EntradaEspera_estado_creadaEn_idx" ON "EntradaEspera"("estado", "creadaEn");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaEspera" ADD CONSTRAINT "EntradaEspera_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
