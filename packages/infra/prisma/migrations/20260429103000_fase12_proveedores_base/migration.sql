-- CreateTable
CREATE TABLE "Proveedor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "contacto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoProveedor" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "referenciaProveedor" TEXT,
    "unidadCompra" TEXT NOT NULL DEFAULT 'unidad',
    "precioActualCentimos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialPrecioProveedor" (
    "id" TEXT NOT NULL,
    "productoProveedorId" TEXT NOT NULL,
    "precioCentimos" INTEGER NOT NULL,
    "motivo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialPrecioProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_codigo_key" ON "Proveedor"("codigo");

-- CreateIndex
CREATE INDEX "Proveedor_nombre_activo_idx" ON "Proveedor"("nombre", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoProveedor_productoId_proveedorId_key" ON "ProductoProveedor"("productoId", "proveedorId");

-- CreateIndex
CREATE INDEX "ProductoProveedor_proveedorId_activo_idx" ON "ProductoProveedor"("proveedorId", "activo");

-- CreateIndex
CREATE INDEX "ProductoProveedor_productoId_activo_idx" ON "ProductoProveedor"("productoId", "activo");

-- CreateIndex
CREATE INDEX "HistorialPrecioProveedor_productoProveedorId_creadoEn_idx" ON "HistorialPrecioProveedor"("productoProveedorId", "creadoEn");

-- AddForeignKey
ALTER TABLE "ProductoProveedor" ADD CONSTRAINT "ProductoProveedor_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoProveedor" ADD CONSTRAINT "ProductoProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecioProveedor" ADD CONSTRAINT "HistorialPrecioProveedor_productoProveedorId_fkey" FOREIGN KEY ("productoProveedorId") REFERENCES "ProductoProveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
