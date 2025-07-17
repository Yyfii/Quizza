import favoriteModel from "../models/favoriteModel.js";
import quizModel from "../models/quizModel.js";

export const toggleFavorite = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    // Verifique se o quiz existe
    const quiz = await quizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz não encontrado"
      });
    }

    // Verifique se já é favorito
    const existingFavorite = await favoriteModel.findOne({ userId, quizId });

    if (existingFavorite) {
      await favoriteModel.findByIdAndDelete(existingFavorite._id);
      return res.json({
        success: true,
        action: 'removed',
        message: "Quiz removido dos favoritos",
        data: null
      });
    } else {
      const newFavorite = await favoriteModel.create({ userId, quizId });
      return res.status(201).json({
        success: true,
        action: 'added',
        message: "Quiz adicionado aos favoritos",
        data: newFavorite
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: "Erro ao atualizar favoritos",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const favorites = await favoriteModel.find({ userId: req.user.id })
      .select('quizId userId') // Include both fields
      .lean(); // Convert to plain JavaScript object
    
    // Extract just the quizIds for the frontend
    const quizIds = favorites.map(fav => fav.quizId.toString());
    
    res.json({
      success: true,
      data: quizIds, // Now just sending an array of strings
      pagination: {
        total: favorites.length,
        page: 1,
        limit: favorites.length,
        totalPages: 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao buscar favoritos"
    });
  }
};

export const checkFavoriteStatus = async (req, res) => {
    try {
        const { quizId } = req.params;
        const favorite = await favoriteModel.findOne({
            userId: req.user.id,
            quizId
        });

        res.json({
            success: true,
            isFavorite: !!favorite,
            favoriteId: favorite?._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erro ao verificar status de favorito"
        });
    }
};
