import subprocess
import json
import sys

p = subprocess.Popen(["npm", "exec", "frame0-mcp-server"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)

# Try sending a simple JSON-RPC
req = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "get_current_page_id",
        "arguments": {}
    }
}

p.stdin.write(json.dumps(req) + "\n")
p.stdin.flush()

for line in p.stdout:
    print("RECV:", line.strip())
    break

p.terminate()
