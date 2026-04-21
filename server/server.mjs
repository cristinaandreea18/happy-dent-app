import http from 'http';
import app from './app.mjs';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

let connectedUsers = {};

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
  },
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  const role = socket.handshake.query.role;
  console.log('Client connected:', socket.id);
  console.log('User ID:', socket.handshake.query.userId);
  console.log('Role:', socket.handshake.query.role);

  connectedUsers[userId] = socket.id;

  socket.on('doctorUpdateAppointment', async (data) => {
    const {
      patientId,
      appointmentId,
      newStatus,
      doctorName,
      appointmentDate,
      time,
    } = data;
    console.log('SOCKET: Doctor update received:', data);

    const patientSocketId = connectedUsers[patientId];
    console.log('SOCKET: Patient socket ID:', patientSocketId);

    if (patientSocketId) {
      io.to(patientSocketId).emit('patientAppointmentNotification', {
        appointmentId,
        status: newStatus,
        doctorName: doctorName,
        appointmentDate: appointmentDate,
        time: time,
        message: `Programarea ta înregistrată la doctorul ${doctorName}
         pentru ziua de ${appointmentDate} la ora ${time} a fost ${newStatus.toLowerCase()}`,
      });
    }
  });

  socket.on('disconnect', () => {
    delete connectedUsers[userId];
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
