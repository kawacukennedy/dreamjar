import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth Routes", () => {
  it("should return challenge message", async () => {
    const response = await request(app)
      .post("/auth/wallet-challenge")
      .send({ address: "test_address" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("challengeMessage");
  });

  it("should verify wallet", async () => {
    const response = await request(app).post("/auth/wallet-verify").send({
      address: "test_address",
      signedMessage: "signed",
      challengeMessage: "challenge",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("jwt");
  });
});
