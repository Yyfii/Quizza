import express from "express";
import {
    checkFavoriteStatus,
    getUserFavorites,
    toggleFavorite
} from "../controllers/favoriteController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/:quizId/toggle", userAuth, toggleFavorite);
router.get("/:quizId/status", userAuth, checkFavoriteStatus);
router.get("/", userAuth, getUserFavorites);

export default router;