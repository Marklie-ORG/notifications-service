import { Database, Log, Report } from "marklie-ts-core";
import { CommunicationChannel } from "marklie-ts-core/dist/lib/entities/ClientCommunicationChannel.js";

const logger: Log = Log.getInstance().extend("communication-wrapper");
const database = await Database.getInstance();

export class CommunicationWrapper {
  constructor(private clientUuid: string) {}

  public async sendReportToClient(
    report: string,
    reportUuid: string,
    organizationUuid: string,
  ) {
    const channels = await database.em.find(CommunicationChannel, {
      client: this.clientUuid,
    });

    if (!channels) {
      throw new Error("Channels not found");
    }

    const context = { reportUuid, organizationUuid };

    const dbReport = await database.em.findOne(Report, {uuid: reportUuid}) as Report;

    for (const channel of channels) {
      if (!channel.active) continue;

      try {
        await channel.send(report, context, dbReport);
      } catch (err) {
        logger.error(
          `Failed to send report via ${channel.constructor.name}:`,
          err,
        );
      }
    }
  }
}
