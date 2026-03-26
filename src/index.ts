import app from "./app";
import { db } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";

async function startServer(): Promise<void> {
  await db.getConnection().then((connection) => connection.release());

  app.listen(env.port, () => {
    logger.info({ message: `Server listening on port ${env.port}` });
  });
}

startServer().catch((error: Error) => {
  logger.error({ message: error.message, stack: error.stack });
  process.exit(1);
});
