#!/usr/bin/env python3
"""Start serveo SSH tunnel, print URL to stdout, then keep alive."""
import subprocess, sys, signal, time, re

proc = subprocess.Popen(
    ["ssh", "-o", "StrictHostKeyChecking=no", "-o", "ServerAliveInterval=60",
     "-o", "ExitOnForwardFailure=yes", "-R", "80:localhost:8000", "serveo.net"],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
)

# Read until we get the URL
url = None
for line in proc.stdout:
    sys.stdout.write(line)
    sys.stdout.flush()
    m = re.search(r'https://[a-zA-Z0-9.-]+\.serveousercontent\.com', line)
    if m:
        url = m.group(0)
        print(f"\nSERVEO_URL={url}", flush=True)
        break

if url is None:
    print("ERROR: Could not extract serveo URL", file=sys.stderr)
    sys.exit(1)

# Keep running until killed
signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
while proc.poll() is None:
    time.sleep(5)
    
print("SSH tunnel exited", file=sys.stderr)
