import {
  Database,
  ErrorCode,
  MarklieError,
  Report,
} from "marklie-ts-core";
import { CommunicationChannel } from "marklie-ts-core/dist/lib/entities/ClientCommunicationChannel.js";


export class CommunicationWrapper {
  constructor(private clientUuid: string) {}

  public async sendReportToClient(
    report: string,
    reportUuid: string,
    organizationUuid: string,
  ) {
    const database = await Database.getInstance();
    const channels = await database.em.find(CommunicationChannel, {
      client: this.clientUuid,
    });

    if (!channels) {
      throw new MarklieError("Channels not found", ErrorCode.NOT_FOUND);
    }

    const context = { reportUuid, organizationUuid };

    const dbReport = (await database.em.findOne(Report, {
      uuid: reportUuid,
    })) as Report;

    for (const channel of channels) {
      if (!channel.active) continue;

      try {
        await channel.send(report, context, dbReport);
      } catch (err: any) {
        console.error(
            `Failed to send report via ${channel.constructor.name} for client ${this.clientUuid}`

        );
        console.error(err)
      }
    }
  }
}
