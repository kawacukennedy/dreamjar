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
      verificationCompleted: new Counter({
        name: "verifications_completed_total",
        help: "Total number of wish verifications completed",
        labelNames: ["result"],
      }),
      badgesMinted: new Counter({
        name: "badges_minted_total",
        help: "Total number of supporter badges minted",
      }),
      impactPoolFunds: new Gauge({
        name: "impact_pool_funds",
        help: "Current funds in impact pool (microTON)",
      }),
      websocketConnections: new Gauge({
        name: "websocket_connections",
        help: "Number of active WebSocket connections",
      }),
      blockchainTransactions: new Counter({
        name: "blockchain_transactions_total",
        help: "Total blockchain transactions",
        labelNames: ["type", "status"],
      }),
      apiErrors: new Counter({
        name: "api_errors_total",
        help: "Total API errors",
        labelNames: ["endpoint", "error_type"],
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

  incrementVerificationCompleted(result: "approved" | "rejected") {
    this.metrics.verificationCompleted.inc({ result });
  }

  incrementBadgesMinted() {
    this.metrics.badgesMinted.inc();
  }

  setImpactPoolFunds(amount: number) {
    this.metrics.impactPoolFunds.set(amount);
  }

  setWebSocketConnections(count: number) {
    this.metrics.websocketConnections.set(count);
  }

  incrementBlockchainTransaction(type: string, status: "success" | "failed") {
    this.metrics.blockchainTransactions.inc({ type, status });
  }

  incrementApiError(endpoint: string, errorType: string) {
    this.metrics.apiErrors.inc({ endpoint, error_type: errorType });
  }

  // Performance monitoring
  recordDatabaseQuery(operation: string, duration: number, collection: string) {
    // Could add histogram for DB query durations
    this.logger.debug(`DB ${operation} on ${collection}`, { duration });
  }

  recordExternalApiCall(service: string, duration: number, success: boolean) {
    // Could add histogram for external API calls
    this.logger.info(`External API call to ${service}`, { duration, success });
  }

  // Business metrics
  recordUserEngagement(userId: string, action: string, metadata?: any) {
    this.logger.info(`User engagement: ${action}`, { userId, ...metadata });
  }

  recordConversion(from: string, to: string, userId: string) {
    this.logger.info(`Conversion: ${from} -> ${to}`, { userId });
  }

  // Alert triggers
  alertHighErrorRate(endpoint: string, rate: number) {
    if (rate > 0.05) {
      // 5% error rate
      this.logger.error(`High error rate on ${endpoint}`, { rate });
      // Could integrate with alerting system
    }
  }

  alertLowVerificationRate() {
    // Could check verification completion rates
    this.logger.warn("Low verification completion rate detected");
  }

  getMetrics() {
    return register.metrics();
  }
}

export const monitoring = new MonitoringService();
