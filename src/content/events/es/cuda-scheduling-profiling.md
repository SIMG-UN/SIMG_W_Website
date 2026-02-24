---
title: "Clase 3 - Planificación CUDA y Perfilado de Kernels con Nsight Compute"
description: "Sesión avanzada sobre planificación de warps CUDA, optimización de ocupancia y perfilado de rendimiento. Aprende a usar NVIDIA Nsight Compute para identificar cuellos de botella, analizar el rendimiento de memoria y optimizar kernels para cargas de trabajo reales."
date: 2026-03-13
time: "6:30 PM - 8:30 PM"
speaker: "Semillero SIMG"
eventType: "virtual"
location: "Universidad Nacional de Colombia, Bogotá"
building: "Edificio 404 - Yu Takeuchi"
room: "202-405"
recurrent: false
thumbnail: "/images/events/cuda-scheduling-profiling.svg"
tags: ["CUDA", "Nsight Compute", "Perfilado", "Planificación", "Optimización"]
status: "upcoming"
lang: "es"
translationKey: "cuda-scheduling-profiling"
participants: []
duration: "1h 30m"
---

## Descripción General

Lleva tus habilidades de CUDA al siguiente nivel. Esta clase se enfoca en entender cómo el planificador de la GPU asigna warps a los Streaming Multiprocessors y cómo usar las herramientas de perfilado de NVIDIA para optimizar el rendimiento de los kernels.

### Temas

- **Planificación de Warps**: Cómo se planifican los warps en los SMs, ocultamiento de latencia
- **Ocupancia**: Ocupancia teórica vs. alcanzada, presión de registros
- **Nsight Compute**: Instalación, ejecución e interpretación de reportes de perfilado
  - Análisis de rendimiento de memoria
  - Análisis de rendimiento de cómputo
  - Interpretación del modelo Roofline
- **Técnicas de Optimización**: Acceso coalescido a memoria, conflictos de bancos, desenrollado de bucles
- **Caso de Estudio Real**: Perfilado y optimización de un kernel de multiplicación de matrices

### Prerrequisitos

- Conocimientos de las Clases 1 y 2 (arquitectura GPU + CUDA Python)
- Comprensión básica de métricas de rendimiento (throughput, latencia)

### Qué Traer

- Laptop con GPU NVIDIA y Nsight Compute instalado (o usar el entorno cloud proporcionado)
- El código de las Clases 1 y 2
