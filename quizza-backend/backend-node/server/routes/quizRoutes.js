//quizRoutes.js

import express from "express";
import {
    getMinhasRespostas,
    getPublicQuizzes,
    getQuizDetails,
    getQuizForResponse,
    getQuizStats,
    getUserQuizzes,
    getUserResponses,
    saveQuiz,
    searchQuizzes,
    submitQuizResponse,
    updateQuizVisibility
} from "../controllers/quizController.js";
import optionalAuth from '../middleware/optionalAuth.js';
import userAuth from "../middleware/userAuth.js";

const quizRouter = express.Router();

// Rotas GET específicas

quizRouter.get("/public", getPublicQuizzes);
quizRouter.get("/my-quizzes", userAuth, getUserQuizzes);
quizRouter.get("/respostas/minhas", userAuth, getUserResponses);
quizRouter.get("/respostas/limitadas", userAuth, getMinhasRespostas);
quizRouter.get("/responder/:id", userAuth, getQuizForResponse);
quizRouter.get("/:id/stats", getQuizStats);

quizRouter.put("/:id/visibility", userAuth, updateQuizVisibility);

// Rota POSTs
quizRouter.post("/", userAuth, saveQuiz);
quizRouter.get("/", userAuth, searchQuizzes);


quizRouter.post("/:id/responder", userAuth, submitQuizResponse);

// ⚠️ ESSA DEVE FICAR POR ÚLTIMO
quizRouter.get("/:id", optionalAuth, getQuizDetails);

export default quizRouter;