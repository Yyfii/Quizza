// responseController
import mongoose from "mongoose";
import responseModel from "../models/responseModel.js";

export const submitQuizResponse = async (req, res) => {
  const { respostas } = req.body;
  const { id: quizId } = req.params;
  const userId = req.user.id;

  try {
    const quiz = await quizModel.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Simulado não encontrado" });

    // Verificar tentativas anteriores
    const tentativasAnteriores = await responseModel.find({ 
      userId, 
      quizId 
    }).sort({ respondido_em: -1 });

    const numeroTentativa = tentativasAnteriores.length + 1;

    let acertos = 0;
    const respostaFormatada = quiz.questions.map((q, index) => {
      const resposta_usuario = respostas[index];
      const correta = resposta_usuario === q.resposta_correta;
      if (correta) acertos++;
      return {
        pergunta: q.pergunta,
        resposta_usuario,
        resposta_correta: q.resposta_correta,
        correta
      };
    });

    const novaResposta = await responseModel.create({
      userId,
      quizId,
      tentativa: numeroTentativa,
      respostas: respostaFormatada,
      acertos,
    });

    res.status(201).json({ 
      message: "Respostas salvas com sucesso", 
      resultado: novaResposta,
      tentativa: numeroTentativa 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar respostas do simulado" });
  }
};

export const getMinhasRespostas = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validação básica
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "ID de usuário inválido" });
    }

    const respostas = await responseModel.find({ userId })
      .populate({
        path: "quizId",
        select: "title questions", // Traz apenas campos necessários
        options: { lean: true } // Melhora performance
      })
      .sort({ respondido_em: -1 })
      .limit(100); // Limite para evitar sobrecarga

    if (!respostas.length) {
      return res.status(404).json({ 
        message: "Nenhuma resposta encontrada",
        suggestion: "Responda algum simulado para ver seu histórico"
      });
    }

    res.json(respostas);
  } catch (error) {
    console.error("Erro em getMinhasRespostas:", error);
    res.status(500).json({ 
      error: "Erro ao buscar respostas",
      ...(process.env.NODE_ENV === "development" && { details: error.message })
    });
  }
};