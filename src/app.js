require('dotenv').config();
const pino = require('pino'); // 로거 (log.info => console.log와 같은 역할이나 더 안정적이고 좋음)
const express = require('express'); // express 서버
const { createServer } = require('http'); // http로 express랑 socket.io 서버 생성
const { Server } = require('socket.io'); // socket.io 서버

const logTransport = pino.transport({
  target: 'pino-pretty',
  options: { colorize: true },
}); // 이건 로그 이쁘게 만들어주는거

const log = pino({ name: 'Server' }, logTransport); // 로그를 남겨주는 애
const app = express(); // express 서버
const httpServer = createServer(app); // express 서버로 실제 서버 만든거
const io = new Server(httpServer); // 웹소켓 서버


io.on("connection", (socket) => {
  // 사용자가 연결 되었을 때 호출
  log.info('User connected!');

  // 1. 채팅방 들어갔을 때 담당하는 이벤트 리스너 등록
  socket.on("joinChatRoom", (roomID) => {
    log.info(`User joined to ${roomID}`);
    socket.join(roomID);
  });
  // 2. 채팅방 나갔을 때 담당하는 이벤트 리스너 등록
  socket.on("leaveChatRoom", (roomID) => {
    log.info(`User joined to ${roomID}`);
    socket.leave(roomID);
  });
  socket.on("message", (roomID, chatID) => {
    log.info(`Chat received ${chatID} from ${roomID}`);
    io.to(roomID).emit('message', chatID);
  })
  // 3. 그냥 사용자가 연결을 끊었을 때 담당하는 이벤트 리스너 등록
  socket.on("disconnect", () => {
    // 사용자가 연결을 끊었을 때 호출
    log.info('User disconnected.');
  });
});

log.info('Listening at 3000');
httpServer.listen(3000);