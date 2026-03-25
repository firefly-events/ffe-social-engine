#!/bin/bash
set -euo pipefail

echo "Detecting Tailscale interface..."
# Dynamically find the Tailscale interface on macOS
TS_IFACE=$(ifconfig -a | grep -B 1 "tailscale" | grep "flags=" | awk -F: '{print $1}')

if [ -z "$TS_IFACE" ]; then
    echo "Error: Could not find Tailscale interface. Is Tailscale running?"
    exit 1
fi

echo "Found Tailscale interface: $TS_IFACE"

PF_CONF="/etc/pf.anchors/inference.api"

echo "Creating pf rules..."
sudo bash -c "cat > $PF_CONF" <<EOF
# Block all incoming traffic by default
block in all
pass out all

# Allow loopback
pass quick on lo0 all

# Allow inbound traffic ONLY on Tailscale interface for port 8000
pass in quick on $TS_IFACE proto tcp from any to any port 8000

# Optionally, block all other inbound on Tailscale
block in quick on $TS_IFACE all
EOF

echo "Loading pf rules..."
# Add to main pf.conf if not exists (simplified for script, usually requires careful merging)
if ! grep -q "anchor \"inference.api\"" /etc/pf.conf; then
    echo "Adding anchor to /etc/pf.conf"
    sudo sed -i '' '/load anchor/a\
anchor "inference.api"\
load anchor "inference.api" from "/etc/pf.anchors/inference.api"
' /etc/pf.conf
fi

# Reload pf
sudo pfctl -ef /etc/pf.conf
echo "pf firewall configured and reloaded."
