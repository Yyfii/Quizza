import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { FiActivity, FiUsers } from "react-icons/fi";
import { RxBarChart, RxBookmark, RxBookmarkFilled, RxClock, RxPerson } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API;

const MAX_DESCRIPTION_LENGTH = 120;

const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

const ExploreQuiz = () => {
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [favoriteLoading, setFavoriteLoading] = useState({});
  const [stats, setStats] = useState({});
  const statsCache = useRef({});

  // Busca quizzes públicos
  const fetchSimulados = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/quizzes/public`, {
        withCredentials: true,
      });
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error("Erro ao buscar quizzes públicos:", error);
      return [];
    }
  }, []);

  // Busca favoritos do usuário
  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/favorites`, {
        withCredentials: true,
      });
      const favMap = {};
      if (Array.isArray(data.data)) {
        data.data.forEach((id) => (favMap[id] = true));
      }
      return favMap;
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      return {};
    }
  }, []);

  // Busca estatísticas do simulado, com cache para evitar múltiplas chamadas
  const fetchStatsForSimulado = useCallback(async (simuladoId) => {
    if (statsCache.current[simuladoId]) {
      return statsCache.current[simuladoId];
    }

    try {
      const { data } = await axios.get(`${API_BASE_URL}/quizzes/${simuladoId}/stats`, {
        withCredentials: true,
      });

      if (!data.success) throw new Error(data.error || "Erro ao buscar estatísticas");

      const result = {
        savedCount: data.data?.savedCount || 0,
        responsesCount: data.data?.responsesCount || 0,
        averageScore: Math.min(100, data.data?.averageScore || 0),
        totalCorrect: data.data?.totalCorrect || 0,
        totalQuestions: data.data?.totalQuestions || 0,
      };

      statsCache.current[simuladoId] = result;
      return result;
    } catch (error) {
      console.error(`Erro ao buscar estatísticas do simulado ${simuladoId}:`, error);
      return {
        savedCount: 0,
        responsesCount: 0,
        averageScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
      };
    }
  }, []);

  // Carrega simulados, favoritos e estatísticas na montagem
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [simuladosData, favoritesData] = await Promise.all([fetchSimulados(), fetchFavorites()]);
        setSimulados(simuladosData);
        setFavorites(favoritesData);

        // Busca estatísticas para todos
        const statsPromises = simuladosData.map((s) => fetchStatsForSimulado(s._id));
        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        simuladosData.forEach((s, i) => (statsMap[s._id] = statsResults[i]));
        setStats(statsMap);
      } catch (error) {
        toast.error("Erro ao carregar simulados");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [fetchSimulados, fetchFavorites, fetchStatsForSimulado]);

  const toggleFavorite = async (quizId) => {
    setFavoriteLoading((prev) => ({ ...prev, [quizId]: true }));
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/favorites/${quizId}/toggle`,
        {},
        { withCredentials: true }
      );

      setFavorites((prev) => ({ ...prev, [quizId]: !prev[quizId] }));
      toast.success(
        data.action === "added" ? "Adicionado aos favoritos" : "Removido dos favoritos"
      );
    } catch (error) {
      console.error("Erro ao alternar favorito:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Erro ao atualizar favorito");
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [quizId]: false }));
    }
  };

  // Controle para ver mais/menos descrição
  const [expandedIndex, setExpandedIndex] = useState(null);
  const toggleCard = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!loading && simulados.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center bg-slate-800 rounded-lg">
        <p className="text-xl text-slate-300 mb-4">Nenhum simulado público encontrado</p>
        <button
          onClick={() => navigate("/criar-simulado")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md"
        >
          Criar Novo Simulado
        </button>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simulados.map((simulado, index) => {
          const simuladoStats = stats[simulado._id] || {
            savedCount: 0,
            responsesCount: 0,
            averageScore: 0,
            totalCorrect: 0,
            totalQuestions: 0,
          };

          const fullText = simulado.description || "";
          const isExpanded = expandedIndex === index;
          const isLongText = fullText.length > MAX_DESCRIPTION_LENGTH;
          const displayText = isExpanded || !isLongText ? fullText : `${fullText.slice(0, MAX_DESCRIPTION_LENGTH)}...`;

          const chartData = {
            labels: ["Taxa de Acerto"],
            datasets: [
              {
                label: "Média de Acertos",
                data: [simuladoStats.averageScore],
                backgroundColor: "rgba(99, 102, 241, 0.7)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 1,
              },
            ],
          };

          const userIdLogado = localStorage.getItem("userId");
  
          const nomeExibido = simulado.userId?._id === userIdLogado
          ? "Você"
          : simulado.userId?.name || "Anônimo";

          return (
            
            <div
              key={simulado._id}
              className={`bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                isExpanded ? "transform scale-105" : ""
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-white mb-2">{simulado.title}</h3>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(simulado._id);
                    }}
                    disabled={favoriteLoading[simulado._id]}
                    className={`transition-colors ${
                      favorites[simulado._id]
                        ? "text-indigo-500 hover:text-indigo-400"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                    title={favorites[simulado._id] ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    {favoriteLoading[simulado._id] ? (
                      <div className="inline-block h-5 w-5 border-2 border-white/50 border-t-indigo-400 rounded-full animate-spin"></div>
                    ) : favorites[simulado._id] ? (
                      <RxBookmarkFilled size={20} />
                    ) : (
                      <RxBookmark size={20} />
                    )}
                  </button>
                </div>

                <div className="flex items-center text-slate-400 text-sm mb-3">
                  <RxClock className="mr-1" size={14} />
                  <span>
                    Criado em:{" "}
                    {simulado.createdAt && isValidDate(new Date(simulado.createdAt))
                      ? new Date(simulado.createdAt).toLocaleDateString("pt-BR")
                      : "Data inválida"}
                  </span>
                </div>

                <p className="text-slate-300 mb-4">
                  {displayText}
                  {isLongText && (
                    <button
                      onClick={() => toggleCard(index)}
                      className="text-indigo-400 hover:text-indigo-300 ml-1 text-sm"
                    >
                      {isExpanded ? "ver menos" : "ver mais..."}
                    </button>
                  )}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
                    {simulado.num_questions} questões
                  </span>
                  <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
                    Dificuldade {simulado.level}
                  </span>
                  <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
                   Gerado a partir de {simulado.source.toUpperCase()}
                  </span>
                  <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
                   {simulado.format}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-4 h-40">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              callback: (value) => `${value}%`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-slate-700/50 px-5 py-3">
                <div className="flex justify-between items-center text-sm text-slate-300">
                  <div className="flex items-center">
                    <RxPerson className="mr-1" size={16} />
                    <span>{nomeExibido}</span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex items-center" title="Salvos na lista">
                      <FiUsers className="mr-1" size={14} />
                      <span>{simuladoStats.savedCount.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center" title="Respondidos">
                      <FiActivity className="mr-1" size={14} />
                      <span>{simuladoStats.responsesCount.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center" title="Taxa de acerto">
                      <RxBarChart className="mr-1" size={14} />
                      <span>
                        {simuladoStats.averageScore.toFixed(1)}%
                        {simuladoStats.responsesCount > 0 && (
                          <span className="text-xs text-slate-400 ml-1">
                            ({simuladoStats.totalCorrect}/{simuladoStats.totalQuestions})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <button
                  onClick={() => navigate(`/quizzes/${simulado._id}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition flex items-center justify-center"
                >
                  <RxBarChart className="mr-2" size={18} />
                  {simulado.userId?._id === localStorage.getItem("userId")
                    ? "Gerenciar"
                    : "Responder"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreQuiz;
