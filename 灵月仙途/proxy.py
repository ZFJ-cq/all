#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request

PORT = 8089
BACKEND = 'http://127.0.0.1:8088/api'

class Handler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Max-Age', '3600')
        self.end_headers()
    
    def do_GET(self):
        self.proxy('GET')
    
    def do_POST(self):
        self.proxy('POST')
    
    def proxy(self, method):
        try:
            url = BACKEND + self.path
            req = urllib.request.Request(url, method=method)
            
            # 复制请求头
            for k, v in self.headers.items():
                if k.lower() != 'host':
                    req.add_header(k, v)
            
            # 读取请求体
            length = int(self.headers.get('Content-Length', 0))
            data = self.rfile.read(length) if length > 0 else None
            if data:
                req.data = data
            
            # 发送请求
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = resp.read()
                self.send_response(resp.status)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                self.send_header('Access-Control-Allow-Headers', '*')
                self.end_headers()
                self.wfile.write(result)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(str(e).encode())
    
    def log_message(self, format, *args):
        pass

with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    print(f'✅ Proxy running on port {PORT}')
    print(f'🔗 Backend: {BACKEND}')
    httpd.serve_forever()
