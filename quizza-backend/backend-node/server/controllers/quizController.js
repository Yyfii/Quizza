import mongoose from "mongoose";
import favoriteModel from "../models/favoriteModel.js";
import quizModel from "../models/quizModel.js";
import responseModel from "../models/responseModel.js";

// Quiz-related functions
export const saveQuiz = async (req, res) => {
  try {
    const {
      title,
      questions,
      num_questions,
      level,
      format,
      source,
      public: isPublic,
    } = req.body;

    const newQuiz = await quizModel.create({
      userId: req.user.id,
      title,
      questions,
      num_questions,
      level,
      format,
      source,
      public: isPublic || false,
    });

    res
      .status(201)
      .json({ message: "Simulado salvo com sucesso!", quizId: newQuiz._id });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar o simulado." });
  }
};

export const getUserQuizzes = async (req, res) => {
  try {
    // Verificação de autenticação
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Não autorizado",
      });
    }

    console.log("Buscando quizzes para o usuário:", req.user.id); // Log para debug

    const quizzes = await quizModel
      .find({ userId: req.user.id })
      .select("title description num_questions level format source public createdAt")
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    console.log("Quizzes encontrados:", quizzes.length); // Log para debug

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.error("Erro detalhado:", {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      error: "Erro ao buscar simulados",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getPublicQuizzes = async (req, res) => {
  try {
    const publicQuizzes = await quizModel
      .find({ public: true })
      .populate('userId', 'name')
      .select('-questions') // não retorna as questões por segurança
      .lean();

    res.json({success: true, data: publicQuizzes });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao buscar simulados públicos" });
  }
};

export const getQuizDetails = async (req, res) => {
  try {
    // 1. Validação do ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID do simulado inválido",
      });
    }

    // 2. Buscar o simulado com população correta
    const quiz = await quizModel.findById(req.params.id).populate({
      path: "userId",
      select: "_id name email",
      model: "User",
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Simulado não encontrado",
      });
    }

    // 3. Verificação de propriedade robusta
    let isOwner = false;
    if (req.user && quiz.userId) {
      isOwner = new mongoose.Types.ObjectId(req.user.id).equals(quiz.userId._id);
    }

    // Log para debug
    console.log("Verificação de acesso ao simulado:", {
      quizId: quiz._id.toString(),
      isPublic: quiz.public,
      quizOwner: quiz.userId?._id?.toString(),
      currentUser: req.user?.id?.toString() || "não autenticado",
      isOwner,
    });

    // 4. Verificar acesso para simulados privados
    if (!quiz.public && !isOwner) {
      return res.status(403).json({
        success: false,
        error: "Acesso não autorizado",
        details: "Este simulado é privado",
      });
    }

    // 5. Retornar o simulado
    res.json({
      success: true,
      data: {
        ...quiz.toObject(),
        isOwner
      },
    });
  } catch (error) {
    console.error("Erro no getQuizDetails:", {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      error: "Erro ao buscar simulado",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


export const getQuizForResponse = async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.params.id);
    if (!quiz)
      return res.status(404).json({ error: "Simulado não encontrado" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar simulado para resposta" });
  }
};

// Response-related functions
export const submitQuizResponse = async (req, res) => {
  try {
    const { respostas } = req.body;
    const { id: quizId } = req.params;
    const userId = req.user.id;

    const quiz = await quizModel.findById(quizId);
    if (!quiz)
      return res.status(404).json({ error: "Simulado não encontrado" });

    let acertos = 0;
    const respostaFormatada = quiz.questions.map((q, index) => {
      const resposta_usuario = respostas[index];
      const correta = resposta_usuario === q.resposta_correta;
      if (correta) acertos++;
      return {
        pergunta: q.pergunta,
        resposta_usuario,
        resposta_correta: q.resposta_correta,
        correta,
      };
    });

    const novaResposta = await responseModel.create({
      userId,
      quizId,
      respostas: respostaFormatada,
      acertos,
    });

    res.status(201).json({
      message: "Respostas salvas com sucesso",
      resultado: novaResposta,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar respostas do simulado" });
  }
};

export const getUserResponses = async (req, res) => {
  try {
    const respostas = await responseModel
      .find({ userId: req.user.id })
      .populate("quizId", "title")
      .sort({ respondido_em: -1 });
    res.json(respostas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar respostas do usuário." });
  }
};

export const getMinhasRespostas = async (req, res) => {
  try {
    const todasRespostas = await responseModel
      .find({ userId: req.user.id })
      .populate("quizId", "title")
      .sort({ respondido_em: -1 });

    const grouped = {};
    todasRespostas.forEach((r) => {
      const quizKey = r.quizId._id.toString();
      if (!grouped[quizKey]) grouped[quizKey] = [];
      if (grouped[quizKey].length < 2) grouped[quizKey].push(r);
    });

    const respostasLimitadas = Object.values(grouped).flat();
    res.json(respostasLimitadas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar respostas." });
  }
};

export const getQuizStats = async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({ success: false, error: "ID do simulado inválido" });
    }

    const quizObjectId = new mongoose.Types.ObjectId(quizId);

    const [savedCount, responseStats, quiz] = await Promise.all([
      favoriteModel.countDocuments({ quizId: quizObjectId }),
      responseModel.aggregate([
        { $match: { quizId: quizObjectId } },
        {
          $group: {
            _id: null,
            responsesCount: { $sum: 1 },
            totalCorrect: { $sum: "$acertos" },
          },
        },
      ]),
      quizModel.findById(quizObjectId).select("questions").lean(),
    ]);

    const stats = responseStats[0] || { responsesCount: 0, totalCorrect: 0 };
    const totalQuestions = quiz?.questions?.length || 0;

    const averageScore =
      stats.responsesCount > 0 && totalQuestions > 0
        ? Math.min(100, (stats.totalCorrect / (stats.responsesCount * totalQuestions)) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        savedCount,
        responsesCount: stats.responsesCount,
        totalCorrect: stats.totalCorrect,
        totalQuestions,
        averageScore: Math.round(averageScore * 10) / 10, // 1 casa decimal
      },
    });
  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao processar estatísticas",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


export const updateQuizVisibility = async (req, res) => {
  try {

    const { id } = req.params;
    const quiz = await quizModel.findById(id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Simulado não encontrado" });
    }

        // Verifica se o usuário logado é o dono do simulado 
    if (quiz.userId?.toString() !== req.user?.id?.toString()) {
      return res.status(403).json({ success: false, message: "Acesso negado" });
    }

    quiz.public = !quiz.public;
    await quiz.save();

    res.json({
      success: true,
      message: quiz.public ? "Simulado agora é público" : "Simulado agora é privado",
      data: {
        public: quiz.public,
      },
    });

    return res.status(200).json({ success: true, message: "Rota funcionando!", data: quiz });

  } catch (error) {
    console.error("Erro ao atualizar visibilidade:", error);
    res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Simulado não encontrado" });

    // Verifica se o usuário é o dono do simulado
    if (quiz.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    await quizModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Simulado excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir simulado" });
  }
};



export const searchQuizzes = async (req, res) => {
  const { search } = req.query;

  try {
    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const quizzes = await quizModel
      .find(filter)
      .select("quizId title description createdAt")
      .limit(20)          // limite para não sobrecarregar
      .sort({ createdAt: -1 });
    return res.json({success: true, data: quizzes});

  } catch (err) {
    return res.status(500).json({ error: "Falha ao pesquisar simulados." });
  }
};