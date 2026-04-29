-- AlterTable
ALTER TABLE "ProductoProveedor" ADD COLUMN "unidadesPorCompra" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "LineaEscandallo" ADD COLUMN "unidadUso" TEXT NOT NULL DEFAULT 'unidad';
