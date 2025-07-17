import axios from "axios";
import "chart.js/auto";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { FiRefreshCw } from "react-icons/fi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";


const HistoricoRespostas = () => {
  const [respostas, setRespostas] = useState([]);
  const [filtroQuiz, setFiltroQuiz] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [detalhesAbertos, setDetalhesAbertos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    carregarRespostas();
  }, []);

  const carregarRespostas = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const { data } = await api.get("/respostas/minhas");

      if (!data || data.length === 0) {
      setErro("Nenhuma resposta encontrada");
      return;
    }

      setRespostas(data);
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao carregar histórico");
      toast.error("Falha ao buscar respostas");
    } finally {
      setCarregando(false);
    }
  };

  if (erro) {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-800 rounded-md text-center">
      <p className="text-red-400 mb-4">{erro}</p>
      <button 
        onClick={carregarRespostas}
        className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}

  const excluirTentativa = async (respostaId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/respostas/${respostaId}`,
        { withCredentials: true }
      );
      toast.success("Tentativa excluída com sucesso!");
      carregarRespostas();
    } catch (err) {
      toast.error("Erro ao excluir tentativa.");
    }
  };

  // Função para agrupar respostas por quiz
  const agruparRespostas = () => {
    const agrupadas = {};
    respostas.forEach((resposta) => {
      const quizId = resposta.quizId?._id;
      if (!quizId) return;

      if (!agrupadas[quizId]) agrupadas[quizId] = [];

      agrupadas[quizId].push(resposta);
    });

    // Ordena por data decrescente e limita as 3 tentativas mais recentes por quiz
    Object.keys(agrupadas).forEach((quizId) => {
      agrupadas[quizId].sort(
        (a, b) => new Date(b.respondido_em) - new Date(a.respondido_em)
      );
      agrupadas[quizId] = agrupadas[quizId].slice(0, 3);
    });

    return agrupadas;
  };

  // Agrupando respostas por quiz
  const respostasAgrupadas = agruparRespostas();

  // Juntando todas as respostas filtradas para exibir
  const respostasParaExibir = Object.values(respostasAgrupadas).flat();

  const respostasFiltradas = respostasParaExibir.filter((r) => {
    const correspondeQuiz = filtroQuiz ? r.quizId?.title === filtroQuiz : true;
    const correspondeData = filtroData
      ? new Date(r.respondido_em).toISOString().slice(0, 10) === filtroData
      : true;
    return correspondeQuiz && correspondeData;
  });

  respostasFiltradas.sort((a, b) => {
    if (a.quizId?.title < b.quizId?.title) return -1;
    if (a.quizId?.title > b.quizId?.title) return 1;
    return new Date(b.respondido_em) - new Date(a.respondido_em);
  });

  const respostasComTentativaCorrigida = respostasFiltradas.map((resposta) => {
    const mesmoQuiz = respostas.filter(
      (r) => r.quizId?._id === resposta.quizId?._id
    );
    const tentativaReal =
      mesmoQuiz
        .sort((a, b) => new Date(a.respondido_em) - new Date(b.respondido_em))
        .findIndex((r) => r._id === resposta._id) + 1;

    return { ...resposta, tentativaReal };
  });

  const quizzesUnicos = [...new Set(respostas.map((r) => r.quizId?.title))];

  // Prepara dados para o gráfico de evolução
  const chartDataEvolucao = {
    labels: ['1ª Tentativa', '2ª Tentativa', '3ª Tentativa'],
    datasets: Object.entries(respostasAgrupadas).map(([quizId, tentativas], index) => ({
      label: tentativas[0]?.quizId?.title || `Quiz ${index + 1}`,
      data: [null, null, null].map((_, i) => 
        tentativas[i]?.acertos || null
      ),
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
      borderColor: `hsla(${index * 60}, 70%, 50%, 1)`,
      borderWidth: 2,
      tension: 0.3,
      fill: false
    }))
  };

  // Prepara dados para o gráfico de desempenho ao longo do tempo
  const chartDataTimeline = {
    labels: respostasFiltradas.map(r => 
      new Date(r.respondido_em).toLocaleDateString()
    ),
    datasets: [{
      label: 'Acertos por tentativa',
      data: respostasFiltradas.map(r => r.acertos),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      pointBackgroundColor: respostasFiltradas.map(r => 
        r.tentativaReal === 1 ? '#4CAF50' : 
        r.tentativaReal === 2 ? '#FFC107' : '#FF5722'
      ),
      pointRadius: 6,
      tension: 0.1
    }]
  };

  const toggleDetalhes = (index) => {
    setDetalhesAbertos((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleResponderNovamente = (quizId) => {
    navigate(`/quizzes/${quizId}/responder`);
  };

  // Opções responsivas para os gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Acertos' }
      }
    },
    plugins: {
      legend: {
        position: window.innerWidth < 640 ? 'bottom' : 'top',
      }
    }
  };

  if (carregando) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-slate-800 text-white rounded-md flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-slate-800 text-white rounded-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Análise de Simulados Respondidos</h2>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filtroQuiz}
          onChange={(e) => setFiltroQuiz(e.target.value)}
          className="bg-slate-700 px-3 py-2 rounded w-full sm:w-auto"
        >
          <option value="">Todos os simulados</option>
          {quizzesUnicos.map((quiz, i) => (
            <option key={i} value={quiz}>
              {quiz}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="bg-slate-700 px-3 py-2 rounded w-full sm:w-auto"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-700 p-4 rounded h-64 sm:h-80">
          <h3 className="text-lg font-semibold mb-3">Evolução nas Tentativas</h3>
          <Line data={chartDataEvolucao} options={chartOptions} />
        </div>
        
        <div className="bg-slate-700 p-4 rounded h-64 sm:h-80">
          <h3 className="text-lg font-semibold mb-3">Desempenho ao Longo do Tempo</h3>
          <Line data={chartDataTimeline} options={chartOptions} />
        </div>
      </div>

      {/* Lista de respostas */}
      {respostasComTentativaCorrigida.length === 0 ? (
        <p className="text-center py-4">Nenhuma resposta encontrada com os filtros aplicados.</p>
      ) : (
        <ul className="space-y-4">
          {respostasComTentativaCorrigida.map((r, idx) => (
            <li key={idx} className="bg-slate-700 p-4 rounded shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-lg font-semibold">{r.quizId?.title}</p>
                  <p className="text-sm mb-2">
                    {r.tentativaReal}ª Tentativa • Respondido em: {new Date(r.respondido_em).toLocaleString()}
                  </p>
                  <p>
                    Acertos: <span className="font-bold">{r.acertos}</span> / {r.respostas.length} • 
                    Taxa de acerto: <span className="font-bold">{Math.round((r.acertos / r.respostas.length) * 100)}%</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-start sm:justify-end mt-3 sm:mt-0">
                  <button
                    onClick={() => handleResponderNovamente(r.quizId._id)}
                    className="bg-green-500 hover:bg-green-700 flex items-center gap-1 text-white text-xs sm:text-sm px-3 py-1.5 rounded transition cursor-pointer"
                  >
                    <FiRefreshCw size={14} />
                    Refazer
                  </button>
                  <button
                    onClick={() => excluirTentativa(r._id)}
                    className="bg-red-500 hover:bg-red-700 flex items-center gap-1 text-white text-xs sm:text-sm px-3 py-1.5 rounded transition cursor-pointer"
                  >
                    <RiDeleteBin6Fill size={14} />
                    Excluir
                  </button>
                  <button
                    onClick={() => toggleDetalhes(idx)}
                    className="bg-indigo-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-3 py-1.5 rounded transition cursor-pointer"
                  >
                    {detalhesAbertos[idx] ? "Ocultar" : "Detalhes"}
                  </button>
                </div>
              </div>

              {detalhesAbertos[idx] && (
                <ul className="mt-4 space-y-2 text-sm sm:text-base">
                  {r.respostas.map((resposta, i) => (
                    <li
                      key={i}
                      className={`p-3 rounded ${
                        resposta.correta ? "bg-green-600/30" : "bg-red-600/30"
                      } border ${
                        resposta.correta ? "border-green-500" : "border-red-500"
                      }`}
                    >
                      <p className="font-medium">
                        {i + 1}. {resposta.pergunta}
                      </p>
                      <p className="mt-1">
                        Sua resposta:{" "}
                        <span className="font-semibold">
                          {resposta.resposta_usuario}
                        </span>{" "}
                        {resposta.correta ? (
                          <span className="text-green-300">✓</span>
                        ) : (
                          <span className="text-red-300">✗</span>
                        )}
                      </p>
                      {!resposta.correta && (
                        <p className="mt-1">
                          Resposta correta:{" "}
                          <span className="font-semibold text-green-300">
                            {resposta.resposta_correta}
                          </span>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoricoRespostas;