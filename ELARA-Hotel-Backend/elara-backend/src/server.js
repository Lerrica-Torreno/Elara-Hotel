// Load environment configuration before initializing the API and database client.
import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './config/prisma.js';

const port = Number(process.env.PORT || 8000);

// Start the HTTP listener on the configured port (8000 by default).
const server = app.listen(port, () => {
  console.log(`ELARA API listening on http://localhost:${port}`);
});

async function shutdown(signal) {
  // Stop accepting requests before closing the database connection cleanly.
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

// Gracefully close the API for terminal interrupts and operating-system shutdowns.
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
