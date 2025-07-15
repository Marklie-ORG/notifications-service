import Koa from "koa";
import koabodyparser from "koa-bodyparser";
import "dotenv/config";
import { HelloController } from "./lib/controllers/HelloController.js";
import {
  AuthMiddleware,
  CookiesMiddleware,
  Database,
  ErrorMiddleware,
  Log,
  PubSubWrapper,
  ValidationMiddleware,
} from "marklie-ts-core";
import { NotificationsService } from "./lib/services/NotificationsService.js";
import type {
  NotifyReportReadyMessage,
  NotifyChangeEmailMessage,
} from "marklie-ts-core/dist/lib/interfaces/PubSubInterfaces.js";

const app = new Koa();

const logger: Log = Log.getInstance().extend("service");
const database = await Database.getInstance();

logger.info("Database has connected!");

PubSubWrapper.subscribe<NotifyReportReadyMessage>(
  "notification-report-ready-sub",
  async (data: NotifyReportReadyMessage) => {
    logger.info(`Received message to topic notification-report-ready-sub`);

    await NotificationsService.sendReportIsReadyEmails(data);
  },
);

PubSubWrapper.subscribe<NotifyReportReadyMessage>(
  "notification-send-report-sub",
  async (data: NotifyReportReadyMessage) => {
    logger.info(`Received message to topic notification-send-report-sub`);

    await NotificationsService.sendReportToClients(data);
  },
);

PubSubWrapper.subscribe<NotifyChangeEmailMessage>(
  "notification-send-change-email-sub",
  async (data: NotifyChangeEmailMessage) => {
    logger.info(`Received message to topic notification-send-change-email-sub`);

    await NotificationsService.sendChangeEmailEmail(data);
  },
);

app.use(koabodyparser());
app.use(CookiesMiddleware);
app.use(AuthMiddleware());
app.use(ErrorMiddleware());
app.use(ValidationMiddleware());
app.use(koabodyparser());
app
  .use(new HelloController().routes())
  .use(new HelloController().allowedMethods());

const PORT = process.env.PORT || 3032;
app.listen(PORT, () => {
  logger.info(`Auth server is running at ${PORT}`);
});

process.on("SIGINT", async () => {
  logger.error("🛑 Gracefully shutting down...");
  await database.orm.close();
  process.exit(0);
});
