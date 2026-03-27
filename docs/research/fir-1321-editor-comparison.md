# Image & Video Editor Cost-Benefit Comparison

## Overview

This document evaluates image and video editing solutions for the Social Engine project. The goal is to identify the best path for v1 (light editing) and v2 (enterprise/advanced editing), balancing cost, maintenance, and time-to-market.

## Comparison Matrix: Image Editors

| Tool | Type | Cost (Annual/SaaS) | License | Maintenance | React/Next.js | Best For |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pintura** | SDK | $749 | Proprietary | High | Excellent (Native) | **v1 Recommendation.** Fast, polished, affordable. |
| **Jimp** | Backend | Free | MIT | Active (v1.6+) | Node.js / API | Simple server-side processing (resize, watermark). |
| **Fabric.js** | Canvas | Free | MIT | Active (v6.x) | Good (TS Native) | Building a custom 2D editor from scratch. |
| **Konva.js** | Canvas | Free | MIT | Active | Excellent (`react-konva`) | High-performance 2D scenes/animations. |
| **Photopea** | Iframe | Free (w/ ads) | Proprietary | Active | Iframe Embed | "Photoshop-in-a-box" for pro users. |
| **Polotno SDK** | SDK | $9,990 | Proprietary | High | Excellent (React) | Canva-clone functionality for Growth/v2. |
| **IMG.LY CE.SDK** | SDK | ~$13,000 | Proprietary | High | Excellent | Enterprise-grade, multi-platform editor. |
| **tui-image-editor**| SDK | Free | MIT | **Unmaintained** | Poor | Not recommended. |
| **Pixlr API** | API/Embed | Free up to 1k/mo | Proprietary | Active | Good | AI-driven manipulation + simple embed. |

## Comparison Matrix: Video Editors

| Tool | Type | Cost (Annual/SaaS) | License | Maintenance | React/Next.js | Best For |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Remotion** | React | Free (<= 3 staff) | Custom (Paid for 4+) | High | Native | **Core Video Engine.** Programmatic video. |
| **FFmpeg.wasm** | Browser | Free | LGPL/GPL | Active | Complex (COOP/COEP) | Client-side encoding/transcoding. |
| **DesignCombo** | SDK | Free / MIT* | MIT (on Remotion) | Active | Native | CapCut-like timeline for v2. |
| **IMG.LY Video** | SDK | ~$13,000 | Proprietary | High | Excellent | Professional-grade enterprise video editing. |

\* *Note: DesignCombo core is MIT but requires Remotion license if staff > 3.*

---

## Deep Dive: Key Findings

### 1. The "Light Editing" Sweet Spot (v1)

For v1, the requirement is "generate → light tweak (crop, rotate, filters) → post."
*   **Pintura** is the clear winner here. At **$749/year**, it provides a mobile-friendly, high-performance UI that supports all v1 requirements (crop, rotate, basic filters, annotations) with minimal engineering effort.
*   **Alternative (Free):** Use **Jimp** (v1.6) for server-side processing and **react-easy-crop** for the client-side UI. This requires more manual wiring but has zero licensing cost.

### 2. The Video Challenge

*   **Remotion** is the industry standard for "React-as-Video." It is perfect for Social Engine's AI generation pipeline where we might want to overlay dynamic text or captions programmatically.
*   **FFmpeg.wasm** is powerful but requires care in a Next.js/Vercel environment. It requires `SharedArrayBuffer`, which mandates `COOP` and `COEP` headers. Note: these headers **may break Stripe and Clerk Auth** depending on your setup — isolation to a subdomain or a specialized service worker is recommended; verify this applies to your specific configuration before adopting.

### 3. Enterprise Integration (v2)

*   The ticket notes that heavy users already have Canva/Photoshop.
*   **v2 Strategy:** Prioritize **Canva Connect API** and **Adobe Express Embed SDK** over building a "Canva clone."
*   If an in-house "full design" tool is required, **Polotno** is the most cost-effective "Canva-in-a-box," while **IMG.LY** is the most robust enterprise option.

---

## Strategic Recommendations

### v1 Recommendation (Immediate)

1.  **Image:** Integrate **Pintura**. It fits the "Social Engine" aesthetic and handles the "light tweak" requirement out of the box. Cost is negligible for a funded SaaS.
2.  **Video:** Use **Remotion** for the generation pipeline. For v1 "editing," limit to server-side trimming/cropping via the existing `visual-gen` or `composer` services (FFmpeg in Python/Node).
3.  **Auth/Security:** Avoid `FFmpeg.wasm` in the main dashboard app to prevent breaking Clerk/Stripe.

### v2 Recommendation (Growth)

1.  **Integration First:** Implement "Export to Canva" and "Edit in Adobe Express" buttons. This satisfies the Enterprise user who wants to use their existing tools.
2.  **Advanced Video:** If a timeline editor (CapCut style) is needed, evaluate **DesignCombo** (MIT/Remotion) or **IMG.LY Video SDK**.
3.  **AI Tools:** Leverage **Pixlr API** or **VistaCreate API** for specific AI-driven features like "Object Remover" or "Background Swap" if not building them in-house.

## Implementation Complexity (Time-to-Integrate)

*   **Low (1-3 days):** Pintura, Photopea (iframe), Pixlr (embed).
*   **Medium (1-2 weeks):** Remotion, react-konva (custom UI), Jimp + react-easy-crop.
*   **High (3+ weeks):** FFmpeg.wasm (due to COOP/COEP isolation), Building a custom Fabric.js editor.

---
*Report prepared by Gemini CLI Agent for FIR-1321*
