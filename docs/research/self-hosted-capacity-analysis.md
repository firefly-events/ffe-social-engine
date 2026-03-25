# Self-Hosted Capacity Analysis: Mac Studio M4 Max

## 1. Hardware Benchmarks (Hive Box)
**Specs**: Mac Studio M4 Max (16-core CPU, 40-core GPU, 36GB-128GB Unified Memory)

| Operation | Model/Tool | Benchmark | Capacity (per hour) |
| :--- | :--- | :--- | :--- |
| **Voice Gen** | XTTSv2 (MLX) | ~0.15 RTF | 400 minutes audio |
| **Video Encode** | FFmpeg (VT) | ~800 FPS | 800 videos (60s, 30fps) |
| **Transcription** | Whisper (MLX) | ~0.02 RTF | 3,000 minutes audio |

## 2. Usage Projections (Power Users)
*Assumption: 30 posts/mo, 20% voice narration, 40% full video composition.*

| User Count | Voice Load (min/mo) | Video Load (min/mo) | Total Daily Compute |
| :--- | :--- | :--- | :--- |
| **10** | 60 | 120 | 0.6 mins |
| **100** | 600 | 1,200 | 6 mins |
| **500** | 3,000 | 6,000 | 30 mins |
| **1,000** | 6,000 | 12,000 | 60 mins |

## 3. The Latency Wall (Peak Hour Analysis)
The primary bottleneck is not total daily throughput, but **peak hour concurrency**.
- **Scenario**: 50 users generate content simultaneously during a peak window.
- **Sequential Latency**: 50 requests * (9s voice + 4.5s video) = 11.25 minutes.
- **Concurrent Latency (4 streams)**: **2.8 minutes**.
- **Target**: Maintain < 60s latency for premium users.

## 4. Breakeven vs Cloud GPU
**Cloud Costs (Modal A100 @ $2.50/hr)**:
- **100 users**: $3.75 / mo
- **500 users**: $18.75 / mo
- **1,000 users**: $37.50 / mo

**Self-Hosted Costs**:
- **Amortized Hardware**: ~$100/mo (over 3 years)
- **Electricity/Network**: ~$20/mo
- **Maintenance**: High (Mat's time)

## 5. Recommendation: Hybrid "Cloud Burst" Strategy

### Phase 1: MVP (0-50 users)
- **100% Self-hosted**.
- Single Hive box (M4 Max) handles all generation.
- Latency remains < 10s for all users.

### Phase 2: Growth (50-250 users)
- **Baseline Self-hosted + Peak Cloud Burst**.
- Use Hive for all background/scheduled tasks.
- If queue depth > 5, route new "Live" requests to **Modal/RunPod**.
- Amortized cost stays low while keeping latency < 30s.

### Phase 3: Scale (500+ users)
- **High-Availability Cloud Baseline**.
- Move voice cloning training and large video batches to Cloud.
- Keep Hive as a specialized worker for "Free Tier" and experimental models.
- Implement specialized **M4 Max Worker Clusters** if revenue supports scaling on-prem (cheaper than H100s for audio).
