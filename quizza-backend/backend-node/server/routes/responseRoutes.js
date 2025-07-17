import express from "express";
import { getMinhasRespostas } from "../controllers/responseController.js";
import userAuth from "../middleware/userAuth.js";
import responseModel from "../models/responseModel.js";

const responseRouter = express.Router();

responseRouter.get("/minhas", userAuth, getMinhasRespostas);

responseRouter.delete("/:id", userAuth, async (req, res) => {
  try {
    const resposta = await responseModel.findByIdAndDelete(req.params.id);
    if (!resposta) return res.status(404).json({ error: "Resposta não encontrada" });
    res.json({ message: "Tentativa excluída com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir tentativa" });
  }
});
export default responseRouter;