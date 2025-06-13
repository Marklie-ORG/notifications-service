import { SendGridService } from "./SendgridService.js";

import type {
  NotifyChangeEmailMessage, NotifyReportReadyMessage
} from "marklie-ts-core/dist/lib/interfaces/PubSubInterfaces.js";
import {Database, GCSWrapper, Log, Organization} from "marklie-ts-core";
import { CommunicationWrapper } from "../classes/CommunicationWrapper.js";
import {ActivityLog} from "marklie-ts-core/dist/lib/entities/ActivityLog.js";
const logger: Log = Log.getInstance().extend("notifications-util");
const database = await Database.getInstance();

export class NotificationsService {
  private static readonly sendGrid: SendGridService = new SendGridService("support@marklie.com");

  public static async sendReportToClients(
    data: NotifyReportReadyMessage
  ): Promise<void> {
    const gcsService = GCSWrapper.getInstance("marklie-client-reports")
    const report = await gcsService.getReport(data.reportUrl);

    const communicationWrapper = new CommunicationWrapper(data.clientUuid);
    await communicationWrapper.sendReportToClient(report, data.reportUuid);
  }

  public static async sendReportIsReadyEmails(
      data: NotifyReportReadyMessage
  ): Promise<void> {
    const organization = await database.em.findOne(
        Organization,
        { uuid: data.organizationUuid },
        {
          populate: ["members.user"],
        },
    );
    const gcsService = GCSWrapper.getInstance("marklie-client-reports")
    const report = await gcsService.getReport(data.reportUrl);

    if (!organization) {
      logger.error(`Organization with UUID ${data.organizationUuid} not found.`);
      return;
    }

    const members = organization.members.getItems();

    for (const member of members) {
      const user = member.user;
      try {
        await this.sendGrid.sendReportEmail({
          to: user.email,
          subject: `Your Report Is Ready!`,
          text: 'We’ve completed your report and it is now ready for review.',
        }, report )

        const log = database.em.create(ActivityLog, {
          organizationUuid: organization.uuid,
          action: 'report_ready_sent',
          targetType: 'report',
          targetUuid: data.reportUuid,
          clientUuid: data.clientUuid,
          actor: 'system',
          metadata: {email: user.email},
        });

        await database.em.persistAndFlush(log);
      } catch (err) {
        logger.error(`Failed to notify user ${user.email}:`, err);
      }
    }
  }

  public static async sendChangeEmailEmail(
    data: NotifyChangeEmailMessage
  ): Promise<void> {
    
    try {
      await this.sendGrid.sendEmail({
        to: data.email,
        subject: `Marklie | Email Confirmation`,
        text: `Please confirm your email change: http://localhost:4200/verify-email-change?token=${data.token}`,
      })
    } catch (err) {
      logger.error(`Failed to notify user ${data.email}:`, err);
    }

  }

}
