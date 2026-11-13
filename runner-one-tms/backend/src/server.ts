import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Runner One TMS Back-end rodando na porta ${PORT} [Ambiente: ${env.NODE_ENV}]`);
});