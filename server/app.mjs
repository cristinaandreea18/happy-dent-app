import express from 'express';
import routers from './routers/index.mjs';
import cors from 'cors';

const app = express();
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://c9f130eed165.ngrok-free.app',
  ],
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

//routers
app.use('/auth', routers.auth);
app.use('/user', routers.user);
app.use('/doctor', routers.doctor);
app.use('/admin', routers.admin);

export default app;
