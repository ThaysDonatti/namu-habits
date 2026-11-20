
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { database } from './config/database';
import './models/Habit';
import './models/Checkin';


dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
import habitRoutes from './routes/habitRoutes';
import checkinRoutes from './routes/checkinRoutes';

app.use('/habits', habitRoutes);
app.use('/habits', checkinRoutes);

app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Namu Habits API funcionando!',
  });
});

const port = process.env.PORT || 3333;

const startServer = async () => {
  try {
    await database.authenticate();
    console.log('Conexão com MySQL realizada com sucesso!');

    await database.sync();
    console.log('Tabelas sincronizadas com sucesso!');

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error('Erro ao conectar com MySQL:', error);
  }
};

startServer();
