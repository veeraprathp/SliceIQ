#!/usr/bin/env python3
import http.server
import json
import urllib.request
import urllib.error
from urllib.parse import urlparse
import sys

PORT = 8001

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/generate-quiz':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            api_key = data.get('api_key')
            topic = data.get('topic')

            try:
                response = self._call_anthropic_api(api_key, topic)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        html = """
        <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #0a0a12; color: #00f2ff;">
                <h1>🍉 Quiz Ninja API Proxy</h1>
                <p>Status: <span style="color: #00ff00;">Running</span></p>
                <hr style="width: 200px; border-color: #333;">
                <p>This port (8001) is for API calls only.</p>
                <p>To play the game, please open:</p>
                <a href="http://localhost:8000" style="color: #ff00ff; font-size: 20px; text-decoration: none; border: 1px solid #ff00ff; padding: 10px 20px; border-radius: 5px;">Go to Game (Port 8000)</a>
            </body>
        </html>
        """
        self.wfile.write(html.encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _call_anthropic_api(self, api_key, topic):
        # Detect API provider by key format
        if api_key.startswith("gsk_"):
            return self._call_groq_api(api_key, topic)
        elif api_key.startswith("sk-ant-"):
            return self._call_claude_api(api_key, topic)
        else:
            raise Exception("Unknown API key format")

    def _call_groq_api(self, api_key, topic):
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        payload = {
            "model": "mixtral-8x7b-32768",
            "temperature": 0.7,
            "max_tokens": 1500,
            "messages": [{
                "role": "user",
                "content": f"""Generate exactly 10 quiz questions about "{topic}". Return ONLY valid JSON array in this format:
[{{"q":"What is...?","options":["Option A","Option B","Option C","Option D"],"answer":"Option A"}}]

Make questions interesting and varied. Return valid JSON ONLY, no other text."""
            }]
        }

        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                json_text = result['choices'][0]['message']['content']
                questions = json.loads(json_text)
                return {'success': True, 'questions': questions}
        except urllib.error.HTTPError as e:
            error_msg = e.read().decode('utf-8')
            raise Exception(f"Groq API Error: {error_msg}")

    def _call_claude_api(self, api_key, topic):
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        }
        payload = {
            "model": "claude-opus-4-7",
            "max_tokens": 1500,
            "messages": [{
                "role": "user",
                "content": f"""Generate exactly 10 quiz questions about "{topic}". Return ONLY valid JSON array in this format:
[{{"q":"What is...?","options":["Option A","Option B","Option C","Option D"],"answer":"Option A"}}]

Make questions interesting and varied. Return valid JSON ONLY, no other text."""
            }]
        }

        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                json_text = result['content'][0]['text']
                questions = json.loads(json_text)
                return {'success': True, 'questions': questions}
        except urllib.error.HTTPError as e:
            error_msg = e.read().decode('utf-8')
            raise Exception(f"Claude API Error: {error_msg}")

    def log_message(self, format, *args):
        pass  # Suppress logs

if __name__ == '__main__':
    server = http.server.HTTPServer(('localhost', PORT), ProxyHandler)
    print("*** Quiz Ninja API Proxy running on http://localhost:" + str(PORT))
    print("    Frontend: http://localhost:8000")
    server.serve_forever()
