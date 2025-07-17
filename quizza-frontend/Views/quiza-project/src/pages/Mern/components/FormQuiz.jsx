import axios from "axios";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormQuiz = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const contentRef = useRef(null);

  // Campos do formulário
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState(3);
  const [level, setLevel] = useState("média");
  const [format, setFormat] = useState("múltipla-escolha");

  // Controlar respostas
  const [showAnswers, setShowAnswers] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setQuestions([]);
    toast.dismiss();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("num_questions", numQuestions);
    formData.append("level", level);
    formData.append("format", format);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      console.log("🐛 Dados recebidos do backend:", response.data.questions);

      const questionsFromApi = response.data.questions;

      if (Array.isArray(questionsFromApi) && questionsFromApi.length > 0) {
        setQuestions(questionsFromApi);
        toast.success("Simulado gerado com sucesso!", {
          toastId: "simulado-success",
        });
      } else {
        toast.error(
          "Nenhuma questão foi gerada. Verifique o conteúdo do PDF.",
          {
            toastId: "simulado-error",
          }
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar o PDF ou gerar questões.", {
        toastId: "upload-error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (contentRef.current) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Simulado</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; background: white; color: #111; }
              h2 { text-align: center; }
              .question { margin-bottom: 30px; }
              .question strong { display: block; margin-bottom: 10px; }
              ul { list-style: none; padding: 0; }
              li { margin-bottom: 5px; padding-left: 10px; }
            </style>
          </head>
          <body>
            <h2>${title || "Simulado Gerado"}</h2>
            ${contentRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleReset = () => {
    setFile(null);
    setQuestions([]);
    toast.info("Simulado reiniciado.", { toastId: "simulado-info" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-0">
      <div className="bg-slate-900 p-10 rounded-lg shadow-xl w-full sm:w-[700px] text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-6">
          Gerar Simulado com PDF
        </h2>

        {questions.length === 0 && (
          <form onSubmit={onSubmitHandler} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-1">
                  Título do Simulado:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Simulado História - Capítulo 3"
                  className="w-full px-4 py-2 rounded-md bg-[#333A5C] text-white outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-white mb-1">
                  Número de Questões:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 rounded-md bg-[#333A5C] text-white outline-none"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-white mb-1">
                  Nível de Dificuldade:
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#333A5C] text-white outline-none"
                >
                  <option value="fácil">Fácil</option>
                  <option value="média">Média</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-1">Formato:</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#333A5C] text-white outline-none"
                >
                  <option value="múltipla-escolha">Múltipla Escolha</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-1">Selecionar PDF:</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="bg-[#333A5C] w-full px-4 py-2 rounded-md text-white cursor-pointer outline-none"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>
            {questions.length === 0 && (
              <button
                type="submit"
                disabled={!file || loading}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 cursor-pointer text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Gerando..." : "Enviar PDF"}
              </button>
            )}
          </form>
        )}

        {questions.length > 0 && (
          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white text-xl font-semibold">
                Questões Geradas:
              </h3>
              <div className="space-x-2">
                <button
                  onClick={handleExport}
                  className="text-sm text-white bg-indigo-600 hover:bg-indigo-800 px-4 py-1.5 rounded-full"
                >
                  Baixar
                </button>
                <button
                  onClick={handleReset}
                  className="text-sm text-white bg-red-600 hover:bg-red-800 px-4 py-1.5 rounded-full"
                >
                  Novo Simulado
                </button>

                {/* Butão de ocultar respostas */}
                <button
                  onClick={() => setShowAnswers((prev) => !prev)}
                  className="text-sm text-white bg-yellow-600 hover:bg-yellow-800 px-4 py-1.5 rounded-full"
                >
                  {showAnswers ? "Ocultar Respostas" : "Mostrar Respostas"}
                </button>

                <button
                  onClick={async () => {
                    try {
                      const { data } = await axios.post(
                        "http://localhost:4000/api/quizzes", // Removed "/save" from the endpoint
                        {
                          title,
                          questions,
                          num_questions: numQuestions,
                          level,
                          format,
                          source: "pdf",
                          public: false,
                        },
                        {
                          withCredentials: true,
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );
                      toast.success("Simulado salvo com sucesso!");
                    } catch (e) {
                      console.error("Error saving quiz:", e);
                      toast.error(
                        e.response?.data?.error || "Erro ao salvar simulado."
                      );
                    }
                  }}
                  className="text-sm text-white bg-blue-600 hover:bg-blue-800 px-4 py-1.5 rounded-full"
                >
                  Salvar Simulado
                </button>
              </div>
            </div>

            <div
              ref={contentRef}
              className="bg-slate-900 text-indigo-300 p-6 rounded-xl shadow-xl space-y-6"
            >
              {questions.map((q, index) => (
                <div key={index} className="question">
                  <strong className="text-base">
                    {index + 1}. {q.pergunta}
                  </strong>
                  <ul className="ml-4 mt-2">
                    {q.alternativas.map((alt, i) => {
                      const letra = alt.charAt(0);
                      const isCorrect = letra === q.resposta_correta;
                      return (
                        <li
                          key={i}
                          className={`py-1 px-2 border rounded mb-1 cursor-pointer ${
                            showAnswers && isCorrect
                              ? "bg-green-700 text-white font-bold"
                              : "border-indigo-500 hover:bg-indigo-700"
                          }`}
                        >
                          {alt}{" "}
                          {showAnswers && isCorrect && (
                            <span className="ml-2">✓</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormQuiz;
