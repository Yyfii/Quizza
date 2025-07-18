import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { FiActivity, FiUsers } from "react-icons/fi";
import { RxBarChart, RxClock, RxPerson } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API;

const ListItems = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Fetch favorite quizzes
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/favorites`, {
        withCredentials: true,
      });

      if (data.success && data.data.length > 0) {
        // Fetch details for each favorite quiz
        const quizzesData = await Promise.all(
          data.data.map(quizId => 
            axios.get(`${API_BASE_URL}/quizzes/${quizId}`, {
              withCredentials: true
            })
          )
        );
        
        const validQuizzes = quizzesData
          .filter(res => res.data.success)
          .map(res => res.data.data);

        setFavorites(validQuizzes);
        
        // Fetch stats for each quiz
        const statsPromises = validQuizzes.map(quiz => 
          axios.get(`${API_BASE_URL}/quizzes/${quiz._id}/stats`, {
            withCredentials: true
          })
        );
        
        const statsResults = await Promise.all(statsPromises);
        
        const statsMap = {};
        validQuizzes.forEach((quiz, index) => {
          statsMap[quiz._id] = statsResults[index].data.data || {
            savedCount: 0,
            responsesCount: 0,
            averageScore: 0
          };
        });
        
        setStats(statsMap);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Erro ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleCard = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };

  const removeFavorite = async (quizId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/favorites/${quizId}/toggle`,
        {},
        { withCredentials: true }
      );
      
      setFavorites(prev => prev.filter(quiz => quiz._id !== quizId));
      toast.success("Removido dos favoritos");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Erro ao remover dos favoritos");
    }
  };

  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const renderQuizCard = (quiz, index) => {
    const isExpanded = expandedIndex === index;
    const quizStats = stats[quiz._id] || {
      savedCount: 0,
      responsesCount: 0,
      averageScore: 0
    };

    const chartData = {
      labels: ["Taxa de Acerto"],
      datasets: [{
        label: "Média de Acertos",
        data: [quizStats.averageScore],
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1
      }]
    };

    return (
      <div key={quiz._id} className={`bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isExpanded ? "transform scale-105" : ""}`}>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
            <button
              onClick={() => removeFavorite(quiz._id)}
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              Remover
            </button>
          </div>
          
          <div className="flex items-center text-slate-400 text-sm mb-3">
            <RxClock className="mr-1" size={14} />
            <span>Criado em: {new Date(quiz.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
          
          <p className="text-slate-300 mb-4">
            {quiz.description?.length > 120 && !isExpanded 
              ? `${quiz.description.substring(0, 120)}...`
              : quiz.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
              {quiz.num_questions} questões
            </span>
            <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
              {quiz.level}
            </span>
            <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
              {quiz.format}
            </span>
            <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
              Gerado a partir de {quiz.source}
            </span>
          </div>
          
          {isExpanded && (
            <div className="mt-4">
              <div className="h-40">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true, max: 100 }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-slate-700/50 px-5 py-3">
          <div className="flex justify-between items-center text-sm text-slate-300">
            <div className="flex items-center">
              <RxPerson className="mr-1" size={16} />
              <span>{quiz.userId?.name || "Autor desconhecido"}</span>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center" title="Salvos na lista">
                <FiUsers className="mr-1" size={14} />
                <span>{quizStats.savedCount?.toLocaleString("pt-BR") || 0}</span>
              </div>
              <div className="flex items-center" title="Respondidos">
                <FiActivity className="mr-1" size={14} />
                <span>{quizStats.responsesCount?.toLocaleString("pt-BR") || 0}</span>
              </div>
              <div className="flex items-center" title="Taxa de acerto">
                <RxBarChart className="mr-1" size={14} />
                <span>{quizStats.averageScore?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5 pt-0">
          <button
            onClick={() => navigate(`/quizzes/${quiz._id}`)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition flex items-center justify-center"
          >
            <RxBarChart className="mr-2" size={18} />
            Ver Detalhes
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return renderLoading();
  }

  if (!loading && favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <h3 className="text-xl text-white mb-4">
            Você ainda não favoritou nenhum simulado
          </h3>
          <button
            onClick={() => navigate("/explorar")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md"
          >
            Explorar Simulados
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((quiz, index) => renderQuizCard(quiz, index))}
      </div>
    </div>
  );
};

export default ListItems;