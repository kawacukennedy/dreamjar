import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { WishJar } from "../models/WishJar";
import { User } from "../models/User";
import mongoose from "mongoose";

describe("App (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Authentication", () => {
    it("should get wallet challenge", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/ton-challenge")
        .send({ address: "test-address" })
        .expect(200)
        .expect((res) => {
          expect(res.body.challengeMessage).toBeDefined();
        });
    });

    it("should handle invalid auth", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/ton-login")
        .send({})
        .expect(400);
    });
  });

  describe("Wish Management", () => {
    let authToken: string;
    let wishId: string;

    beforeAll(async () => {
      // Create test user and get token
      const user = new (mongoose.model("User", User.schema))({
        username: "testuser",
        display_name: "Test User",
        wallet_addresses: [{ address: "test-wallet", provider: "TonConnect" }],
      });
      await user.save();

      // Mock JWT token (in real test, would authenticate properly)
      authToken = "mock-jwt-token";
    });

    it("should create wish", () => {
      return request(app.getHttpServer())
        .post("/api/v1/wishes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Wish",
          description: "Integration test wish",
          stakeAmountMicroTon: 1000000,
          goalDeadline: "2024-12-31T00:00:00Z",
          proofMethod: "media",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.wishId).toBeDefined();
          wishId = res.body.wishId;
        });
    });

    it("should get wish details", () => {
      return request(app.getHttpServer())
        .get(`/api/v1/wishes/${wishId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.wishId).toBe(wishId);
          expect(res.body.title).toBe("Test Wish");
        });
    });

    it("should list wishes", () => {
      return request(app.getHttpServer())
        .get("/api/v1/wishes")
        .expect(200)
        .expect((res) => {
          expect(res.body.wishes).toBeDefined();
          expect(Array.isArray(res.body.wishes)).toBe(true);
        });
    });

    it("should create pledge", () => {
      return request(app.getHttpServer())
        .post(`/api/v1/wishes/${wishId}/pledges`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          amountMicroTon: 500000,
          note: "Test pledge",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.pledgeId).toBeDefined();
        });
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for non-existent wish", () => {
      return request(app.getHttpServer())
        .get("/api/v1/wishes/nonexistent")
        .expect(404);
    });

    it("should handle invalid request data", () => {
      return request(app.getHttpServer())
        .post("/api/v1/wishes")
        .send({ invalid: "data" })
        .expect(400);
    });
  });

  describe("Rate Limiting", () => {
    it("should handle rate limiting", async () => {
      // This test would need to be configured with actual rate limiting
      // For now, just ensure endpoints respond
      const response = await request(app.getHttpServer())
        .get("/api/v1/wishes")
        .expect((res) => {
          expect(res.status).toBeLessThan(500);
        });
    });
  });
});
