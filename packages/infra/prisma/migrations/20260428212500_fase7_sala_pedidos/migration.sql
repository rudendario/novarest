-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('abierto', 'enviado', 'parcialmente_servido', 'servido', 'en_cobro', 'cobrado', 'cancelado');

-- CreateEnum
CREATE TYPE "EstadoLineaPedido" AS ENUM ('pendiente', 'confirmada', 'en_preparacion', 'lista', 'servida', 'cancelada');

-- CreateTable
CREATE TABLE "Zona" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesa" (
    "id" TEXT NOT NULL,
    "zonaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL DEFAULT 4,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "pedidoActivoId" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,
    "eliminadaEn" TIMESTAMP(3),

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "mesaId" TEXT NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'abierto',
    "totalCentimos" INTEGER NOT NULL DEFAULT 0,
    "nota" TEXT,
    "abiertoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoEn" TIMESTAMP(3),
    "cerradoEn" TIMESTAMP(3),
    "creadoPorUsuarioId" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineaPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombreSnapshot" TEXT NOT NULL,
    "precioUnitCentimos" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoLineaPedido" NOT NULL DEFAULT 'pendiente',
    "nota" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "canceladoEn" TIMESTAMP(3),

    CONSTRAINT "LineaPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudCancelacion" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "lineaPedidoId" TEXT,
    "motivo" TEXT NOT NULL,
    "solicitadaPorUsuarioId" TEXT,
    "aprobadaPorUsuarioId" TEXT,
    "aprobada" BOOLEAN,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltaEn" TIMESTAMP(3),

    CONSTRAINT "SolicitudCancelacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_codigo_key" ON "Mesa"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_pedidoActivoId_key" ON "Mesa"("pedidoActivoId");

-- CreateIndex
CREATE INDEX "Mesa_zonaId_idx" ON "Mesa"("zonaId");

-- CreateIndex
CREATE INDEX "Pedido_mesaId_estado_idx" ON "Pedido"("mesaId", "estado");

-- CreateIndex
CREATE INDEX "Pedido_abiertoEn_idx" ON "Pedido"("abiertoEn");

-- CreateIndex
CREATE INDEX "LineaPedido_pedidoId_estado_idx" ON "LineaPedido"("pedidoId", "estado");

-- CreateIndex
CREATE INDEX "LineaPedido_productoId_idx" ON "LineaPedido"("productoId");

-- CreateIndex
CREATE INDEX "SolicitudCancelacion_pedidoId_creadaEn_idx" ON "SolicitudCancelacion"("pedidoId", "creadaEn");

-- AddForeignKey
ALTER TABLE "Mesa" ADD CONSTRAINT "Mesa_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesa" ADD CONSTRAINT "Mesa_pedidoActivoId_fkey" FOREIGN KEY ("pedidoActivoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaPedido" ADD CONSTRAINT "LineaPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaPedido" ADD CONSTRAINT "LineaPedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCancelacion" ADD CONSTRAINT "SolicitudCancelacion_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;