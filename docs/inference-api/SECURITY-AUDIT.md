# Inference API Security Audit

## 1. Container Isolation & Security
- [x] **Non-Root User:** Container runs as non-root user (`inference`).
- [x] **Read-Only Root Filesystem:** `read_only: true` is enforced in docker-compose.
- [x] **No New Privileges:** `security_opt: no-new-privileges:true` is set.
- [x] **Capability Dropping:** `cap_drop: ALL` is enforced, dropping unnecessary capabilities.
- [x] **Resource Limits:** CPU and Memory limits configured (pending final infra spec).
- [x] **Model Mounts:** Machine learning models are mounted as read-only (`:ro`).
- [x] **Minimal Base Image:** Uses Python slim base image to reduce attack surface.
- [x] **Process PID 1 Handling:** Container correctly manages process signals.
- [x] **TMPFS Mounts:** Any necessary temporary directories are mounted as tmpfs.
- [x] **Privileged Mode Disabled:** Container does not run in privileged mode.

## 2. Network Security
- [x] **Localhost Binding:** API port is bound strictly to `127.0.0.1:8000`.
- [x] **Internal Network:** Docker container resides in an internal bridge network (`inference_bridge`).
- [x] **pf Firewall:** macOS packet filter (`pf`) configured to block default ingress.
- [x] **Tailscale VPN:** Ingress explicitly restricted to the dynamic Tailscale interface.
- [x] **Port Scanning:** Verified no external ports are accessible from public internet.

## 3. Authentication & Payload Integrity
- [x] **Bearer Token Auth:** Every request verified against `INFERENCE_API_KEY`.
- [x] **HMAC Signatures:** `X-Signature` validated on all requests, including GETs with empty bodies (`""`).
- [x] **Timing Attacks:** Used `hmac.compare_digest` to prevent timing attacks during signature validation.
- [x] **Transport Encryption:** Tailscale provides end-to-end WireGuard encryption for transport.

## 4. API & Application Security
- [x] **Input Validation:** Pydantic models strictly validate all incoming data types.
- [x] **Error Handling:** Stack traces are suppressed; uniform error responses returned (e.g., 401 Invalid API Key).
- [x] **Queue Protection:** Memory queues monitored; `queue_depth` exposed on health endpoint for DoS prevention.
- [x] **Dependency Scanning:** Known vulnerabilities checked during CI pipeline.
