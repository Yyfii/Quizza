# Usa imagem base com Python
FROM python:3.11-slim

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do projeto para dentro do container
COPY . .

# Instala as dependências

RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download pt_core_news_sm

# Define a porta exposta (se seu app usar, ex: Flask)
EXPOSE 5000

# Comando para rodar a aplicação (ajuste se for diferente)
CMD ["python", "app.py"]
