import {Database, Log, OrganizationClient} from "marklie-ts-core";

const logger: Log = Log.getInstance().extend("communication-wrapper");
const database = await Database.getInstance();

export class CommunicationWrapper {
  constructor(private clientUuid: string) {}

  public async sendReportToClient(report: string, reportUuid: string, organizationUuid: string) {
    const client = await database.em.findOne(
        OrganizationClient,
        { uuid: this.clientUuid },
        { populate: ['channels'] }
    );

    if (!client) throw new Error("Client not found");

    const context = { reportUuid, organizationUuid };

    for (const channel of client.channels.getItems()) {
      if (!channel.active) continue;

      try {
        await channel.send(report, context);
      } catch (err) {
        logger.error(`Failed to send report via ${channel.constructor.name}:`, err);
      }
    }
  }
}
