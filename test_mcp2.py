import subprocess
import json
import sys
import time

p = subprocess.Popen(["npm", "exec", "frame0-mcp-server"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)

def send_req(method, params):
    req = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params
    }
    p.stdin.write(json.dumps(req) + "\n")
    p.stdin.flush()
    for line in p.stdout:
        return json.loads(line.strip())

# Initialize
res = send_req("initialize", {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {"name": "test-client", "version": "1.0.0"}
})
print("INIT:", res)

send_req("notifications/initialized", {})

res = send_req("tools/call", {
    "name": "add_page",
    "arguments": {"name": "Test Page Py"}
})
print("ADD PAGE:", res)

res = send_req("tools/call", {
    "name": "create_rectangle",
    "arguments": {
        "name": "Test Rect",
        "left": 10,
        "top": 10,
        "width": 100,
        "height": 100
    }
})
print("ADD RECT:", res)

p.terminate()
