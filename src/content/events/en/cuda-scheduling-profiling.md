---
title: "Lecture 3 - CUDA Scheduling and Profiling Kernels with Nsight Compute"
description: "Advanced session on CUDA warp scheduling, occupancy optimization, and performance profiling. Learn to use NVIDIA Nsight Compute to identify bottlenecks, analyze memory throughput, and optimize kernel performance for real-world workloads."
date: 2026-03-13
time: "6:30 PM - 9:00 PM"
speaker: "SIMG Research Group"
eventType: "virtual"
meetingLink: "https://meet.google.com/tbd"
meetingPlatform: "meet"
googleCalendarLink: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lecture+3+-+CUDA+Scheduling+and+Profiling&dates=20260313T233000Z/20260314T020000Z&details=Advanced+session+on+CUDA+optimization+and+profiling&location=https://meet.google.com/tbd&sf=true&output=xml"
recurrent: false
thumbnail: "/images/events/cuda-scheduling-profiling.svg"
tags: ["CUDA", "Nsight Compute", "Profiling", "Scheduling", "Optimization"]
status: "upcoming"
lang: "en"
translationKey: "cuda-scheduling-profiling"
participants: []
duration: "2h 30m"
---

## Overview

Take your CUDA skills to the next level. This lecture focuses on understanding how the GPU scheduler assigns warps to Streaming Multiprocessors and how to use NVIDIA's profiling tools to optimize kernel performance.

### Topics

- **Warp Scheduling**: How warps are scheduled on SMs, latency hiding
- **Occupancy**: Theoretical vs. achieved occupancy, register pressure
- **Nsight Compute**: Installing, launching, and interpreting profiling reports
  - Memory throughput analysis
  - Compute throughput analysis
  - Roofline model interpretation
- **Optimization Techniques**: Coalesced memory access, bank conflicts, loop unrolling
- **Real-World Case Study**: Profiling and optimizing a matrix multiplication kernel

### Prerequisites

- Lecture 1 & 2 knowledge (GPU architecture + CUDA Python)
- Basic understanding of performance metrics (throughput, latency)

### What to Bring

- Laptop with NVIDIA GPU and Nsight Compute installed (or use provided cloud environment)
- The code from Lectures 1 & 2
