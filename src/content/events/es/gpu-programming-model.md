---
title: "Clase 1 - Modelo de Programación GPU, Arquitectura y Distribución de Memoria"
description: "Introducción profunda a los fundamentos de la programación GPU: el modelo de programación CUDA, la arquitectura del hardware GPU (SMs, warps, hilos), y la jerarquía de memoria (global, compartida, local, constante, textura). Aprende cómo fluyen los datos entre CPU y GPU y cómo razonar sobre el lanzamiento de kernels."
date: 2026-02-27
time: "6:30 PM - 8:30 PM"
speaker: "Semillero SIMG"
eventType: "virtual"
location: "Universidad Nacional de Colombia, Bogotá"
building: "Edificio 404 - Yu Takeuchi"
room: "202-405"
recurrent: false
thumbnail: "/images/events/gpu-programming-model.svg"
tags: ["CUDA", "GPU", "Arquitectura", "Memoria", "HPC"]
status: "upcoming"
lang: "es"
translationKey: "gpu-programming-model"
participants: []
duration: "1h 30m"
---

## Descripción General

Esta clase cubre los conceptos fundamentales de la programación GPU. Exploraremos el modelo de programación CUDA, entenderemos la arquitectura del hardware GPU incluyendo los Streaming Multiprocessors (SMs), warps y jerarquías de hilos, y profundizaremos en la distribución de memoria de la GPU.

### Temas

- **Modelo de Programación CUDA**: Kernels, grids, bloques e hilos
- **Arquitectura GPU**: SMs, núcleos CUDA, planificación de warps
- **Jerarquía de Memoria**: Memoria global, compartida, local, constante y de textura
- **Transferencia de Datos Host-Device**: `cudaMemcpy`, memoria fija, transferencias asíncronas
- **Configuración de Lanzamiento de Kernels**: Elegir dimensiones de grid y bloque

### Prerrequisitos

- Conocimiento básico de C/C++ o Python
- Familiaridad con conceptos de computación paralela (útil pero no requerido)

### Qué Traer

- Laptop con GPU compatible con CUDA (opcional — tendremos entornos en la nube disponibles)
- ¡Curiosidad por la computación de alto rendimiento!
