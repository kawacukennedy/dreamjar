import * as Sentry from "@sentry/node";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";
import mongoose from "mongoose";
import winston from "winston";
import expressWinston from "express-winston";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { ApolloServer } from "apollo-server-express";
import { Server as SocketIOServer } from "socket.io";
import i18n from "i18n";
import { collectDefaultMetrics, register, Gauge } from "prom-client";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import authRoutes from "./routes/auth";
import wishRoutes from "./routes/wish";
import followRoutes from "./routes/follow";
import notificationRoutes from "./routes/notification";
import webhookRoutes from "./routes/webhook";
import apiKeyRoutes from "./routes/apikey";
import User from "./models/User";
import WishJar from "./models/WishJar";
import Follow from "./models/Follow";

dotenv.config();

// i18n configuration
i18n.configure({
  locales: ["en", "es", "fr"],
  directory: __dirname + "/locales",
  defaultLocale: "en",
  queryParameter: "lang",
  cookie: "lang",
});

// Prometheus metrics
collectDefaultMetrics();

const activeUsers = new Gauge({
  name: "dreamjar_active_users",
  help: "Number of active users",
});

const totalWishes = new Gauge({
  name: "dreamjar_total_wishes",
  help: "Total number of wishes",
});

// Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "dreamjar-backend" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

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

const app = express();
const PORT = process.env.PORT || 8080;

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket.IO middleware for auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret",
      ) as any;
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  logger.info("User connected", { userId: socket.data.userId });

  socket.on("join-wish", (wishId) => {
    socket.join(`wish-${wishId}`);
  });

  socket.on("disconnect", () => {
    logger.info("User disconnected", { userId: socket.data.userId });
  });
});

// Make io available globally
(global as any).io = io;

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "DreamJar API",
    version: "1.0.0",
    description: "API for DreamJar - Wish fulfillment platform",
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api/v1`,
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }: any) => {
    // Extract user from JWT
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "secret",
        ) as any;
        return { userId: decoded.userId };
      } catch {}
    }
    return {};
  },
});

// Start Apollo Server
server.start().then(() => {
  server.applyMiddleware({ app, path: "/graphql" });
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.posthog.com", "wss:", "ws:"],
        frameSrc: ["'self'", "https://*.ton.org"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["category", "status", "sortBy"], // Allow array parameters for these fields
  }),
);

app.use(compression()); // Compress responses
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Request ID
app.use((req: any, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-ID", req.id);
  next();
});

app.use(express.json({ limit: "10mb" })); // Increase limit for file uploads
app.use(express.urlencoded({ extended: true }));
app.use(i18n.init);

// Request logging
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
  }),
);

app.use(morgan("combined")); // Logging

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiting for wallet verification
const walletLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 wallet verifications per hour
  message: {
    error: "Too many wallet verification attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use("/api/v1/auth/wallet-verify", walletLimiter);
app.use("/api/v1/auth", authLimiter);

// Database connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/dreamjar")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wish", wishRoutes);
app.use("/api/v1/follow", followRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/webhook", webhookRoutes);
app.use("/api/v1/apikey", apiKeyRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: req.__("welcome"),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    apiVersion: "v1",
  });
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  // Update metrics
  const userCount = await User.countDocuments({
    deletedAt: { $exists: false },
  });
  const wishCount = await WishJar.countDocuments({
    deletedAt: { $exists: false },
  });

  activeUsers.set(userCount);
  totalWishes.set(wishCount);

  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error logging
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
  }),
);

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error("Unhandled error", { error: err, requestId: (req as any).id });
    Sentry.captureException(err);
    res.status(500).json({ error: "Internal server error" });
  },
);

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 GraphQL: http://localhost:${PORT}/graphql`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});
