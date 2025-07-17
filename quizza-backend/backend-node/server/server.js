import cookieParser from "cookie-parser";
import cors from "cors";
import 'dotenv/config';
import express from "express";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import favoriteRouter from './routes/favoriteRoutes.js'; // Novo router para favoritos
import quizRouter from './routes/quizRoutes.js';
import responseRouter from './routes/responseRoutes.js';
import userRouter from './routes/userRoutes.js';
const app = express();
const port = process.env.PORT || 4000;

// Conexão com o banco de dados
connectDB();

// Configurações de CORS

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// API Endpoints
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/quizzes', quizRouter);
app.use('/api/respostas', responseRouter);
app.use('/api/favorites', favoriteRouter);

// Rota raiz
app.get('/', (req, res) => res.send("QuizMaster API - Documentation available at /api/docs"));

// Tratamento de erros 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});