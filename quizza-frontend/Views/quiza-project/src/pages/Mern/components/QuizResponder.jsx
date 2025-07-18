import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";

const QuizResponder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const API_BASE_URL = import.meta.env.VITE_API;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/quizzes/responder/${id}`,
          { withCredentials: true }
        );
        setQuiz(data);
      } catch (error) {
        console.error("Erro ao buscar simulado:", error);
        res
          .status(500)
          .json({ error: "Erro ao buscar simulado para resposta" });
      }
    };
    fetchQuiz();
  }, [id]);

  const handleChange = (qIndex, letra) => {
    setRespostas({ ...respostas, [qIndex]: letra });
  };

  const handleSubmit = async () => {
    let count = 0;
    quiz.questions.forEach((q, i) => {
      if (respostas[i] === q.resposta_correta) count++;
    });
    setAcertos(count);
    setEnviado(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/quizzes/${id}/responder`,
        {
          respostas,
        },
        { withCredentials: true }
      );

      toast.success("Respostas salvas!");
    } catch (err) {
      toast.error("Erro ao salvar respostas.");
    }
  };

  if (!quiz) return <p className="text-center mt-20">Carregando simulado...</p>;

  return (
    <Sidebar>
      <div className="p-6 max-w-3xl mx-auto text-indigo-200 bg-slate-800 rounded-md shadow-md">
        <h1 className="text-3xl font-semibold mb-4 text-white">
          Responder: {quiz.title}
        </h1>
        {quiz.questions.map((q, index) => (
          <div key={index} className="mb-6 p-4">
            <strong className="block mb-2">
              {index + 1}. {q.pergunta}
            </strong>
            <div className="space-y-2">
              {q.alternativas.map((alt, i) => {
                const letra = alt.charAt(0);
                const isSelected = respostas[index] === letra;
                const isCorrect = letra === q.resposta_correta;

                return (
                  <label
                    key={i}
                    className={`block p-2 rounded cursor-pointer 
                  ${
                    enviado
                      ? isCorrect
                        ? "bg-green-700 text-white font-bold"
                        : isSelected
                        ? "bg-red-700 text-white"
                        : "bg-slate-600"
                      : "bg-slate-600 hover:bg-slate-500"
                  }
                `}
                  >
                    <input
                      type="radio"
                      name={`pergunta-${index}`}
                      value={letra}
                      checked={isSelected}
                      onChange={() => handleChange(index, letra)}
                      className="mr-2"
                      disabled={enviado}
                    />
                    {alt}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
        {!enviado ? (
          <button
            onClick={handleSubmit}
            className="text-white bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded-full"
          >
            Enviar Respostas
          </button>
        ) : (
          <p className="mt-4 text-lg text-white">
            Você acertou {acertos} de {quiz.questions.length} questões.
          </p>
        )}
              {enviado && (
        <div className="mt-4 space-y-3">
          <button
            onClick={() => navigate("/analise")}
            className="text-white bg-indigo-600 hover:bg-indigo-800 px-4 py-2 rounded-full mr-3"
          >
            Ver Análise Detalhada
          </button>
          <button
            onClick={() => window.location.reload()} // Para tentar novamente
            className="text-white bg-gray-600 hover:bg-gray-800 px-4 py-2 rounded-full"
          >
            Tentar Novamente
          </button>
        </div>
      )}
      </div>
    </Sidebar>
  );
};

export default QuizResponder;
