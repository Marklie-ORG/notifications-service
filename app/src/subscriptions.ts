import { NotificationsService } from "lib/services/NotificationsService";
import {
  Log,
  type NotifyChangeEmailMessage,
  type NotifyClientAccessRequestedMessage,
  type NotifyClientAccessTokenMessage,
  type NotifyReportReadyMessage,
} from "marklie-ts-core";

const logger: Log = Log.getInstance().extend("subscriptions");

export const subscriptions: [string, (data: any) => Promise<void>][] = [
    [
        "notification-report-ready-sub",
        async (data: NotifyReportReadyMessage) => {
            logger.info(`Received message on notification-report-ready-sub`);
            await NotificationsService.sendReportIsReadyEmails(data);
        },
    ],
    [
        "notification-send-report-sub",
        async (data: NotifyReportReadyMessage) => {
            logger.info(`Received message on notification-send-report-sub`);
            await NotificationsService.sendReportToClients(data);
        },
    ],
    [
        "notification-send-change-email-sub",
        async (data: NotifyChangeEmailMessage) => {
            logger.info(`Received message on notification-send-change-email-sub`);
            await NotificationsService.sendChangeEmailEmail(data);
        },
    ],
    [
        "notification-send-client-access-email-sub",
        async (data: NotifyClientAccessTokenMessage) => {
            logger.info(`Received message on notification-send-client-access-email-sub`);
            await NotificationsService.sendClientAccessTokenEmail(data);
        },
    ],
    [
        "notification-client-access-requested-sub",
        async (data: NotifyClientAccessRequestedMessage) => {
            logger.info(`Received message on notification-client-access-requested-sub`);
            await NotificationsService.sendClientAccessRequestedEmail(data);
        },
    ],
];