import Koa from "koa";
import koabodyparser from "koa-bodyparser";
import "dotenv/config";
import {
  AuthMiddleware,
  CookiesMiddleware,
  Database,
  ErrorMiddleware,
  Log,
  PubSubWrapper,
  SentryMiddleware,
  ValidationMiddleware,
} from "marklie-ts-core";
import { NotificationsService } from "./lib/services/NotificationsService.js";
import type {
  NotifyReportReadyMessage,
  NotifyChangeEmailMessage,
} from "marklie-ts-core/dist/lib/interfaces/PubSubInterfaces.js";
import {CommunicationWrapper} from "./lib/classes/CommunicationWrapper.js";

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
app.use(SentryMiddleware());
app.use(koabodyparser());

const PORT = process.env.PORT || 3032;
app.listen(PORT, () => {
  logger.info(`Auth server is running at ${PORT}`);
});

process.on("SIGINT", async () => {
  logger.error("🛑 Gracefully shutting down...");
  await database.orm.close();
  process.exit(0);
});
const base64Encoded = Buffer.from("Hello, world! This is a test attachment").toString("base64");
const communicationWrapper = new CommunicationWrapper("c068bf56-f694-4ecb-a297-dee664fae3c7");
await communicationWrapper.sendReportToClient(
    base64Encoded,
    "e552326a-7402-4db7-8be7-91b79382c611",
    "2ac793aa-693a-46d6-8fce-530b0decb23f",
);