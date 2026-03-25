import subprocess
import json
import sys

p = subprocess.Popen(["npm", "exec", "frame0-mcp-server"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)

msg_id = 1
def send_req(method, params):
    global msg_id
    req = {"jsonrpc": "2.0", "id": msg_id, "method": method, "params": params}
    msg_id += 1
    p.stdin.write(json.dumps(req) + "\n")
    p.stdin.flush()
    while True:
        line = p.stdout.readline()
        if not line: return None
        if "jsonrpc" in line:
            try:
                resp = json.loads(line.strip())
                if resp.get("id") == req["id"]: return resp
            except: pass

send_req("initialize", {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1"}})
send_req("notifications/initialized", {})

def call_tool(name, args):
    res = send_req("tools/call", {"name": name, "arguments": args})
    if res and "result" in res and "content" in res["result"]:
        content = res["result"]["content"][0]["text"]
        if "Created " in content or "Added " in content:
            try: return json.loads(content.split(": ", 1)[1]).get("id")
            except: pass
    return None

with open("wireframes.json", "r") as f:
    pages = json.load(f)

for page in pages:
    print(f"Generating {page['name']}...")
    call_tool("add_page", {"name": page["name"]})
    frame_id = call_tool("create_frame", {"frameType": "browser", "name": "Browser Main"})
    for shape in page["shapes"]:
        stype = shape[0]
        args = {"parentId": frame_id, "name": shape[1]}
        if stype == "rect":
            args.update({"left": shape[2], "top": shape[3], "width": shape[4], "height": shape[5], "fillColor": shape[6], "strokeColor": shape[7]})
            if len(shape) > 8: args["corners"] = shape[8]
            call_tool("create_rectangle", args)
        elif stype == "text":
            args.update({"left": shape[2], "top": shape[3], "text": shape[4], "fontSize": shape[5], "fontColor": shape[6], "type": "label"})
            call_tool("create_text", args)
        elif stype == "line":
            args.update({"x1": shape[2], "y1": shape[3], "x2": shape[4], "y2": shape[5], "strokeColor": shape[6]})
            call_tool("create_line", args)
    print(f"Finished {page['name']}")

p.terminate()
