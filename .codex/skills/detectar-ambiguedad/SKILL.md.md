---
name: detectar-ambiguedad
description: Detecta requisitos ambiguos, incompletos o contradictorios antes de diseño o implementación.
---

# Detectar Ambigüedad

## Objetivo
Identificar falta de claridad, contradicciones o definiciones incompletas antes de construir sobre supuestos.

## Usar
- Al recibir requisitos funcionales
- Antes de arquitectura
- Cuando haya interpretaciones múltiples
- Cuando distintos agentes puedan entender cosas distintas

## No usar
- Requisitos ya validados y cerrados
- Implementación sin cambios funcionales

## Entradas
Requisitos, flujos operativos, reglas de negocio, decisiones previas.

## Proceso
1. Identificar términos vagos ("rápido", "fácil", "optimizado")
2. Detectar reglas incompletas
3. Buscar contradicciones entre requisitos o decisiones
4. Señalar dependencias no resueltas
5. Proponer preguntas concretas

## Salida
- Ambigüedades detectadas
- Contradicciones (si existen)
- Impacto potencial
- Preguntas para resolver

## Reglas
- No inventar soluciones
- No asumir comportamientos no definidos
- Priorizar claridad sobre avance
- Bloquear si hay contradicciones críticas
