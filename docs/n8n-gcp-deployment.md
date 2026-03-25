# n8n GCP Deployment Path

This document outlines the deployment path for n8n on Google Cloud Platform (GCP) for the FFE Social Engine.

## Architecture

n8n is deployed on a Google Compute Engine (GCE) e2-micro or e2-small instance (depending on workflow load), running Docker and Docker Compose. This provides a cost-effective, easily manageable environment for running our background scheduling and cross-product automated workflows.

## Prerequisites

- GCP Account with billing enabled
- GCP Project (`ffe-social-engine-prod`)
- Google Cloud SDK (`gcloud`) installed locally
- Domain name mapped to the GCE instance IP (e.g., `n8n.ffe-social.com`)

## Deployment Steps

1. **Create a GCE Instance:**
   - Image: Container-Optimized OS or Debian 12
   - Machine Type: `e2-small`
   - Firewall: Allow HTTP and HTTPS traffic

2. **Install Docker and Docker Compose (if not using Container-Optimized OS):**
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   ```

3. **Configure Environment:**
   Create a `.env` file on the server:
   ```env
   N8N_HOST=n8n.ffe-social.com
   N8N_PORT=5678
   N8N_PROTOCOL=https
   NODE_ENV=production
   WEBHOOK_URL=https://n8n.ffe-social.com/
   GENERIC_TIMEZONE=UTC
   N8N_CUSTOM_EXTENSIONS=n8n-nodes-zernio
   ```

4. **Deploy using Docker Compose:**
   Use the provided `docker-compose.yml` in `docker/n8n/`. We recommend setting up Caddy or Traefik as a reverse proxy alongside n8n to handle automatic Let's Encrypt SSL certificates.

   ```bash
   docker-compose up -d
   ```

5. **Secrets Management:**
   Store ZERNIO_API_KEY and other sensitive tokens in GCP Secret Manager, or pass them directly to the n8n environment configuration.

6. **Zernio Community Node:**
   The `docker-compose.yml` automatically installs the `n8n-nodes-zernio` package on startup. Once n8n is running, configure the Zernio credentials via the n8n UI using the API key from GCP Secret Manager.
