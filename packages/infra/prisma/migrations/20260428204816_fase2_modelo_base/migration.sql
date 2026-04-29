-- CreateEnum
CREATE TYPE "EstadoInternoProducto" AS ENUM ('disponible', 'stock_bajo', 'ultimas_unidades', 'agotado', 'pausado', 'demora');

-- CreateEnum
CREATE TYPE "EstadoPublicoProducto" AS ENUM ('visible', 'oculto', 'agotado', 'temporalmente_no_disponible');

-- CreateEnum
CREATE TYPE "DestinoPreparacionProducto" AS ENUM ('cocina', 'barra', 'ambos', 'ninguno');

-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('plato', 'bebida', 'ingrediente', 'combo');

-- CreateTable
CREATE TABLE "ConfiguracionNegocio" (
    "id" TEXT NOT NULL,
    "nombreComercial" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'EUR',
    "impuestosIncluidos" BOOLEAN NOT NULL DEFAULT true,
    "horarioJson" JSONB,
    "publicadoWeb" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionNegocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolUsuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "RolUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "pinHash" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "rolId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermisoUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permiso" TEXT NOT NULL,
    "concedido" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermisoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispositivo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tokenVinculo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimaConexionEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "revocadaEn" TIMESTAMP(3),
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaProducto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visibleInterno" BOOLEAN NOT NULL DEFAULT true,
    "visiblePublico" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "CategoriaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioCentimos" INTEGER NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "destinoPreparacion" "DestinoPreparacionProducto" NOT NULL,
    "estadoInterno" "EstadoInternoProducto" NOT NULL DEFAULT 'disponible',
    "estadoPublico" "EstadoPublicoProducto" NOT NULL DEFAULT 'oculto',
    "visiblePublico" BOOLEAN NOT NULL DEFAULT false,
    "categoriaId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alergeno" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alergeno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoAlergeno" (
    "productoId" TEXT NOT NULL,
    "alergenoId" TEXT NOT NULL,

    CONSTRAINT "ProductoAlergeno_pkey" PRIMARY KEY ("productoId","alergenoId")
);

-- CreateTable
CREATE TABLE "ImagenProducto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "textoAlt" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImagenProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuDia" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioCentimos" INTEGER NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "MenuDia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursoMenuDia" (
    "id" TEXT NOT NULL,
    "menuDiaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CursoMenuDia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatoMenuDia" (
    "id" TEXT NOT NULL,
    "cursoMenuDiaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlatoMenuDia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "rolNombre" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "valoresPrevios" JSONB,
    "valoresNuevos" JSONB,
    "motivo" TEXT,
    "ip" TEXT,
    "requestId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolUsuario_nombre_key" ON "RolUsuario"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PermisoUsuario_usuarioId_permiso_key" ON "PermisoUsuario"("usuarioId", "permiso");

-- CreateIndex
CREATE UNIQUE INDEX "Dispositivo_tokenVinculo_key" ON "Dispositivo"("tokenVinculo");

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_tokenHash_key" ON "Sesion"("tokenHash");

-- CreateIndex
CREATE INDEX "Sesion_usuarioId_idx" ON "Sesion"("usuarioId");

-- CreateIndex
CREATE INDEX "Sesion_dispositivoId_idx" ON "Sesion"("dispositivoId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaProducto_slug_key" ON "CategoriaProducto"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_slug_key" ON "Producto"("slug");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- CreateIndex
CREATE INDEX "Producto_visiblePublico_estadoPublico_idx" ON "Producto"("visiblePublico", "estadoPublico");

-- CreateIndex
CREATE UNIQUE INDEX "Alergeno_codigo_key" ON "Alergeno"("codigo");

-- CreateIndex
CREATE INDEX "ImagenProducto_productoId_idx" ON "ImagenProducto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuDia_fecha_key" ON "MenuDia"("fecha");

-- CreateIndex
CREATE INDEX "CursoMenuDia_menuDiaId_idx" ON "CursoMenuDia"("menuDiaId");

-- CreateIndex
CREATE INDEX "PlatoMenuDia_productoId_idx" ON "PlatoMenuDia"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatoMenuDia_cursoMenuDiaId_productoId_key" ON "PlatoMenuDia"("cursoMenuDiaId", "productoId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_entidad_entidadId_idx" ON "RegistroAuditoria"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_creadoEn_idx" ON "RegistroAuditoria"("creadoEn");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "RolUsuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermisoUsuario" ADD CONSTRAINT "PermisoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "Dispositivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoAlergeno" ADD CONSTRAINT "ProductoAlergeno_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoAlergeno" ADD CONSTRAINT "ProductoAlergeno_alergenoId_fkey" FOREIGN KEY ("alergenoId") REFERENCES "Alergeno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagenProducto" ADD CONSTRAINT "ImagenProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoMenuDia" ADD CONSTRAINT "CursoMenuDia_menuDiaId_fkey" FOREIGN KEY ("menuDiaId") REFERENCES "MenuDia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatoMenuDia" ADD CONSTRAINT "PlatoMenuDia_cursoMenuDiaId_fkey" FOREIGN KEY ("cursoMenuDiaId") REFERENCES "CursoMenuDia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatoMenuDia" ADD CONSTRAINT "PlatoMenuDia_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

