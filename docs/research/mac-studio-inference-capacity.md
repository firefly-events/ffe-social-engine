# Mac Studio M4 Max Inference Swarm — Capacity Analysis

> Research 2026-03-24. Hardware: M4 Max 32-core GPU, 36GB unified, 410 GB/s bandwidth.

## TL;DR: 1 Mac Studio handles 0-50 users. Buy a second at ~50 users ($2K). Cloud-only threshold: ~2,000+ concurrent users.

## Per-Workload Capacity (1x Mac Studio)

| Workload | Throughput/hr | Concurrent | VRAM Used | Notes |
|----------|--------------|------------|-----------|-------|
| XTTSv2 voice | 30-60 clips | 2-4 sessions | ~4GB | MPS backend, 0.3-0.5 RTF (vs 0.15 on A100) |
| FFmpeg video (1080p) | 12-25 renders | 6-10 streams | Minimal (HW) | VideoToolbox accel, 3-8s per 30s video |
| FLUX Schnell images | 20-40 images | 1-2 | ~12GB FP16 | ~3-6s per 1024x1024 (4 steps) |
| SDXL images | 15-25 images | 1 | ~13GB FP16 | ~4-8s per 1024x1024 (20 steps) |
| LLM text gen (14B Q4) | Thousands | Many | ~8GB | 35-50 tok/s, trivially fast |

## What Fits in 36GB Unified Memory

| Model | FP16 Size | Q4 Size | Fits? |
|-------|-----------|---------|-------|
| XTTSv2 | ~4GB | N/A | Yes |
| SDXL | ~13GB | ~4GB | Yes (FP16) |
| FLUX.1 Schnell/Dev | ~24GB | ~8GB | Yes (FP16, tight with other workloads) |
| Llama 3.3 70B | 140GB | ~22GB | Q4 only, barely, nothing else running |
| Llama 3.1 7B / 14B | ~14-28GB | ~4-8GB | Yes easily |

## Scaling Cost Comparison

| Users | Mac Studios | Mac Cost/mo | Cloud Cost/mo | Savings |
|-------|------------|-------------|---------------|---------|
| 10 | 1 (existing) | $0 | $200-400 | 100% |
| 25 | 1 | $63 | $500-800 | 87-92% |
| 50 | 1-2 | $63-126 | $1,000-1,500 | 88-92% |
| 100 | 2-3 | $126-189 | $2,000-3,000 | 90-94% |
| 250 | 4-6 | $252-378 | $5,000-8,000 | 93-95% |
| 500 | 7-12 | $441-756 | $10,000+ | 92-96% |

**Mac Studio amortized cost:** $55.50/mo (over 36 months) + $7.67/mo electricity = **~$63/mo each**

## Cloud Provider Comparison (for burst)

| Provider | Best For | Cost |
|----------|----------|------|
| RunPod Serverless (4090) | Voice burst | ~$0.44/hr, $0.002/clip |
| Modal (A10) | LLM/image burst | $0.000306/sec (~$1.10/hr) |
| fal.ai | Production image gen | FLUX $0.04/image |
| Replicate | Prototyping | XTTSv2 $0.05/run on A100 |

## Hybrid Architecture (Recommended)

```
Request → Queue →
  Local Mac busy?
    No  → Local (fast, cheap)
    Yes → Queue depth?
            < 2 items → Wait for local
            > 2 items → Route to cloud burst (RunPod/Modal)
```

**Always local:** Video encoding (VideoToolbox), LLM text gen, batch image gen
**Burst to cloud:** Real-time voice synthesis, real-time image gen during spikes

## Key Risks

1. **Home ISP reliability** — Consider business fiber or colocation at >50 users
2. **XTTSv2 + MPS** — No native MLX port. MPS works but 2-3x slower than A100. Consider Kokoro-82M or Parler-TTS as faster alternatives with MLX support.
3. **Network bandwidth** — 100 users × 50 videos × 50MB = 250GB/mo upload. Home ISP asymmetric upload (20-50 Mbps) becomes bottleneck before compute.
4. **If buying a 2nd Mac Studio** — get the 48GB or 64GB variant. Extra memory enables running FLUX FP16 + LLM simultaneously. The 40-core GPU + 546 GB/s bandwidth adds ~33% throughput.

## Break-Even vs Cloud

| Workload | Mac Cost/unit | Cloud Cost/unit | Mac Break-even |
|----------|--------------|-----------------|----------------|
| Voice (XTTSv2) | ~$0 (amortized) | $0.002-0.05/clip | 31,500 clips/mo |
| Images (FLUX) | $0.001-0.005 | $0.025-0.04 | 2,500-3,000 imgs/mo |
| Video (FFmpeg) | ~$0 | $0.15-0.23/video | Immediately cheaper |
| LLM text | ~$0 | $0.0003-0.001/req | Immediately cheaper |

**Local Mac wins at every scale up to ~500 users for predictable workloads.**
