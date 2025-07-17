import { notificationEnvSchema, ConfigService } from "marklie-ts-core";
import { z } from "zod";

export type NotificationServiceEnvironment = z.infer<typeof notificationEnvSchema>;

export class NotificationServiceConfig extends ConfigService<NotificationServiceEnvironment> {
  private static instance: NotificationServiceConfig;

  private constructor() {
    super(notificationEnvSchema, "reports-service");
  }

  public static getInstance(): NotificationServiceConfig {
    if (!NotificationServiceConfig.instance) {
      NotificationServiceConfig.instance = new NotificationServiceConfig();
    }
    return NotificationServiceConfig.instance;
  }
}
