import type {
  NotifyChangeEmailMessage,
  NotifyReportReadyMessage,
} from "marklie-ts-core/dist/lib/interfaces/PubSubInterfaces.js";
import {
  Database,
  GCSWrapper,
  Log,
  Organization,
} from "marklie-ts-core";
import { CommunicationWrapper } from "../classes/CommunicationWrapper.js";
import { ActivityLog } from "marklie-ts-core/dist/lib/entities/ActivityLog.js";
import {sendGridService} from "marklie-ts-core/dist/lib/services/SendgridService.js";

const logger: Log = Log.getInstance().extend("notifications-service");
const database = await Database.getInstance();

export class NotificationsService {
  private static readonly gcs = GCSWrapper.getInstance("marklie-client-reports");

  public static async sendReportToClients(data: NotifyReportReadyMessage): Promise<void> {
    try {
      const report = await this.gcs.getReport(data.reportUrl);
      const communicationWrapper = new CommunicationWrapper(data.clientUuid);
      await communicationWrapper.sendReportToClient(report, data.reportUuid, data.organizationUuid);
    } catch (err) {
      logger.error("Failed to send report to clients:", err);
    }
  }

  public static async sendReportIsReadyEmails(data: NotifyReportReadyMessage): Promise<void> {
    const organization = await database.em.findOne(
        Organization,
        { uuid: data.organizationUuid },
        { populate: ["members.user"] }
    );

    if (!organization) {
      logger.error(`Organization with UUID ${data.organizationUuid} not found.`);
      return;
    }

    try {
      const report = await this.gcs.getReport(data.reportUrl);
      const members = organization.members.getItems();

      for (const member of members) {
        const user = member.user;

        try {
          await sendGridService.sendReportEmail(
              {
                to: user.email,
                subject: "Your Report Is Ready!",
                text: "We’ve completed your report and it is now ready for review.",
              },
              report
          );

          const log = database.em.create(ActivityLog, {
            organization: organization.uuid,
            action: "report_ready_sent",
            targetType: "report",
            targetUuid: data.reportUuid,
            client: data.clientUuid,
            actor: "system",
            metadata: { email: user.email },
          });

          await database.em.persistAndFlush(log);
        } catch (emailError) {
          logger.error(`Failed to notify user ${user.email}:`, emailError);
        }
      }
    } catch (reportError) {
      logger.error("Failed to fetch report for email notifications:", reportError);
    }
  }

  public static async sendChangeEmailEmail(data: NotifyChangeEmailMessage): Promise<void> {
    try {
      await sendGridService.sendEmail({
        to: data.email,
        subject: "Marklie | Email Confirmation",
        text: `Please confirm your email change: http://localhost:4200/verify-email-change?token=${data.token}`,
      });
    } catch (err) {
      logger.error(`Failed to send change email notification to ${data.email}:`, err);
    }
  }
}
