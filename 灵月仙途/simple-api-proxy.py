#!/usr/bin/env python3
"""
灵月仙途 - 简单 API 代理服务器
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.error

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.handle_request('GET')
    
    def do_POST(self):
        self.handle_request('POST')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Max-Age', '3600')
        self.end_headers()
    
    def handle_request(self, method):
        try:
            # 目标 URL
            target_url = f'http://localhost:8088/api{self.path}'
            
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            # 创建请求
            req = urllib.request.Request(target_url, data=body, method=method)
            
            # 复制请求头
            for key, value in self.headers.items():
                if key.lower() not in ['host', 'content-length']:
                    req.add_header(key, value)
            
            # 发送请求并获取响应
            with urllib.request.urlopen(req, timeout=30) as response:
                result = response.read()
                
                # 发送响应
                self.send_response(response.status)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                self.send_header('Access-Control-Allow-Headers', '*')
                
                for key, value in response.headers.items():
                    if key.lower() not in ['transfer-encoding', 'connection']:
                        self.send_header(key, value)
                
                self.end_headers()
                self.wfile.write(result)
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                self.wfile.write(e.read())
            except:
                pass
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(f'Proxy Error: {str(e)}'.encode())
    
    def log_message(self, format, *args):
        print(f"[PROXY] {args[0]}")

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8089), ProxyHandler)
    print("✅ API 代理服务器启动成功！")
    print("📍 端口：8089")
    print("🔗 后端：http://localhost:8088/api")
    print("=" * 60)
    server.serve_forever()
