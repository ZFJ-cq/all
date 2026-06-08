#!/usr/bin/env python3
"""
灵月仙途 - API 反向代理服务器
用于解决 CORS 问题
"""

import http.server
import socketserver
import urllib.request
import urllib.error
import traceback

PORT = 8089
BACKEND = 'http://127.0.0.1:8088/api'

class CORSProxyHandler(http.server.BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """处理 CORS 预检请求"""
        try:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
            self.send_header('Access-Control-Allow-Headers', '*')
            self.send_header('Access-Control-Max-Age', '3600')
            self.end_headers()
            self.log_message(f"OPTIONS request - 200 OK")
        except Exception as e:
            self.log_error(f"OPTIONS error: {e}")
    
    def do_GET(self):
        self.handle_request('GET')
    
    def do_POST(self):
        self.handle_request('POST')
    
    def do_PUT(self):
        self.handle_request('PUT')
    
    def do_DELETE(self):
        self.handle_request('DELETE')
    
    def do_PATCH(self):
        self.handle_request('PATCH')
    
    def handle_request(self, method):
        """处理所有 HTTP 请求"""
        try:
            # 构建目标 URL
            target_url = f'{BACKEND}{self.path}'
            self.log_message(f"{method} {self.path} -> {target_url}")
            
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            # 创建请求
            req = urllib.request.Request(target_url, data=body, method=method)
            
            # 复制请求头（排除 host）
            for key, value in self.headers.items():
                if key.lower() != 'host':
                    req.add_header(key, value)
            
            # 发送请求到后端
            try:
                with urllib.request.urlopen(req, timeout=30) as response:
                    # 读取响应数据
                    result = response.read()
                    
                    # 发送响应给客户端
                    self.send_response(response.status)
                    
                    # 添加 CORS 头
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                    self.send_header('Access-Control-Allow-Headers', '*')
                    
                    # 复制响应头
                    for key, value in response.headers.items():
                        if key.lower() not in ['transfer-encoding', 'connection']:
                            self.send_header(key, value)
                    
                    self.end_headers()
                    self.wfile.write(result)
                    
                    self.log_message(f"Response: {response.status} - {len(result)} bytes")
                    
            except urllib.error.HTTPError as e:
                # 处理 HTTP 错误（如 403, 404, 500）
                self.log_message(f"HTTP Error {e.code}")
                self.send_response(e.code)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                self.send_header('Access-Control-Allow-Headers', '*')
                self.end_headers()
                try:
                    error_body = e.read()
                    self.wfile.write(error_body)
                except:
                    pass
                    
            except urllib.error.URLError as e:
                # 处理网络错误
                self.log_error(f"URL Error: {e.reason}")
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_msg = f'{{"error": "Bad Gateway", "message": "Cannot connect to backend: {str(e.reason)}"}}'
                self.wfile.write(error_msg.encode())
                
        except Exception as e:
            # 处理其他异常
            self.log_error(f"Proxy error: {str(e)}")
            traceback.print_exc()
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_msg = f'{{"error": "Internal Server Error", "message": "{str(e)}"}}'
            self.wfile.write(error_msg.encode())
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[PROXY] {self.address_string()} - {format % args}")
    
    def log_error(self, format, *args):
        """自定义错误日志"""
        print(f"[PROXY ERROR] {self.address_string()} - {format % args}")

def run_server():
    """启动代理服务器"""
    # 允许地址复用
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(('0.0.0.0', PORT), CORSProxyHandler) as httpd:
        print("=" * 60)
        print(f"✅ 灵月仙途 API 代理服务器")
        print(f"📍 监听端口：{PORT}")
        print(f"🔗 后端地址：{BACKEND}")
        print(f"🌐 访问地址：http://localhost:{PORT}")
        print(f"📱 局域网访问：http://你的IP:{PORT}")
        print("=" * 60)
        print("按 Ctrl+C 停止服务\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 代理服务器已停止")

if __name__ == '__main__':
    run_server()
