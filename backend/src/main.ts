import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import * as compression from "compression";
import rateLimit from "express-rate-limit";
import * as Sentry from "@sentry/node";
import { Logger } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { monitoring } from "./services/monitoring";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Console(),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
    tracesSampleRate: 1.0,
  });

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          scriptSrc: ["'self'"],
          connectSrc: [
            "'self'",
            "https://toncenter.com",
            "https://testnet.toncenter.com",
            "wss:",
            "ws:",
          ],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: "Too many requests from this IP, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Additional rate limiting for sensitive endpoints
  app.use(
    "/api/v1/wishes",
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // 10 wish operations per minute
      message: { error: "Too many wish operations, please slow down." },
    }),
  );

  app.use(
    "/api/v1/auth",
    rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 5, // 5 auth attempts per 5 minutes
      message: {
        error: "Too many authentication attempts, please try again later.",
      },
    }),
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Metrics endpoint
  app.get("/metrics", (req, res) => {
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.end(monitoring.getMetrics());
  });

  // CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://dreamjar.vercel.app",
      "https://staging-dreamjar.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-TonConnect-Auth",
    ],
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("DreamJar API")
    .setDescription("API for DreamJar - Wish fulfillment platform")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  // Global prefix
  app.setGlobalPrefix("api/v1");

  const port = process.env.PORT || 8080;
  await app.listen(port);
  Logger.log(`🚀 Server running on port ${port}`, "Bootstrap");
}

bootstrap();
