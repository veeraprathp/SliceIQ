import http.server
import json
import os
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

PORT = 8001

class UniversalAIHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/generate-quiz':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            # Configuration from frontend or env
            api_key = data.get('api_key') or os.getenv("API_KEY")
            model = data.get('model') or os.getenv("MODEL_NAME", "groq/mixtral-8x7b-32768")
            topic = data.get('topic', 'General Knowledge')

            try:
                # Universal call using LiteLLM
                response = completion(
                    model=model,
                    api_key=api_key,
                    messages=[{
                        "role": "user",
                        "content": f"""Generate exactly 10 quiz questions about "{topic}". 
                        Return ONLY a valid JSON array in this exact format:
                        [{{"q":"Question?","options":["A","B","C","D"],"answer":"A"}}]
                        No other text."""
                    }],
                    response_format={ "type": "json_object" }
                )

                content = response.choices[0].message.content
                questions = json.loads(content)
                
                # Handle nested "questions" key if the LLM adds one
                if isinstance(questions, dict) and "questions" in questions:
                    questions = questions["questions"]

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'questions': questions}).encode('utf-8'))

            except Exception as e:
                print(f"Error: {str(e)}")
                self.send_response(500)
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
        self.wfile.write(b"Quiz Ninja API Proxy is active. Use POST /api/generate-quiz")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server = http.server.HTTPServer(('localhost', PORT), UniversalAIHandler)
    print(f"🚀 Universal AI Proxy (LiteLLM) running on http://localhost:{PORT}")
    server.serve_forever()
