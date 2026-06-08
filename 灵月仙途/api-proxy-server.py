#!/usr/bin/env python3
"""
灵月仙途 - API 反向代理服务器
用于在开发环境中添加 CORS 支持
"""

import http.server
import socketserver
import urllib.request
import urllib.error
import json

PORT = 8089  # 代理服务器端口
BACKEND_URL = "http://localhost:8088/api"  # 后端 API 地址

class CORSProxyHandler(http.server.SimpleHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """处理 CORS 预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Max-Age', '3600')
        self.end_headers()
    
    def do_GET(self):
        """代理 GET 请求"""
        self.proxy_request('GET')
    
    def do_POST(self):
        """代理 POST 请求"""
        self.proxy_request('POST')
    
    def do_PUT(self):
        """代理 PUT 请求"""
        self.proxy_request('PUT')
    
    def do_DELETE(self):
        """代理 DELETE 请求"""
        self.proxy_request('DELETE')
    
    def do_PATCH(self):
        """代理 PATCH 请求"""
        self.proxy_request('PATCH')
    
    def proxy_request(self, method):
        """代理请求到后端服务器"""
        try:
            # 构建目标 URL
            target_url = f"{BACKEND_URL}{self.path}"
            
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            # 创建请求
            req = urllib.request.Request(target_url, data=body, method=method)
            
            # 复制请求头（除了 host）
            for key, value in self.headers.items():
                if key.lower() not in ['host', 'content-length']:
                    req.add_header(key, value)
            
            # 发送请求
            with urllib.request.urlopen(req, timeout=30) as response:
                # 读取响应
                result = response.read()
                status = response.status
                
                # 发送响应
                self.send_response(status)
                
                # 添加 CORS 头
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                self.send_header('Access-Control-Allow-Headers', '*')
                self.send_header('Access-Control-Expose-Headers', 'Authorization, Content-Type')
                
                # 复制响应头
                for key, value in response.headers.items():
                    if key.lower() not in ['transfer-encoding', 'connection']:
                        self.send_header(key, value)
                
                self.end_headers()
                self.wfile.write(result)
                
        except urllib.error.HTTPError as e:
            # 处理 HTTP 错误
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
            self.end_headers()
            self.wfile.write(e.read())
            
        except urllib.error.URLError as e:
            # 处理网络错误
            self.send_response(502)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error = {"error": "Backend server unavailable", "message": str(e.reason)}
            self.wfile.write(json.dumps(error).encode())
            
        except Exception as e:
            # 处理其他错误
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error = {"error": "Internal proxy error", "message": str(e)}
            self.wfile.write(json.dumps(error).encode())
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{self.log_date_time_string()}] {args[0]}")

if __name__ == "__main__":
    print(f"🚀 灵月仙途 API 代理服务器启动中...")
    print(f"📍 监听端口：{PORT}")
    print(f"🔗 后端地址：{BACKEND_URL}")
    print(f"🌐 访问地址：http://localhost:{PORT}")
    print(f"📱 局域网访问：http://你的IP:{PORT}")
    print("")
    print("按 Ctrl+C 停止服务")
    print("=" * 60)
    
    # 允许地址复用
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), CORSProxyHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 代理服务器已停止")
