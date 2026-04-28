---
name: find-skills
description: Descubre e instala skills del ecosistema cuando el usuario pregunta "how do I do X", "find a skill for X" o busca extender capacidades.
---

# Find Skills

Descubre e instala skills vía CLI `npx skills`.

## Usar cuando
- "how do I do X" / "find a skill for X" / "is there a skill for X"
- Usuario quiere extender capacidades
- Busca tools/templates/workflows por dominio

## Comandos
- `npx skills find [query]` — buscar
- `npx skills add <owner/repo@skill> -g -y` — instalar global, sin confirmación
- `npx skills check` — ver updates
- `npx skills update` — actualizar todos

Browse: https://skills.sh/

## Proceso
1. **Identificar** dominio + tarea específica
2. **Leaderboard primero**: https://skills.sh/ — skills populares battle-tested
   - `vercel-labs/agent-skills` (React, Next.js, web design)
   - `anthropics/skills` (frontend design, docs)
3. **Buscar** si leaderboard no cubre: `npx skills find <query>`
4. **Verificar calidad** antes de recomendar:
   - Installs ≥1K preferido, <100 sospechoso
   - Fuentes oficiales (vercel-labs, anthropics, microsoft) > desconocidos
   - GitHub stars del repo fuente
5. **Presentar** al usuario: nombre, función, installs, comando install, link
6. **Instalar** si aceptan: `npx skills add <owner/repo@skill> -g -y`

## Categorías comunes
| Categoría | Queries |
|-----------|---------|
| Web Dev | react, nextjs, typescript, css, tailwind |
| Testing | jest, playwright, e2e |
| DevOps | deploy, docker, kubernetes, ci-cd |
| Docs | readme, changelog, api-docs |
| Code Quality | review, lint, refactor |
| Design | ui, ux, accessibility |

## Sin resultados
1. Decir no hay match
2. Ofrecer ayuda directa con capacidades generales
3. Sugerir crear propio: `npx skills init <nombre>`

## Tips búsqueda
- Keywords específicos ("react testing" > "testing")
- Probar sinónimos ("deploy" → "deployment" → "ci-cd")
- Fuentes populares: `vercel-labs/agent-skills`, `ComposioHQ/awesome-claude-skills`
