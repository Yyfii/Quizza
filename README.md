# 🧠 Quizza

O **Quizza** é uma plataforma interativa para geração e resolução de simulados com suporte à Inteligência Artificial. O sistema permite a criação de simulados personalizados, geração automática de questões a partir de arquivos PDF ou Word, visualização de estatísticas de desempenho e muito mais.

## 🚀 Tecnologias Utilizadas

O projeto é dividido em três partes:

| Módulo              | Tecnologias                                             |
| ------------------- | ------------------------------------------------------- |
| Frontend            | React, TailwindCSS, Axios, React Router DOM, Chart.js   |
| Backend (API REST)  | Node.js, Express, MongoDB, Mongoose, JWT                |
| Gerador de Questões | Python, Flask, spaCy, PyMuPDF, OpenRouter (DeepSeek R1) |

---

## 📁 Estrutura do Projeto

```
Quizza/
├── quizza-backend/ # Node.js API (Simulados, Usuários, Autenticação)
│ ├── backend-node/
│ ├── Quiz-Generator/
├── frontend/ # Interface do Usuário (React)
```

---

## ⚙️ Como Rodar o Projeto

### 🧩 1. Clonar o Repositório

```bash
git clone https://github.com/Yyfii/Quizza.git
cd Quizza
```

### 📦 2. Iniciar o Backend Node

- Configure o backend-node/.env

```
MONGODB_URL=mongodb+srv://<user>:<cluster>.mongodb.net
JWT_SECRET=secret#text
NODE_ENV=development

# BREVO ENVS - você tem que criar uma conta no brevo
SMTP_USER=user@smtp-brevo.com
SMTP_PASS=pass
SENDER_EMAIL=email
SMTP_HOST=smtp-relay-offshore-southamerica-east-v2.sendinblue.com

#FRONTEND_URL
FRONTEND_URL=http://localhost:5173
PORT=4000

```

```bash

cd backend/backend-node
npm install
# Para ativar o ambiente virtual do Node no Windows
venv\Scripts\activate
node --watch server.js

```

### 🧪 3. Iniciar o Gerador de Questões (Python + Flask)

- Configure o Quiz-Generator/.env

```
# gpt-3.5-turbo
OPEN_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

```

```bash

cd ..
cd Quiz-Generator
python -m venv venv
# Ativar ambiente virtual:
source venv/bin/activate    # Linux/macOS
venv\Scripts\activate       # Windows

# Instalar dependências:
pip install flask flask-cors pydantic python-dotenv openai spacy pymupdf pillow
python -m spacy download pt_core_news_sm

# Criar o arquivo .env com sua chave da OpenRouter:
echo OPEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx > .env

# Rodar servidor Flask:
python app.py
```

### 💻 4. Iniciar o Frontend (React)

```bash

cd ../frontend/quizza-project
npm install
npm run dev

```

#### ✨ Funcionalidades

- Autenticação de usuários com JWT

- Criação e visualização de simulados

- Geração de questões por IA (DeepSeek/OpenRouter)

- Upload de arquivos (PDF) para gerar questões

- Gráficos com desempenho do usuário

- Histórico de respostas

#### 📌 Observações

O projeto requer uma chave de API da OpenRouter para funcionar corretamente o gerador de questões.

O backend Node se conecta a um banco MongoDB – configure a string de conexão no seu .env (não incluído por segurança).
