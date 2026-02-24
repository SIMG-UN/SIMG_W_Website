---
title: "Clase 2 - CUDA Para Python: CuPy, torch.cuda y cuda.jit (Numba)"
description: "Sesión práctica explorando la computación acelerada por GPU desde Python. Aprende a usar CuPy como reemplazo directo de NumPy, aprovecha torch.cuda de PyTorch para operaciones con tensores en GPU, y escribe kernels CUDA personalizados directamente en Python usando el decorador cuda.jit de Numba."
date: 2026-03-06
time: "6:30 PM - 9:00 PM"
speaker: "Semillero SIMG"
eventType: "virtual"
meetingLink: "https://meet.google.com/tbd"
meetingPlatform: "meet"
googleCalendarLink: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Clase+2+-+CUDA+Para+Python&dates=20260306T233000Z/20260307T020000Z&details=Sesi%C3%B3n+pr%C3%A1ctica+explorando+la+computaci%C3%B3n+acelerada+por+GPU+desde+Python&location=https://meet.google.com/tbd&sf=true&output=xml"
recurrent: false
thumbnail: "/images/events/cuda-for-python.svg"
tags: ["CUDA", "Python", "CuPy", "PyTorch", "Numba", "GPU"]
status: "upcoming"
lang: "es"
translationKey: "cuda-for-python"
participants: []
duration: "2h 30m"
---

## Descripción General

Conecta Python con la programación GPU. Esta clase práctica muestra tres enfoques poderosos para ejecutar CUDA desde Python sin escribir código C/C++ puro.

### Temas

- **CuPy**: Librería de arrays GPU compatible con NumPy
  - Reemplazo directo para operaciones NumPy
  - Kernels personalizados con `RawKernel` y `ElementwiseKernel`
- **torch.cuda (PyTorch)**: Operaciones con tensores en GPU
  - Mover tensores a GPU, CUDA streams
  - Precisión mixta y `torch.cuda.amp`
- **Numba cuda.jit**: Escribir kernels CUDA en Python
  - Decorador `@cuda.jit` e indexación de hilos
  - Memoria compartida y sincronización en Numba

### Prerrequisitos

- Experiencia en programación con Python
- Conocimiento básico de NumPy
- Conceptos de la Clase 1 (arquitectura GPU) recomendados

### Qué Traer

- Laptop con Python 3.10+ instalado
- Acceso a Google Colab (GPU gratuita) como respaldo
