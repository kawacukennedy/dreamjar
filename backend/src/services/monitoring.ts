import * as Sentry from "@sentry/node";
import winston from "winston";
import { PrometheusMeter } from "prom-client";

export class MonitoringService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: "dreamjar-backend" },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
        // Add Logtail transport if configured
        ...(process.env.LOGTAIL_TOKEN
          ? [
              new winston.transports.Http({
                host: "in.logs.betterstack.com",
                path: "/",
                auth: { bearer: process.env.LOGTAIL_TOKEN },
                ssl: true,
              }),
            ]
          : []),
      ],
    });
  }

  log(level: string, message: string, meta?: any) {
    this.logger.log(level, message, meta);
  }

  error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, { error: error?.stack, ...meta });
    if (error) {
      Sentry.captureException(error, { extra: meta });
    }
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  audit(event: string, data: any) {
    this.logger.info(`AUDIT: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }
}

export const monitoring = new MonitoringService();
