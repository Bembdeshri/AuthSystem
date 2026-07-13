import "dotenv/config";

import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log("=================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("=================================");
  });
}

startServer();