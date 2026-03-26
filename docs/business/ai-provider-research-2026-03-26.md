# FFE Social Engine: AI Provider Cost Comparison
**Date: 2026-03-26**

## Quick Reference — Cost Per Unit

| Operation | Cheapest | Standard | Premium |
|---|---|---|---|
| Text caption | Flash-Lite $0.0002 | Flash $0.0013 | Claude Haiku $0.002 |
| Image (1024²) | GPT Mini Low $0.005 | Gemini Flash $0.039 | Gemini 3 Pro $0.134 |
| Image (self-hosted) | FLUX.1-schnell $0 | — | — |
| Video (10 sec) | Hailuo Fast $0.23 | Veo 3.1 Fast $1.00 | Veo 3 Standard $4.00 |
| Voice clone | XTTSv2 $0 (CPU) | Fish Audio $11/mo | ElevenLabs $99/mo |
| TTS (30 sec) | XTTSv2 $0 | Fish $0.03 | ElevenLabs $0.05 |
| Transcription (1 min) | Whisper $0 (<2sec) | Gemini $0.001 | Deepgram $0.008 |

## Recommendations

### Launch Defaults
- **Text**: Gemini Flash-Lite ($0.0002/caption)
- **Images**: Gemini 2.5 Flash Image ($0.039, batch $0.0195) + FLUX self-hosted for batch
- **Video**: MiniMax Hailuo Fast ($0.23/10-sec) — 5-15x cheaper than Veo
- **Voice**: Fish Audio ($11/mo, 200 min) — 70% cheaper than ElevenLabs
- **Transcription**: Whisper self-hosted (FREE, <2 sec/min on M4 Max)

### Self-Hosted Value
| Capability | Worth It? | Hardware | Why |
|---|---|---|---|
| Image (FLUX.1-schnell) | YES | Dragon (ROCm) or Hive (MPS) | $0, 10-20 sec, Apache 2.0, good quality |
| Video | YES — EVALUATE | Dragon (RX 7900 XT, 24GB VRAM, ROCm) | LTX/Wan/CogVideo viable on 24GB ROCm. Test quality vs Hailuo. |
| Voice (XTTSv2) | YES | Dragon (ROCm) | MPS broken on Mac but ROCm works on Dragon. Test quality vs Fish/ElevenLabs. |
| Transcription (Whisper) | ABSOLUTELY | Hive (CoreML) | 10 min audio in 1.2 sec. No-brainer. |
| Text | NO | — | Cloud is $0.0002/caption already |

### Hardware
- **Dragon Desktop**: AMD RX 7900 XT/XTX, 24GB VRAM, ROCm via /dev/kfd. Use for GPU workloads.
- **Mac Studio (hive)**: M4 Max, 36GB unified. CoreML for Whisper. MPS for FLUX. CPU-only for XTTSv2 (MPS broken).

### Tier Strategy (Approved)
- **Free/Starter**: Self-hosted (FLUX, XTTSv2, Whisper) + cheapest APIs (Flash-Lite, Hailuo, Fish Audio)
- **Pro**: Same defaults + access to premium models as upgrade options
- **Business**: ElevenLabs, Veo 3, Runway Gen-4.5 included (costs us money → behind subscription)
- **BYO Key (V2)**: Users bring own ElevenLabs/OpenAI/Runway keys → costs us nothing

### BYOP Priority (V2)
1. ElevenLabs (voice — highest demand)
2. OpenAI (text/image — many devs have keys)
3. Google Gemini (generous free tier)
4. Runway (video — dev-friendly API)
5. Stability AI / FLUX (power users)

### Key Rule
Anything that costs US money for an account → behind paid tiers only. Self-hosted + cheap APIs for free/starter. Evaluate ElevenLabs quality vs Fish Audio vs XTTSv2 before committing to paid integrations.
