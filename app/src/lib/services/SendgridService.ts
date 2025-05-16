import sgMail, { type MailDataRequired } from "@sendgrid/mail";
import {Log} from "marklie-ts-core";
import type {SendEmailOptions} from "marklie-ts-core/dist/lib/interfaces/MailInterfaces.js";

const logger: Log = Log.getInstance().extend("service");

export class SendGridService {
  constructor(
    private defaultFrom: string,
  ) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      await sgMail.send({
        to: options.to,
        from: options.from || this.defaultFrom,
        subject: options.subject,
        text: options.text || "",
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      } as MailDataRequired);

        logger.info(
        `Email is sent to: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`,
      );
    } catch (error: any) {
        logger.error(
        "Error sending email:",
        error?.response?.body || error,
      );
      throw error;
    }
  }

    public async sendReportEmail(options: SendEmailOptions, pdfBuffer: string) {
      try {
        await sgMail.send({to: options.to,
          from: options.from || this.defaultFrom,
          subject: options.subject,
          text: options.text || "",
          replyTo: options.replyTo,
          cc: options.cc,
          bcc: options.bcc,
          attachments: [{
            content: pdfBuffer,
            filename: 'facebook-report.pdf',
            type: 'application/pdf',
            disposition: 'attachment',
          }]} as MailDataRequired);

        logger.info(
            `Email report ready is sent to: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`,
        );
    } catch (error: any) {
        logger.error(
            "Error sending email:",
            error?.response?.body || error,
        );
        throw error;
    }
    }

  public async sendTemplateEmail({
    to,
    templateId,
    dynamicTemplateData,
    from,
  }: {
    to: string | string[];
    templateId: string;
    dynamicTemplateData: Record<string, any>;
    from?: string;
  }) {
    try {
      await sgMail.send({
        to,
        from: from || this.defaultFrom,
        templateId,
        dynamicTemplateData,
      });
        logger.info(`Template email sent to: ${to}`);
    } catch (error: any) {
        logger.error(
        "Template send error:",
        error?.response?.body || error,
      );
      throw error;
    }
  }
}