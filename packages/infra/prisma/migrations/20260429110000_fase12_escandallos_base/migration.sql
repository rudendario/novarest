-- CreateTable
CREATE TABLE "RecetaEscandallo" (
    "id" TEXT NOT NULL,
    "productoFinalId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "porciones" INTEGER NOT NULL DEFAULT 1,
    "mermaPct" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecetaEscandallo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineaEscandallo" (
    "id" TEXT NOT NULL,
    "recetaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadUnidades" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineaEscandallo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecetaEscandallo_productoFinalId_key" ON "RecetaEscandallo"("productoFinalId");

-- CreateIndex
CREATE INDEX "RecetaEscandallo_activa_actualizadoEn_idx" ON "RecetaEscandallo"("activa", "actualizadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "LineaEscandallo_recetaId_productoId_key" ON "LineaEscandallo"("recetaId", "productoId");

-- CreateIndex
CREATE INDEX "LineaEscandallo_productoId_idx" ON "LineaEscandallo"("productoId");

-- AddForeignKey
ALTER TABLE "RecetaEscandallo" ADD CONSTRAINT "RecetaEscandallo_productoFinalId_fkey" FOREIGN KEY ("productoFinalId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaEscandallo" ADD CONSTRAINT "LineaEscandallo_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "RecetaEscandallo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaEscandallo" ADD CONSTRAINT "LineaEscandallo_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
