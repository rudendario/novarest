-- CreateTable
CREATE TABLE "SesionPago" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "cajaId" TEXT NOT NULL,
    "totalObjetivo" INTEGER NOT NULL,
    "totalAcumulado" INTEGER NOT NULL DEFAULT 0,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradaEn" TIMESTAMP(3),

    CONSTRAINT "SesionPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoDividido" (
    "id" TEXT NOT NULL,
    "sesionPagoId" TEXT NOT NULL,
    "indice" INTEGER NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "montoTotal" INTEGER NOT NULL,
    "montoEfectivo" INTEGER NOT NULL DEFAULT 0,
    "montoTarjeta" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagoDividido_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "PagoPedido" ADD COLUMN "sesionPagoId" TEXT;

-- CreateIndex
CREATE INDEX "SesionPago_pedidoId_creadaEn_idx" ON "SesionPago"("pedidoId", "creadaEn");

-- CreateIndex
CREATE INDEX "SesionPago_cajaId_creadaEn_idx" ON "SesionPago"("cajaId", "creadaEn");

-- CreateIndex
CREATE UNIQUE INDEX "PagoDividido_sesionPagoId_indice_key" ON "PagoDividido"("sesionPagoId", "indice");

-- CreateIndex
CREATE INDEX "PagoDividido_sesionPagoId_creadoEn_idx" ON "PagoDividido"("sesionPagoId", "creadoEn");

-- AddForeignKey
ALTER TABLE "SesionPago" ADD CONSTRAINT "SesionPago_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionPago" ADD CONSTRAINT "SesionPago_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoPedido" ADD CONSTRAINT "PagoPedido_sesionPagoId_fkey" FOREIGN KEY ("sesionPagoId") REFERENCES "SesionPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDividido" ADD CONSTRAINT "PagoDividido_sesionPagoId_fkey" FOREIGN KEY ("sesionPagoId") REFERENCES "SesionPago"("id") ON DELETE CASCADE ON UPDATE CASCADE;