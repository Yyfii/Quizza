# código da API Flask
import os
from dotenv import load_dotenv, dotenv_values

from flask import Flask, request, jsonify
from flask_cors import CORS

import fitz #PyMuPDF
import spacy

from utils.generate_questions import gerar_questoes, parsear_questoes


load_dotenv()


app = Flask(__name__)


frontendUrl = os.getenv('FRONTEND_URL')

# Permitir credenciais e origem específica
# Corrija isso:
CORS(app, supports_credentials=True, origins=[frontendUrl])


nlp = spacy.load("pt_core_news_sm")

@app.route('/')
def home():
    return "<h1>API Flask do Gerador de Simulados está funcionando!</h1>"

@app.route('/upload', methods=['POST'])
def upload_pdf():

    title = request.form.get("title")
    num_questions = int(request.form.get("num_questions", 3))
    level = request.form.get("level", "média")
    format = request.form.get("format", "múltipla-escolha")

    file = request.files.get('file')  # Use .get para evitar erro chave
    if not file:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    pdf_bytes = file.read()

    # extract text
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = "\n".join([page.get_text() for page in doc])

    # process with spacy
    doc_spacy = nlp(text)
    sentences = [sent.text for sent in list(doc_spacy.sents)[:30]]
    sentence_to_sent = " ".join(sentences)

    # send to deepseek api
    try:
        questoes_texto = gerar_questoes(sentence_to_sent, num_questions, level, format, title)
        questoes_json = parsear_questoes(questoes_texto)
        return jsonify({"questions": questoes_json})
    except Exception as e:
        print("Erro no endpoint /upload", e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5001)

