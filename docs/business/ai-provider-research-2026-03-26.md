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
| Capability | Worth It? | Why |
|---|---|---|
| Image (FLUX.1-schnell) | YES | $0, 10-20 sec, Apache 2.0, good quality |
| Video | NO | Apple Silicon too slow, needs NVIDIA 24-80GB |
| Voice (XTTSv2) | MARGINAL | MPS broken, CPU-only = slow. Batch backup only |
| Transcription (Whisper) | ABSOLUTELY | 10 min audio in 1.2 sec. No-brainer. |
| Text | NO | Cloud is $0.0002/caption already |

### BYOP Priority (V2)
1. ElevenLabs (voice — highest demand)
2. OpenAI (text/image — many devs have keys)
3. Google Gemini (generous free tier)
4. Runway (video — dev-friendly API)
5. Stability AI / FLUX (power users)
