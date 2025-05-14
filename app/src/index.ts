import Koa from "koa";
import koabodyparser from "koa-bodyparser";
import {HelloController} from "./lib/controllers/HelloController.js";
import {
  AuthMiddleware,
  CookiesMiddleware,
  Database,
  ErrorMiddleware,
  Log,
  PubSubWrapper,
  ValidationMiddleware
} from "markly-ts-core";
import {NotificationsService} from "./lib/services/NotificationsService.js";
import type {
  NotificationDataMessage,
  NotifyReportReadyMessage,
  NotifyChangeEmailMessage
} from "marklie-ts-core/dist/lib/interfaces/PubSubInterfaces.js";

const app = new Koa();

const logger: Log = Log.getInstance().extend("service");
const database = await Database.getInstance();

await database.orm.connect().then(() => {
  logger.info("Database has connected!");
});


PubSubWrapper.subscribe<NotifyReportReadyMessage>("notification-report-ready-sub", async (data: NotifyReportReadyMessage)=> {
  logger.info(`Received message to topic notification-report-ready-sub`);

  await NotificationsService.sendReportIsReadyEmails(data)
})

PubSubWrapper.subscribe<NotificationDataMessage>("notification-send-report-sub", async (data: NotificationDataMessage)=> {
  logger.info(`Received message to topic notification-send-report-sub`);

  await NotificationsService.sendReportToClients(data)
})

PubSubWrapper.subscribe<NotifyChangeEmailMessage>("notification-send-change-email-sub-sub", async (data: NotifyChangeEmailMessage)=> {
  logger.info(`Received message to topic notification-send-change-email-sub-sub`);

  await NotificationsService.sendChangeEmailEmail(data)
})

app.use(koabodyparser());
app.use(CookiesMiddleware);
app.use(AuthMiddleware());
app.use(ErrorMiddleware());
app.use(ValidationMiddleware());
app.use(koabodyparser());
app
    .use(new HelloController().routes())
    .use(new HelloController().allowedMethods());

app.listen(3032, () => {
  logger.info(`Auth server is running at ${3032}`);
});

process.on('SIGINT', async () => {
  logger.error('🛑 Gracefully shutting down...');
  await PubSubWrapper.shutdown();
  await database.orm.close();
  process.exit(0);
});