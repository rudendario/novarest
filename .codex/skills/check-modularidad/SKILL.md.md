---
name: check-modularidad
description: Revisa separación de responsabilidades, reutilización, acoplamiento y tamaño de módulos antes de validar entregas técnicas.
---

# Check Modularidad

## Objetivo
Detectar monolitos, duplicación, acoplamiento excesivo y responsabilidades mal repartidas antes de aprobar una entrega.

## Usar
- Antes de cerrar arquitectura, backend o frontend
- Antes de pasar a QA o Tech Lead
- Cuando una solución mezcla demasiadas responsabilidades

## No usar
- Descubrimiento funcional sin diseño técnico
- Tareas descriptivas sin impacto estructural

## Entradas
Diseño/código, responsabilidades esperadas por módulo, contratos entre componentes, restricciones técnicas.

## Proceso
1. Identificar módulos y responsabilidades
2. Verificar claridad de cada pieza
3. Detectar duplicación de lógica/reglas
4. Detectar acoplamiento innecesario
5. Señalar archivos/funciones demasiado grandes
6. Revisar reutilización mal extraída
7. Evaluar mantenibilidad, pruebas, evolución
8. Proponer ajustes sin cambiar comportamiento

## Salida
- Resumen estructura
- Hallazgos: duplicación, acoplamiento, tamaño
- Riesgos de mantenibilidad
- Recomendaciones de división/extracción
- Estado: válido / revisar / bloquear

## Reglas
- No añadir funcionalidad
- No cambiar comportamiento
- No rediseñar salvo problema crítico
- Bloquear si compromete evolución, pruebas o reutilización
