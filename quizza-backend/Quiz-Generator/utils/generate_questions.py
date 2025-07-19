# integração com deepseek

from openai import OpenAI
import os
from dotenv import load_dotenv
import re

load_dotenv('.env')
key = os.getenv("OPEN_API_KEY")
frontend = os.getenv('FRONTEND_URL')

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=key,
)

def gerar_questoes(texto, num_questions=3, level="média", format="múltipla-escolha", title="Simulado"):
    prompt = f'''
    Gere {num_questions} questões no formato "{format}" com nível de dificuldade {level}, baseadas no seguinte conteúdo:
    Título: {title}

    \"\"\"{texto}\"\"\"

    Formato:
    Q1: [pergunta]
    A) ...
    B) ...
    C) ...
    D) ...
    Correct Answer: [letra) alternativa correta]
'''
    completion = client.chat.completions.create(
        extra_headers={
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Assistente de Estudo - Quiza",
        },
        model="deepseek/deepseek-r1:free",
        messages=[
            {
                "role":"system",
                "content": "Você é um assistente de estudos que gera questões de múltipla escolha a partir de um conteúdo dado."
            },
            {
                "role":"user",
                "content":prompt,   
            },
        ],
        stream=False
    )

    return completion.choices[0].message.content

def parsear_questoes(texto):
 # Dividir o texto em blocos por questão
    blocos = re.split(r'\n(?=Q\d+:)', texto.strip())

    questoes = []
    for bloco in blocos:
        try:
            padrao = (
            r"Q\d+:\s*(.*?)\s*\n"
            r"A\)\s*(.*?)\s*\n"
            r"B\)\s*(.*?)\s*\n"
            r"C\)\s*(.*?)\s*\n"
            r"D\)\s*(.*?)\s*\n"
            r"\**Correct Answer:\**\s*([A-D])\)?\s*(.*)"
            )

            match = re.search(padrao, bloco.strip(), re.DOTALL)
            if match:
                pergunta, A, B, C, D, letra_correta, texto_correto = match.groups()
                questoes.append({
                    "pergunta": pergunta.strip(),
                    "alternativas": [
                        f"A) {A.strip()}",
                        f"B) {B.strip()}",
                        f"C) {C.strip()}",
                        f"D) {D.strip()}",
                    ],
                    "resposta_correta": letra_correta.strip(),
                })
        except Exception as e:
            print(f"Erro ao parsear questão: {e}")

    return questoes