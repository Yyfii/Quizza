## Gerador de Questões

### Prepare seu ambiente.

✅ 1. Crie e ative um ambiente virtual (opcional, mas recomendado)

```bash
python -m venv venv
source venv/bin/activate    # Linux/macOS
venv\Scripts\activate       # Windows
```

✅ 2. Instale as dependências

```bash
pip install flask flask-cors pydantic python-dotenv openai spacy pymupdf pillow
python -m spacy download pt_core_news_sm
```

✅ 3. Estrutura de pastas

```kotlin
seu-projeto/
├── app.py                ← seu backend Flask
├── utils/
│   └── gerar_questoes.py ← onde estão as funções do DeepSeek
├── .env                  ← sua chave da API (OPEN_API_KEY=...)
```

✅ 4. Arquivo .env
Crie um arquivo chamado .env com a sua chave da OpenRouter:

```ini
OPEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

✅ 5. Rodar o backend
No diretório onde está o app.py, execute:

```bash
python app.py
```

```csharp
 * Running on http://127.0.0.1:5000 (Press CTRL+C to quit)
```

## Não esqueça de iniciar os outros servidores (forntend e backend node)
