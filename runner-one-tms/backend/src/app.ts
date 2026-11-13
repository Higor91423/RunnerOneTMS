import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rota de Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', system: 'Runner One TMS API', timestamp: new Date() });
});

// Rotas da API
app.use('/api', routes);

// Middleware Global de Erros
app.use(errorMiddleware);