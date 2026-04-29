-- CreateEnum
CREATE TYPE "EstadoCaja" AS ENUM ('cerrada', 'abierta', 'cuadrada', 'descuadrada');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('efectivo', 'tarjeta', 'mixto');

-- CreateTable
CREATE TABLE "Caja" (
    "id" TEXT NOT NULL,
    "estado" "EstadoCaja" NOT NULL DEFAULT 'abierta',
    "abiertaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradaEn" TIMESTAMP(3),
    "saldoInicial" INTEGER NOT NULL DEFAULT 0,
    "saldoFinal" INTEGER,
    "totalEfectivo" INTEGER NOT NULL DEFAULT 0,
    "totalTarjeta" INTEGER NOT NULL DEFAULT 0,
    "abiertaPorId" TEXT,
    "cerradaPorId" TEXT,

    CONSTRAINT "Caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoCaja" (
    "id" TEXT NOT NULL,
    "cajaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "metodo" "MetodoPago",
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "pedidoId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPorId" TEXT,

    CONSTRAINT "MovimientoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "cajaId" TEXT NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "montoTotal" INTEGER NOT NULL,
    "montoEfectivo" INTEGER NOT NULL DEFAULT 0,
    "montoTarjeta" INTEGER NOT NULL DEFAULT 0,
    "cobradoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagoPedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Caja_estado_abiertaEn_idx" ON "Caja"("estado", "abiertaEn");

-- CreateIndex
CREATE INDEX "MovimientoCaja_cajaId_creadoEn_idx" ON "MovimientoCaja"("cajaId", "creadoEn");

-- CreateIndex
CREATE INDEX "PagoPedido_pedidoId_cobradoEn_idx" ON "PagoPedido"("pedidoId", "cobradoEn");

-- CreateIndex
CREATE INDEX "PagoPedido_cajaId_cobradoEn_idx" ON "PagoPedido"("cajaId", "cobradoEn");

-- AddForeignKey
ALTER TABLE "Caja" ADD CONSTRAINT "Caja_abiertaPorId_fkey" FOREIGN KEY ("abiertaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caja" ADD CONSTRAINT "Caja_cerradaPorId_fkey" FOREIGN KEY ("cerradaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoPedido" ADD CONSTRAINT "PagoPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoPedido" ADD CONSTRAINT "PagoPedido_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;