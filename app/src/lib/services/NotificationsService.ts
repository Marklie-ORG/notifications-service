import type {
  NotifyChangeEmailMessage,
  NotifyReportReadyMessage,
  NotifyClientAccessTokenMessage,
  NotifyClientAccessRequestedMessage,
} from "marklie-ts-core/dist/lib/interfaces/PubSubInterfaces.js";
import { Database, GCSWrapper, Log, Organization } from "marklie-ts-core";
import { CommunicationWrapper } from "../classes/CommunicationWrapper.js";
import { ActivityLog } from "marklie-ts-core/dist/lib/entities/ActivityLog.js";
import { sendGridService } from "marklie-ts-core/dist/lib/services/SendgridService.js";

const logger: Log = Log.getInstance().extend("notifications-service");
const database = await Database.getInstance();

export class NotificationsService {
  private static readonly gcs = GCSWrapper.getInstance(
    "marklie-client-reports",
  );

  public static async sendReportToClients(
    data: NotifyReportReadyMessage,
  ): Promise<void> {
    try {
      const report = await this.gcs.getReport(data.reportUrl);
      const communicationWrapper = new CommunicationWrapper(data.clientUuid);
      await communicationWrapper.sendReportToClient(
        report,
        data.reportUuid,
        data.organizationUuid,
      );
    } catch (err) {
      logger.error("Failed to send report to clients:", err);
    }
  }

  public static async sendReportIsReadyEmails(
    data: NotifyReportReadyMessage,
  ): Promise<void> {
    const organization = await database.em.findOne(
      Organization,
      { uuid: data.organizationUuid },
      { populate: ["members.user"] },
    );

    if (!organization) {
      logger.error(
        `Organization with UUID ${data.organizationUuid} not found.`,
      );
      return;
    }

    try {
      const members = organization.members.getItems();

      for (const member of members) {
        const user = member.user;

        try {
          await sendGridService.sendEmail(
            {
              to: user.email,
              subject: "Your Report Is Ready!",
              text: "The report has been generated, you can review it here: https://marklie.com/reports-database",
            }
          );
        } catch (emailError) {
          logger.error(`Failed to notify user ${user.email}:`, emailError);
        }
      }

      const log = database.em.create(ActivityLog, {
        organization: organization.uuid,
        action: "report_ready_sent",
        targetType: "report",
        targetUuid: data.reportUuid,
        client: data.clientUuid,
        actor: "system",
      });

      await database.em.persistAndFlush(log);
    } catch (reportError) {
      logger.error(
        "Failed to fetch report for email notifications:",
        JSON.stringify(reportError),
      );
    }
  }

  public static async sendChangeEmailEmail(
    data: NotifyChangeEmailMessage,
  ): Promise<void> {
    try {
      await sendGridService.sendEmail({
        to: data.email,
        subject: "Marklie | Email Confirmation",
        text: `Please confirm your email change: https://marklie.com/verify-email-change?token=${data.token}`,
      });
    } catch (err) {
      logger.error(
        `Failed to send change email notification to ${data.email}:`,
        err,
      );
    }
  }

  public static async sendClientAccessTokenEmail(
    data: NotifyClientAccessTokenMessage,
  ): Promise<void> {
    try {
      await sendGridService.sendEmail({
        to: data.email,
        subject: "Marklie | Access to reports",
        html: `<p>Open Ad Performance reports: <a href="https://marklie.com/activate-client-access?token=${data.token}">Link</a></p>`,
      });
    } catch (err) {
      logger.error(
        `Failed to send client access token email notification to ${data.email}:`,
        err,
      );
    }
  }

  public static async sendClientAccessRequestedEmail(
    data: NotifyClientAccessRequestedMessage,
  ): Promise<void> {
    const subject = "Marklie | Client access requested";
    const textBody = `${data.requesterEmail} requested access to ${data.clientName} reports.`;
    const htmlBody = `<p><strong>${data.requesterEmail}</strong> requested access to reports for <strong>${data.clientName}</strong>.</p>`;

    try {
      await sendGridService.sendEmail({
        to: data.recipientEmail,
        subject,
        text: `${textBody}\nManage requests at https://marklie.com/access-requests`,
        html: `${htmlBody}<p><a href="https://marklie.com/access-requests">Review requests in Marklie</a></p>`,
      });
    } catch (err) {
      logger.error(
        `Failed to send client access requested email to ${data.recipientEmail}:`,
        err,
      );
    }
  }

}
