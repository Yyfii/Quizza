import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    }
}, { timestamps: true });

// Índice para melhor performance
favoriteSchema.index({ quizId: 1 });
favoriteSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);