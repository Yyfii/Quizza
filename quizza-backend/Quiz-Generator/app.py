# código da API Flask
import os
from dotenv import load_dotenv, dotenv_values

from flask import Flask, request, jsonify
from flask_cors import CORS

import fitz #PyMuPDF
import spacy

from utils.generate_questions import gerar_questoes, parsear_questoes

app = Flask(__name__)
CORS(app)

load_dotenv()

# Permitir credenciais e origem específica
CORS(app, supports_credentials=True, origins=[os.getenv("FRONTEND_URL")])

nlp = spacy.load("pt_core_news_sm")

@app.route('/upload', methods=['POST'])
def upload_pdf():

    title = request.form.get("title")
    num_questions = int(request.form.get("num_questions", 3))
    level = request.form.get("level", "média")
    format = request.form.get("format", "múltipla-escolha")

    file = request.files['file']
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
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)


