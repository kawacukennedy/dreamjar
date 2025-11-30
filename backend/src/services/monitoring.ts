import * as Sentry from "@sentry/node";
import winston from "winston";
import {
  register,
  collectDefaultMetrics,
  Gauge,
  Counter,
  Histogram,
} from "prom-client";

export class MonitoringService {
  private logger: winston.Logger;
  private metrics: {
    httpRequestsTotal: Counter<string>;
    httpRequestDuration: Histogram<string>;
    activeUsers: Gauge<string>;
    wishesCreated: Counter<string>;
    pledgesCreated: Counter<string>;
  };

  constructor() {
    // Enable default metrics
    collectDefaultMetrics();

    // Custom metrics
    this.metrics = {
      httpRequestsTotal: new Counter({
        name: "http_requests_total",
        help: "Total number of HTTP requests",
        labelNames: ["method", "route", "status_code"],
      }),
      httpRequestDuration: new Histogram({
        name: "http_request_duration_seconds",
        help: "Duration of HTTP requests in seconds",
        labelNames: ["method", "route"],
        buckets: [0.1, 0.5, 1, 2, 5],
      }),
      activeUsers: new Gauge({
        name: "active_users",
        help: "Number of active users",
      }),
      wishesCreated: new Counter({
        name: "wishes_created_total",
        help: "Total number of wishes created",
      }),
      pledgesCreated: new Counter({
        name: "pledges_created_total",
        help: "Total number of pledges created",
      }),
    };

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

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.metrics.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
    this.metrics.httpRequestDuration.observe({ method, route }, duration);
  }

  incrementWishesCreated() {
    this.metrics.wishesCreated.inc();
  }

  incrementPledgesCreated() {
    this.metrics.pledgesCreated.inc();
  }

  setActiveUsers(count: number) {
    this.metrics.activeUsers.set(count);
  }

  getMetrics() {
    return register.metrics();
  }
}

export const monitoring = new MonitoringService();
