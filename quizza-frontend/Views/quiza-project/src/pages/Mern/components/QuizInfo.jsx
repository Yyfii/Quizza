import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from '../../../services/api.js';

const QuizInfo = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const navigate = useNavigate();

  const handleResponder = () => {
    navigate(`/quizzes/${id}/responder`);
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // se estiver usando localStorage
        const { data: { data: quizData } } = await api.get(`/quizzes/${id}`);

        if (!quizData) {
          throw new Error("Simulado não encontrado");
        }

        setQuiz(quizData);

      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error(
          error.response?.data?.error || "Erro ao carregar o simulado"
        );
        navigate("/quiz-list"); // Redirect if error occurs
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center mt-20">
        <p>Simulado não encontrado</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-indigo-200 bg-slate-800 rounded-md shadow-md">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2 text-white">
            {quiz.title}
          </h1>
          <p className="mb-1">
            Criado por:{" "}
            {quiz.isOwner ? "Você" : quiz.userId?.name || "Desconhecido"}
          </p>
          <p>Data: {new Date(quiz.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAnswers((prev) => !prev)}
            className="text-sm text-white bg-yellow-600 hover:bg-yellow-700 px-4 py-1.5 rounded-full transition"
          >
            {showAnswers ? "Ocultar Respostas" : "Mostrar Respostas"}
          </button>
          <button
            onClick={handleResponder}
            className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition"
          >
            Responder Simulado
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions?.map((q, index) => (
          <div key={index} className="mb-6 p-4 bg-slate-700 rounded-lg">
            <strong className="block mb-3 text-lg">
              {index + 1}. {q.pergunta}
            </strong>
            <ul className="space-y-2">
              {q.alternativas?.map((alt, i) => {
                const letra = alt.charAt(0);
                const isCorrect = letra === q.resposta_correta;
                return (
                  <li
                    key={i}
                    className={`py-2 px-3 rounded transition ${
                      showAnswers && isCorrect
                        ? "bg-green-700 font-bold text-white"
                        : "bg-slate-600 hover:bg-slate-500"
                    }`}
                  >
                    {alt}
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
  );
};

export default QuizInfo;
