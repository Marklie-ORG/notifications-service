import {
  Database,
  ErrorCode,
  MarklieError,
  Report,
} from "marklie-ts-core";
import { CommunicationChannel } from "marklie-ts-core/dist/lib/entities/ClientCommunicationChannel.js";

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
            `Failed to send report via ${channel.constructor.name} for client ${this.clientUuid}`,
            {
              error: {
                message: err?.message,
                stack: err?.stack,
                status: err?.response?.status,
                statusText: err?.response?.statusText,
                body: err?.response?.data || err?.response?.body,
              },
            },
        );
      }
    }
  }
}
