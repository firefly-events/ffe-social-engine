FROM n8nio/n8n:latest

# Install Zernio community node
RUN cd /usr/local/lib/node_modules/n8n && \
    npx n8n-node-dev build --destination /home/node/.n8n/custom || true

# Copy example workflows
COPY scheduled-post.json /home/node/.n8n/workflows/

# n8n runs on port 5678
EXPOSE 5678

ENV N8N_PORT=5678
ENV N8N_PROTOCOL=https
ENV GENERIC_TIMEZONE=America/Chicago
