import { createServer } from 'http';
import { initializeSocketServer } from './backend/socket/socket';

const SOCKET_PORT = parseInt(process.env.SOCKET_PORT || '3002', 10);

const httpServer = createServer();

initializeSocketServer(httpServer);

httpServer
  .once('error', (err) => {
    console.error('Socket server error:', err);
    process.exit(1);
  })
  .listen(SOCKET_PORT, () => {
    console.log(`> Socket.IO server ready on http://localhost:${SOCKET_PORT}`);
  });