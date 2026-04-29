-- CreateTable
CREATE TABLE "StockFisico" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadDisponible" INTEGER NOT NULL DEFAULT 0,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockFisico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaStock" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "lineaPedidoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liberadaEn" TIMESTAMP(3),

    CONSTRAINT "ReservaStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "referenciaTipo" TEXT,
    "referenciaId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockFisico_productoId_key" ON "StockFisico"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservaStock_productoId_lineaPedidoId_key" ON "ReservaStock"("productoId", "lineaPedidoId");

-- CreateIndex
CREATE INDEX "ReservaStock_productoId_activa_idx" ON "ReservaStock"("productoId", "activa");

-- CreateIndex
CREATE INDEX "MovimientoStock_productoId_creadoEn_idx" ON "MovimientoStock"("productoId", "creadoEn");

-- AddForeignKey
ALTER TABLE "StockFisico" ADD CONSTRAINT "StockFisico_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaStock" ADD CONSTRAINT "ReservaStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaStock" ADD CONSTRAINT "ReservaStock_lineaPedidoId_fkey" FOREIGN KEY ("lineaPedidoId") REFERENCES "LineaPedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;