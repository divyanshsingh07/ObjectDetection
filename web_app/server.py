#!/usr/bin/env python3
"""
Simple HTTP Server for Object Detection Web App
Run this file to serve the web application locally
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    """Start the HTTP server and open the web app in browser"""
    
    # Change to the web app directory
    os.chdir(DIRECTORY)
    
    # Create server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Object Detection Web App Server Started!")
        print(f"📁 Serving directory: {DIRECTORY}")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"🔗 Opening web app in browser...")
        print(f"⏹️  Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Open web app in default browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            print("⚠️  Could not open browser automatically")
            print(f"   Please manually open: http://localhost:{PORT}")
        
        # Start server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            print("👋 Goodbye!")

if __name__ == "__main__":
    main()
