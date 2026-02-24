---
title: "Lecture 2 - CUDA For Python: CuPy, torch.cuda & cuda.jit (Numba)"
description: "Hands-on session exploring GPU-accelerated computing from Python. Learn how to use CuPy as a NumPy drop-in replacement, leverage PyTorch's torch.cuda for tensor operations on GPU, and write custom CUDA kernels directly in Python using Numba's cuda.jit decorator."
date: 2026-03-06
time: "6:30 PM - 9:00 PM"
speaker: "SIMG Research Group"
eventType: "virtual"
meetingLink: "https://meet.google.com/tbd"
meetingPlatform: "meet"
googleCalendarLink: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lecture+2+-+CUDA+For+Python&dates=20260306T233000Z/20260307T020000Z&details=Hands-on+session+exploring+GPU-accelerated+computing+from+Python&location=https://meet.google.com/tbd&sf=true&output=xml"
recurrent: false
thumbnail: "/images/events/cuda-for-python.svg"
tags: ["CUDA", "Python", "CuPy", "PyTorch", "Numba", "GPU"]
status: "upcoming"
lang: "en"
translationKey: "cuda-for-python"
participants: []
duration: "2h 30m"
---

## Overview

Bridge the gap between Python and GPU programming. This hands-on lecture shows three powerful approaches to run CUDA from Python without writing raw C/C++ code.

### Topics

- **CuPy**: NumPy-compatible GPU array library
  - Drop-in replacement for NumPy operations
  - Custom kernels with `RawKernel` and `ElementwiseKernel`
- **torch.cuda (PyTorch)**: GPU tensor operations
  - Moving tensors to GPU, CUDA streams
  - Mixed precision and `torch.cuda.amp`
- **Numba cuda.jit**: Writing CUDA kernels in Python
  - `@cuda.jit` decorator and thread indexing
  - Shared memory and synchronization in Numba

### Prerequisites

- Python programming experience
- Basic NumPy knowledge
- Lecture 1 concepts (GPU architecture) recommended

### What to Bring

- Laptop with Python 3.10+ installed
- Google Colab access (free GPU tier) as fallback
