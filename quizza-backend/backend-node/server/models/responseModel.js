import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  tentativa: { type: Number, default: 1 }, // Adicionando campo para número da tentativa
  respostas: [
    {
      pergunta: String,
      resposta_usuario: String,
      resposta_correta: String,
      correta: Boolean,
    }
  ],
  acertos: { type: Number, required: true },
  respondido_em: { type: Date, default: Date.now }
});

const responseModel = mongoose.models.response || mongoose.model("response", responseSchema);

export default responseModel;