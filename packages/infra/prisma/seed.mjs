import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rolAdministrador = await prisma.rolUsuario.upsert({
    where: { nombre: "administrador" },
    update: {},
    create: {
      nombre: "administrador",
      descripcion: "Rol con acceso completo para operacion inicial",
    },
  });

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: "admin@eljardin.local" },
    update: {},
    create: {
      email: "admin@eljardin.local",
      nombre: "Administrador",
      hashPassword: "PENDIENTE_HASH_REAL",
      rolId: rolAdministrador.id,
    },
  });

  await prisma.configuracionNegocio.upsert({
    where: { id: "cfg_negocio_unico" },
    update: {},
    create: {
      id: "cfg_negocio_unico",
      nombreComercial: "TPV El Jardin",
      telefono: "+34 000 000 000",
      email: "contacto@eljardin.local",
      direccion: "Direccion pendiente",
      publicadoWeb: true,
    },
  });

  const categoriaEntrantes = await prisma.categoriaProducto.upsert({
    where: { slug: "entrantes" },
    update: {},
    create: {
      nombre: "Entrantes",
      slug: "entrantes",
      orden: 1,
      visiblePublico: true,
    },
  });

  const categoriaPrincipales = await prisma.categoriaProducto.upsert({
    where: { slug: "principales" },
    update: {},
    create: {
      nombre: "Principales",
      slug: "principales",
      orden: 2,
      visiblePublico: true,
    },
  });

  const categoriaPostres = await prisma.categoriaProducto.upsert({
    where: { slug: "postres" },
    update: {},
    create: {
      nombre: "Postres",
      slug: "postres",
      orden: 3,
      visiblePublico: true,
    },
  });

  const alergenoGluten = await prisma.alergeno.upsert({
    where: { codigo: "gluten" },
    update: {},
    create: { codigo: "gluten", nombre: "Gluten" },
  });

  const alergenoLacteos = await prisma.alergeno.upsert({
    where: { codigo: "lacteos" },
    update: {},
    create: { codigo: "lacteos", nombre: "Lacteos" },
  });

  const croquetas = await prisma.producto.upsert({
    where: { slug: "croquetas-caseras" },
    update: {},
    create: {
      nombre: "Croquetas caseras",
      slug: "croquetas-caseras",
      descripcion: "Croquetas de jamon iberico",
      precioCentimos: 1200,
      tipo: "plato",
      destinoPreparacion: "cocina",
      estadoInterno: "disponible",
      estadoPublico: "visible",
      visiblePublico: true,
      categoriaId: categoriaEntrantes.id,
    },
  });

  const solomillo = await prisma.producto.upsert({
    where: { slug: "solomillo-plancha" },
    update: {},
    create: {
      nombre: "Solomillo a la plancha",
      slug: "solomillo-plancha",
      descripcion: "Con guarnicion de temporada",
      precioCentimos: 2100,
      tipo: "plato",
      destinoPreparacion: "cocina",
      estadoInterno: "disponible",
      estadoPublico: "visible",
      visiblePublico: true,
      categoriaId: categoriaPrincipales.id,
    },
  });

  const flan = await prisma.producto.upsert({
    where: { slug: "flan-huevo" },
    update: {},
    create: {
      nombre: "Flan de huevo",
      slug: "flan-huevo",
      descripcion: "Flan casero",
      precioCentimos: 600,
      tipo: "plato",
      destinoPreparacion: "ninguno",
      estadoInterno: "disponible",
      estadoPublico: "visible",
      visiblePublico: true,
      categoriaId: categoriaPostres.id,
    },
  });

  await prisma.productoAlergeno.upsert({
    where: {
      productoId_alergenoId: {
        productoId: croquetas.id,
        alergenoId: alergenoGluten.id,
      },
    },
    update: {},
    create: {
      productoId: croquetas.id,
      alergenoId: alergenoGluten.id,
    },
  });

  await prisma.productoAlergeno.upsert({
    where: {
      productoId_alergenoId: {
        productoId: flan.id,
        alergenoId: alergenoLacteos.id,
      },
    },
    update: {},
    create: {
      productoId: flan.id,
      alergenoId: alergenoLacteos.id,
    },
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const menuDia = await prisma.menuDia.upsert({
    where: { fecha: hoy },
    update: {},
    create: {
      fecha: hoy,
      titulo: "Menu del dia",
      descripcion: "Menu diario de ejemplo",
      precioCentimos: 1650,
      publicado: true,
    },
  });

  const cursoPrimero = await prisma.cursoMenuDia.create({
    data: {
      menuDiaId: menuDia.id,
      nombre: "Primero",
      orden: 1,
    },
  });

  const cursoSegundo = await prisma.cursoMenuDia.create({
    data: {
      menuDiaId: menuDia.id,
      nombre: "Segundo",
      orden: 2,
    },
  });

  const cursoPostre = await prisma.cursoMenuDia.create({
    data: {
      menuDiaId: menuDia.id,
      nombre: "Postre",
      orden: 3,
    },
  });

  await prisma.platoMenuDia.createMany({
    data: [
      { cursoMenuDiaId: cursoPrimero.id, productoId: croquetas.id, orden: 1 },
      { cursoMenuDiaId: cursoSegundo.id, productoId: solomillo.id, orden: 1 },
      { cursoMenuDiaId: cursoPostre.id, productoId: flan.id, orden: 1 },
    ],
    skipDuplicates: true,
  });

  await prisma.registroAuditoria.create({
    data: {
      usuarioId: usuarioAdmin.id,
      rolNombre: "administrador",
      accion: "seed_inicial",
      entidad: "Sistema",
      entidadId: "fase_2",
      valoresNuevos: { ok: true },
      motivo: "Inicializacion de datos base para desarrollo",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
