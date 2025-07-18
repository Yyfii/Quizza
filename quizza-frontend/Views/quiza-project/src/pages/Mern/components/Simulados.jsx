import axios from "axios";
import "chart.js/auto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { FiActivity, FiUsers } from "react-icons/fi";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import {
  RxBarChart,
  RxBookmark,
  RxBookmarkFilled,
  RxClock,
  RxPerson,
} from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

const MAX_DESCRIPTION_LENGTH = 120;

const API_BASE_URL = import.meta.env.VITE_API;

const Simulados = () => {
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [favoriteLoading, setFavoriteLoading] = useState({});
  const [initialFavoritesLoading, setInitialFavoritesLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const statsCache = useRef({});

  // Function to check user's favorites
  const checkFavorites = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/favorites`, {
        withCredentials: true,
      });

      // Create a mapping of quizIds to true
      const favoritesMap = {};
      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((quizId) => {
          favoritesMap[quizId] = true;
        });
      }

      setFavorites(favoritesMap);
    } catch (error) {
      console.error("Error checking favorites:", error);
      if (error.response?.status !== 401) {
        toast.error("Erro ao carregar favoritos");
      }
    }
  }, []);

  // Function to toggle favorite status
  const toggleFavorite = async (quizId) => {
    setFavoriteLoading((prev) => ({ ...prev, [quizId]: true }));
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/favorites/${quizId}/toggle`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Atualização otimista
      setFavorites((prev) => ({
        ...prev,
        [quizId]: !prev[quizId],
      }));

      // Recarrega as estatísticas
      const updatedStats = await fetchStatsForSimulado(quizId);
      setStats((prev) => ({
        ...prev,
        [quizId]: updatedStats,
      }));

      toast.success(
        data.action === "added"
          ? "Adicionado aos favoritos!"
          : "Removido dos favoritos"
      );
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
      toast.error(error.response?.data?.error || "Erro ao atualizar");
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [quizId]: false }));
    }
  };
  // Fetch user´s quizzes
  const fetchSimulados = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/quizzes/my-quizzes`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (!data.success) {
        throw new Error(data.error || "Resposta inesperada do servidor");
      }

      // Ensure we always return an array
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error("Erro detalhado ao buscar quizzes:", error);

      // Return empty array instead of throwing error to prevent UI crash
      return [];
    }
  }, []);
  // fetch quiz statistics
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


  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setInitialFavoritesLoading(true);

        const [simuladosData] = await Promise.all([
          fetchSimulados(),
          checkFavorites(), // Load favorites in parallel
        ]);

        setSimulados(simuladosData);

        // Busca estatísticas para todos
        const statsPromises = simuladosData.map((s) => fetchStatsForSimulado(s._id));
        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        simuladosData.forEach((s, i) => (statsMap[s._id] = statsResults[i]));
        setStats(statsMap);

      } catch (error) {
        toast.error(error.message);
      } finally {
        setInitialFavoritesLoading(false);
        setLoading(false);
      }
    };

    loadData();
  }, [fetchSimulados, fetchStatsForSimulado, checkFavorites]);

  useEffect(() => {
    const interval = setInterval(() => {
      simulados.forEach(async (simulado) => {
        const stats = await fetchStatsForSimulado(simulado._id);
        setStats((prev) => ({ ...prev, [simulado._id]: stats }));
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [simulados, fetchStatsForSimulado]);

  // toggle card expansion
  const toggleCard = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleToggleVisibility = async (quizId, currentStatus) => {
    try {
      const token = localStorage.getItem("token"); // ou a forma que você está guardando o JWT
      const { data } = await axios.put(
        `${API_BASE_URL}/quizzes/${quizId}/visibility`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!token) {
        toast.error("Você precisa estar logado para alterar a visibilidade");
        return;
      }

      if (data.success) {
        setSimulados((prev) =>
          prev.map((quiz) =>
            quiz._id === quizId ? { ...quiz, public: data.data.public } : quiz
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message || "Erro ao alterar visibilidade");
      }
    } catch (error) {
      console.error(
        "Erro ao alternar visibilidade:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Erro ao alterar visibilidade"
      );
    }
  };

  // loading component
  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  // Render individual quiz card
  const renderSimuladoCard = (simulado, index) => {
    const fullText = simulado.description || "";
    const isExpanded = expandedIndex === index;
    const isLongText = fullText.length > MAX_DESCRIPTION_LENGTH;
    const displayText =
      isExpanded || !isLongText
        ? fullText
        : `${fullText.slice(0, MAX_DESCRIPTION_LENGTH)}...`;

    const simuladoStats = stats[simulado._id] || {
      savedCount: 0,
      responsesCount: 0,
      averageScore: 0,
      totalCorrect: 0,
      totalQuestions: 0,
    };

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
    

    return (
      <div
        key={simulado._id}
        className={`bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
          isExpanded ? "transform scale-105" : ""
        }`}
      >
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-white mb-2">
              {simulado.title}
            </h3>
            <div className="flex items-center space-x-2">
              {/* Botão de favorito */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(simulado._id);
                }}
                disabled={
                  favoriteLoading[simulado._id] || initialFavoritesLoading
                }
                className={`${
                  favorites[simulado._id] ? "text-indigo-500" : "text-slate-400"
                } hover:text-indigo-400 transition-colors`}
                title={
                  favorites[simulado._id]
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
              >
                {favoriteLoading[simulado._id] || initialFavoritesLoading ? (
                  <div className="inline-block h-5 w-5 border-2 border-white/50 border-t-indigo-400 rounded-full animate-spin"></div>
                ) : favorites[simulado._id] ? (
                  <RxBookmarkFilled size={20} />
                ) : (
                  <RxBookmark size={20} />
                )}
              </button>

              {/* Botão de visibilidade - só mostra se for dono */}
              {userId &&
                simulado.userId &&
                userId === simulado.userId._id?.toString() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(simulado._id, simulado.public);
                    }}
                    className={`inline-block h-5 w-5 `}
                    title={
                      simulado.public ? "Tornar privado" : "Tornar público"
                    }
                  >
                    {simulado.public ? (
                      <MdVisibility className="text-indigo-400" size={20} />
                    ) : (
                      <MdVisibilityOff className="text-sky-200" size={20} />
                    )}
                  </button>
                )}
            </div>
          </div>
          <div className="flex items-center text-slate-400 text-sm mb-3">
            <RxClock className="mr-1" size={14} />
            <span>
              Criado em:{" "}
              {simulado.createdAt
                ? isValidDate(new Date(simulado.createdAt))
                  ? new Date(simulado.createdAt).toLocaleDateString("pt-BR")
                  : "Data inválida"
                : "Data não disponível"}
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
              {simulado.level}
            </span>
            <span className="bg-slate-700 text-indigo-300 px-3 py-1 rounded-full text-xs">
              {simulado.format}
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
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function (value) {
                            return value + "%";
                          },
                        },
                      },
                    },
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
              <span>{simulado.userId?.name || "Você"}</span>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center" title="Salvos na lista">
                <FiUsers className="mr-1" size={14} />
                <span>
                  {simuladoStats.savedCount?.toLocaleString("pt-BR") || 0}
                </span>
              </div>
              <div className="flex items-center" title="Respondidos">
                <FiActivity className="mr-1" size={14} />
                <span>
                  {simuladoStats.responsesCount?.toLocaleString("pt-BR") || 0}
                </span>
              </div>
              <div className="flex items-center" title="Taxa de acerto">
                <RxBarChart className="mr-1" size={14} />
                <span>
                  {simuladoStats.averageScore?.toFixed(1) || 0}%
                  {simuladoStats.responsesCount > 0 && (
                    <span className="text-xs text-slate-400 ml-1">
                      ({simuladoStats.totalCorrect || 0}/
                      {simuladoStats.totalQuestions || 0})
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
            Ver Detalhes
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return renderLoading();
  }

  if (!loading && simulados.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <h3 className="text-xl text-white mb-4">
            Você ainda não criou nenhum simulado
          </h3>
          <button
            onClick={() => navigate("/new-quiz")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md"
          >
            Criar Primeiro Simulado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simulados.map((simulado, index) =>
          renderSimuladoCard(simulado, index)
        )}
      </div>
    </div>
  );
};

export default Simulados;
