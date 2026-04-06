from flask import Flask, render_template, jsonify
import psutil
import time
import socket
from collections import defaultdict

app = Flask(__name__)

last = psutil.net_io_counters()
last_time = time.time()
history = []

def get_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "Unavailable"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/data')
def data():
    global last, last_time, history

    current = psutil.net_io_counters()
    now = time.time()
    duration = now - last_time

    upload = (current.bytes_sent - last.bytes_sent) / duration
    download = (current.bytes_recv - last.bytes_recv) / duration

    last = current
    last_time = now

    upload_kb = round(upload / 1024, 2)
    download_kb = round(download / 1024, 2)

    # Save history
    history.append({
        "time": time.strftime("%H:%M:%S"),
        "upload": upload_kb,
        "download": download_kb
    })
    if len(history) > 20:
        history.pop(0)

    # Protocol detection
    tcp = 0
    udp = 0

    try:
        connections = psutil.net_connections(kind='inet')
        for conn in connections:
            if conn.type == socket.SOCK_STREAM:
                tcp += 1
            elif conn.type == socket.SOCK_DGRAM:
                udp += 1
    except:
        connections = []
        tcp = 0
        udp = 0

    # Top apps
    app_usage = defaultdict(int)
    try:
        for conn in connections:
            if conn.pid:
                try:
                    name = psutil.Process(conn.pid).name()
                    app_usage[name] += 1
                except:
                    pass
    except:
        pass

    top_apps = sorted(app_usage.items(), key=lambda x: x[1], reverse=True)[:5]

    return jsonify({
        "upload": upload_kb,
        "download": download_kb,
        "ip": get_ip(),
        "connections": len(connections) if connections else "Permission Required",
        "tcp": tcp if tcp else "Permission Required",
        "udp": udp if udp else "Permission Required",
        "history": history,
        "apps": top_apps
    })

if __name__ == "__main__":
    app.run(debug=True)