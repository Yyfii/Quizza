// userAuth.js
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const userAuth = async (req, res, next) => {
  try {
    // 1. Obter token de cookies ou headers
    const token = req.cookies?.token || 
                 req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Buscar usuário no banco de dados
    const user = await userModel.findById(decoded.id)
      .select('_id name email isAccountVerified');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // 4. Anexar usuário à requisição
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAccountVerified: user.isAccountVerified
    };

    next();

  } catch (error) {
    console.error('Erro na autenticação:', error.message);

    // Tratamento específico para erros JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro na autenticação'
    });
  }
};

export default userAuth;