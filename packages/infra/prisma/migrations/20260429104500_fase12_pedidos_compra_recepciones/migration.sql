-- CreateEnum
CREATE TYPE "EstadoPedidoCompra" AS ENUM ('borrador', 'enviado', 'parcialmente_recibido', 'recibido', 'cancelado');

-- CreateTable
CREATE TABLE "PedidoCompra" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "estado" "EstadoPedidoCompra" NOT NULL DEFAULT 'borrador',
    "fechaPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEsperada" TIMESTAMP(3),
    "totalCentimos" INTEGER NOT NULL DEFAULT 0,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineaPedidoCompra" (
    "id" TEXT NOT NULL,
    "pedidoCompraId" TEXT NOT NULL,
    "productoProveedorId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitCentimos" INTEGER NOT NULL,
    "totalLineaCentimos" INTEGER NOT NULL,
    "cantidadRecibida" INTEGER NOT NULL DEFAULT 0,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineaPedidoCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecepcionCompra" (
    "id" TEXT NOT NULL,
    "pedidoCompraId" TEXT NOT NULL,
    "recibidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecepcionCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineaRecepcionCompra" (
    "id" TEXT NOT NULL,
    "recepcionCompraId" TEXT NOT NULL,
    "lineaPedidoCompraId" TEXT NOT NULL,
    "cantidadRecibida" INTEGER NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineaRecepcionCompra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PedidoCompra_proveedorId_fechaPedido_idx" ON "PedidoCompra"("proveedorId", "fechaPedido");

-- CreateIndex
CREATE INDEX "PedidoCompra_estado_fechaPedido_idx" ON "PedidoCompra"("estado", "fechaPedido");

-- CreateIndex
CREATE INDEX "LineaPedidoCompra_pedidoCompraId_idx" ON "LineaPedidoCompra"("pedidoCompraId");

-- CreateIndex
CREATE INDEX "LineaPedidoCompra_productoProveedorId_idx" ON "LineaPedidoCompra"("productoProveedorId");

-- CreateIndex
CREATE INDEX "RecepcionCompra_pedidoCompraId_recibidaEn_idx" ON "RecepcionCompra"("pedidoCompraId", "recibidaEn");

-- CreateIndex
CREATE INDEX "LineaRecepcionCompra_recepcionCompraId_idx" ON "LineaRecepcionCompra"("recepcionCompraId");

-- CreateIndex
CREATE INDEX "LineaRecepcionCompra_lineaPedidoCompraId_idx" ON "LineaRecepcionCompra"("lineaPedidoCompraId");

-- AddForeignKey
ALTER TABLE "PedidoCompra" ADD CONSTRAINT "PedidoCompra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaPedidoCompra" ADD CONSTRAINT "LineaPedidoCompra_pedidoCompraId_fkey" FOREIGN KEY ("pedidoCompraId") REFERENCES "PedidoCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaPedidoCompra" ADD CONSTRAINT "LineaPedidoCompra_productoProveedorId_fkey" FOREIGN KEY ("productoProveedorId") REFERENCES "ProductoProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecepcionCompra" ADD CONSTRAINT "RecepcionCompra_pedidoCompraId_fkey" FOREIGN KEY ("pedidoCompraId") REFERENCES "PedidoCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaRecepcionCompra" ADD CONSTRAINT "LineaRecepcionCompra_recepcionCompraId_fkey" FOREIGN KEY ("recepcionCompraId") REFERENCES "RecepcionCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaRecepcionCompra" ADD CONSTRAINT "LineaRecepcionCompra_lineaPedidoCompraId_fkey" FOREIGN KEY ("lineaPedidoCompraId") REFERENCES "LineaPedidoCompra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
