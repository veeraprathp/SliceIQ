from http.server import BaseHTTPRequestHandler
import json
import os
from litellm import completion

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        data = json.loads(body.decode('utf-8'))

        # Get key and model from the user's request
        api_key = data.get('api_key')
        model = data.get('model', 'groq/mixtral-8x7b-32768')
        topic = data.get('topic', 'General Knowledge')

        if not api_key:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'API Key is required'}).encode())
            return

        try:
            response = completion(
                model=model,
                api_key=api_key,
                messages=[{
                    "role": "user",
                    "content": f"Generate 10 quiz questions about {topic}. Return ONLY JSON: [{{'q':'?','options':['A','B','C','D'],'answer':'A'}}]"
                }],
                response_format={ "type": "json_object" }
            )

            questions = json.loads(response.choices[0].message.content)
            if isinstance(questions, dict) and "questions" in questions:
                questions = questions["questions"]

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'questions': questions}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
