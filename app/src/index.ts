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

await NotificationsService.sendReportToClients({
    reportUrl: "gs://marklie-client-reports/report/0383e2ad-bee8-4253-afa9-2ae543d2195b-facebook-report-last_7d-2025-09-25.pdf",
    clientUuid: "0383e2ad-bee8-4253-afa9-2ae543d2195b",
    organizationUuid: "f0637dcb-b82e-423b-967a-a52eff651d28",
    reportUuid: "cc3cf39a-c4b8-484d-81de-388d407e6afa"
})