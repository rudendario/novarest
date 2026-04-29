# Checklist de despliegue MVP - TPV El Jardin

Fecha base: 2026-04-29  
Alcance: despliegue de MVP v1 (un solo negocio, monolito modular).

## 1. Pre-despliegue (obligatorio)

- [ ] Confirmar rama/tag de release aprobada por `tech-lead`.
- [ ] Confirmar que `AGENTS.md` no reporta bloqueadores abiertos de Fase 14.
- [ ] Ejecutar gate completo en entorno de validacion:
  - [ ] `pnpm gate:full`
  - [ ] Resultado verde en `format`, `lint`, `type-check`, `test`, `test:db`, `build`.
- [ ] Confirmar Docker/PostgreSQL operativos en entorno destino.
- [ ] Confirmar `DATABASE_URL` del entorno de despliegue (no usar valores de desarrollo).
- [ ] Confirmar secretos requeridos y politicas:
  - [ ] Cookies de sesion con `httpOnly`, `sameSite`, `secure` en produccion.
  - [ ] Variables de entorno cargadas sin exponer en logs.
- [ ] Verificar estado de migraciones antes del despliegue:
  - [ ] `pnpm db:migrate:status`

## 2. Backup previo (obligatorio)

- [ ] Ejecutar backup de base de datos antes de migrar:
  - [ ] `pnpm db:backup` o `scripts/db-backup.ps1 -OutputFile backups/tpv_pre_release.sql`
- [ ] Verificar que el archivo de backup existe y tiene tamano > 0.
- [ ] Registrar ruta exacta del backup en bitacora de despliegue.

## 3. Ejecucion de despliegue

- [ ] Aplicar migraciones en modo despliegue:
  - [ ] `pnpm db:migrate:deploy`
- [ ] Verificar nuevamente estado:
  - [ ] `pnpm db:migrate:status` -> `Database schema is up to date`.
- [ ] Desplegar artefacto de aplicacion (`apps/tpv`) al entorno objetivo.
- [ ] Confirmar que la aplicacion inicia sin errores de arranque.

## 4. Smoke test post-despliegue (obligatorio)

- [ ] Login valido por email/password.
- [ ] Apertura de caja.
- [ ] Apertura de mesa y alta de pedido.
- [ ] Envio a cocina/barra.
- [ ] Cambio de estados de linea hasta `servida`.
- [ ] Cobro de pedido.
- [ ] Consolidacion de stock.
- [ ] Cierre de caja.
- [ ] Consulta de informe de turno/dia.
- [ ] Verificacion API publica:
  - [ ] `GET /api/publico/negocio`
  - [ ] `GET /api/publico/carta`
  - [ ] `GET /api/publico/platos`
  - [ ] `GET /api/publico/menu-dia`
- [ ] Verificar que errores 500 incluyan `X-Request-Id` para trazabilidad.

## 5. Seguridad y observabilidad post-despliegue

- [ ] Revisar logs iniciales sin fuga de secretos (password/PIN/token).
- [ ] Verificar que no hay picos de `401/403/429` fuera de lo esperado.
- [ ] Verificar que no hay errores de Prisma/migraciones en runtime.
- [ ] Confirmar que endpoints publicos mantienen rate-limit activo.

## 6. Plan de rollback

- [ ] Criterio de rollback definido (ej. fallo de login/cobro, errores 5xx persistentes, migracion incompleta).
- [ ] Si aplica rollback de app:
  - [ ] Revertir version desplegada a ultimo release estable.
- [ ] Si aplica rollback de DB:
  - [ ] Restaurar backup: `scripts/db-restore.ps1 -InputFile <backup.sql>`
  - [ ] Ejecutar smoke test minimo tras restore.
- [ ] Registrar incidente y causa raiz preliminar.

## 7. Cierre de despliegue

- [ ] Marcar despliegue como exitoso solo con todos los bloques obligatorios en verde.
- [ ] Actualizar `AGENTS.md` con:
  - [ ] fecha/hora,
  - [ ] version desplegada,
  - [ ] validaciones ejecutadas,
  - [ ] riesgos residuales.
