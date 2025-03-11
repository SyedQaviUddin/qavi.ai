from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)


DEEPSEEK_API_KEY = "sk-f6c1825c332449aeb31a883562b8a744"
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"  

def generate_limerick_deepseek(prompt):
    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "deepseek-chat",  
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 450,
            "temperature": 0.6
        }
        
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=data)
        response.raise_for_status()
        
        limerick = response.json()["choices"][0]["message"]["content"].strip()
        return limerick
    except requests.exceptions.RequestException as e:
        return f"Error communicating with DeepSeek API: {e}"
    except Exception as e:
        return f"An error occurred: {e}"

@app.route('/')
def home():
    return render_template('index.html')  


@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = request.files['image']
    analysis_result = f"Analyzed image: {image.filename}" 
    return jsonify({"analysis": analysis_result})


@app.route('/generate-limerick', methods=['POST'])
def generate_limerick():
    data = request.get_json()
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        limerick = generate_limerick_deepseek(prompt)
        return jsonify({"limerick": limerick})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
    
    
    
    
    
    