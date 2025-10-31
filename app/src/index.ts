import Koa from "koa";
import "dotenv/config";
import {
  Database,
  Log,
  PubSubWrapper,
} from "marklie-ts-core";
import {applyMiddlewares} from "./middlewares.js";
import {subscriptions} from "./subscriptions.js";

const app = new Koa();
const logger: Log = Log.getInstance().extend("service");

const database = await Database.getInstance();
applyMiddlewares(app)
logger.info("Database connected and entities loaded!");

for (const [topic, handler] of subscriptions) {
    PubSubWrapper.subscribe(topic, handler);
}

const PORT = process.env.PORT || 3032;
app.listen(PORT, () => {
  logger.info(`Notifications service is running at ${PORT}`);
});

process.on("SIGINT", async () => {
  logger.error("🛑 Gracefully shutting down...");
  await database.orm.close();
  process.exit(0);
});
