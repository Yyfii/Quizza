import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  questions: [{
    pergunta: String,
    alternativas: [String],
    resposta_correta: String,
    resposta_correta_texto: String
  }],
  num_questions: Number,
  level: String,
  format: String,
  source: String,
  public: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Adicione índices para melhor performance
quizSchema.index({ userId: 1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ public: 1, createdAt: -1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;