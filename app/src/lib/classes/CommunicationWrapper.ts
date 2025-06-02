import { Database, OrganizationClient } from "marklie-ts-core";
import { SendGridService } from "../services/SendgridService.js";
import { SlackService } from "marklie-ts-core/dist/lib/services/SlackService.js";
import { TokenService } from "marklie-ts-core";
import { WhapiService } from "../services/WhapiService.js";
const database = await Database.getInstance();

export class CommunicationWrapper {

  private clientUuid: string;
  private sendGrid: SendGridService = new SendGridService("support@marklie.com");
  private whapiService: WhapiService = new WhapiService();

  constructor(clientUuid: string) {
    this.clientUuid = clientUuid;
  }

  public async sendReportToClient(report: string){
    const client: OrganizationClient = await database.em.findOne(OrganizationClient, this.clientUuid);

    if (!client) {
      throw new Error("Client not found");
    }

    if (client.emails && client.emails.length > 0) {
      for (const email of client.emails) {
        await this.sendGrid.sendReportEmail({
          to: email,
          subject: `Your Report Is Ready!`,
          text: 'We’ve completed your report and it is now ready for review.',
        }, report );
      }
    }

    if (client.slackConversationId) {
      const slackService = new SlackService(new TokenService());
      await slackService.sendSlackMessageWithFile(
        this.clientUuid,
        "Your report is ready!",
        Buffer.from(report, "base64"),
        "report.pdf"
      );
    }

    if (client.phoneNumbers && client.phoneNumbers.length > 0) {
      for (const phoneNumber of client.phoneNumbers) {
        await this.whapiService.sendReportWhatsapp(report, phoneNumber);
      }
    }

    
  }
  

}
