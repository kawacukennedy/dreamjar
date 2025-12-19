import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { VerificationService } from "../services/verification.service";
import { WishJar } from "../models/WishJar";
import { Vote } from "../models/Vote";
import { Proof } from "../models/Proof";
import { User } from "../models/User";
import { MonitoringService } from "../services/monitoring";

describe("VerificationService", () => {
  let service: VerificationService;
  let wishModel: any;
  let voteModel: any;
  let proofModel: any;
  let userModel: any;
  let monitoring: any;

  beforeEach(async () => {
    const mockWishModel = {
      findOne: jest.fn(),
    };

    const mockVoteModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
    };

    const mockProofModel = {
      create: jest.fn(),
    };

    const mockUserModel = {};

    const mockMonitoring = {
      audit: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: getModelToken(WishJar.name),
          useValue: mockWishModel,
        },
        {
          provide: getModelToken(Vote.name),
          useValue: mockVoteModel,
        },
        {
          provide: getModelToken(Proof.name),
          useValue: mockProofModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: MonitoringService,
          useValue: mockMonitoring,
        },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
    wishModel = module.get(getModelToken(WishJar.name));
    voteModel = module.get(getModelToken(Vote.name));
    proofModel = module.get(getModelToken(Proof.name));
    monitoring = module.get(MonitoringService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("submitProof", () => {
    it("should submit proof successfully", async () => {
      const mockWish = {
        _id: "wishId",
        status: "active",
        creator_user_id: "userId",
      };

      wishModel.findOne.mockResolvedValue(mockWish);
      proofModel.create.mockResolvedValue({ _id: "proofId" });

      const result = await service.submitProof("wishId", "userId", {
        proofMethod: "media",
        mediaURI: "ipfs://test",
        mediaHash: "hash",
      });

      expect(result).toEqual({
        proofId: "proofId",
        status: "pending_verification",
      });
      expect(monitoring.audit).toHaveBeenCalledWith(
        "proof_submitted",
        expect.any(Object),
      );
    });

    it("should throw error for non-creator", async () => {
      const mockWish = {
        _id: "wishId",
        status: "active",
        creator_user_id: "otherUserId",
      };

      wishModel.findOne.mockResolvedValue(mockWish);

      await expect(
        service.submitProof("wishId", "userId", {
          proofMethod: "media",
        }),
      ).rejects.toThrow("Only creator can submit proof");
    });
  });

  describe("castVote", () => {
    it("should cast vote successfully", async () => {
      const mockWish = {
        _id: "wishId",
        status: "pending_verification",
      };

      wishModel.findOne.mockResolvedValue(mockWish);
      voteModel.findOne.mockResolvedValue(null); // No existing vote
      voteModel.create.mockResolvedValue({ _id: "voteId" });

      const result = await service.castVote("wishId", "userId", "yes");

      expect(result).toEqual({
        voteId: "voteId",
        status: "pending",
        totalVotes: 1,
      });
      expect(monitoring.audit).toHaveBeenCalledWith(
        "vote_cast",
        expect.any(Object),
      );
    });

    it("should throw error for already voted", async () => {
      const mockWish = {
        _id: "wishId",
        status: "pending_verification",
      };

      wishModel.findOne.mockResolvedValue(mockWish);
      voteModel.findOne.mockResolvedValue({ _id: "existingVote" });

      await expect(service.castVote("wishId", "userId", "yes")).rejects.toThrow(
        "User has already voted",
      );
    });
  });

  describe("checkVerificationStatus", () => {
    it("should return pending status with low votes", async () => {
      const mockWish = { _id: "wishId" };
      const mockVotes = [
        { choice: "yes", weight: 1 },
        { choice: "no", weight: 1 },
      ];

      wishModel.findOne.mockResolvedValue(mockWish);
      voteModel.find.mockResolvedValue(mockVotes);

      const result = await service.checkVerificationStatus("wishId");

      expect(result.status).toBe("pending");
      expect(result.totalVotes).toBe(2);
      expect(result.yesVotes).toBe(1);
      expect(result.noVotes).toBe(1);
    });

    it("should return approved status with quorum and majority", async () => {
      const mockWish = { _id: "wishId" };
      const mockVotes = Array(15).fill({ choice: "yes", weight: 1 }); // 15 yes votes

      wishModel.findOne.mockResolvedValue(mockWish);
      voteModel.find.mockResolvedValue(mockVotes);

      const result = await service.checkVerificationStatus("wishId");

      expect(result.status).toBe("approved");
      expect(result.quorumReached).toBe(true);
    });
  });
});
