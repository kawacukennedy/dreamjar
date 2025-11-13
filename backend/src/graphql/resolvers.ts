import WishJar from "../models/WishJar";
import Pledge from "../models/Pledge";
import User from "../models/User";
import { authenticate } from "../middleware/auth";
import { createNotification } from "../services/notification";
import { uploadToIPFS } from "../services/storage";

export const resolvers = {
  Query: {
    wishes: async (_: any, { limit = 10, offset = 0 }: any) => {
      return await WishJar.find({ deletedAt: { $exists: false } })
        .populate("ownerId")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },
    wish: async (_: any, { id }: any) => {
      return await WishJar.findById(id).populate("ownerId");
    },
    myWishes: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await WishJar.find({
        ownerId: context.userId,
        deletedAt: { $exists: false },
      }).populate("ownerId");
    },
    stats: async () => {
      const totalWishes = await WishJar.countDocuments({
        deletedAt: { $exists: false },
      });
      const activeWishes = await WishJar.countDocuments({
        status: "Active",
        deletedAt: { $exists: false },
      });
      const totalPledged = await Pledge.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalUsers = await User.countDocuments({
        deletedAt: { $exists: false },
      });

      return {
        totalWishes,
        activeWishes,
        totalPledged: totalPledged[0]?.total || 0,
        totalUsers,
      };
    },
  },
  Mutation: {
    createWish: async (
      _: any,
      {
        title,
        description,
        category,
        stakeAmount,
        deadline,
        validatorMode,
        validators,
      }: any,
      context: any,
    ) => {
      if (!context.userId) throw new Error("Not authenticated");

      const wishJar = new WishJar({
        ownerId: context.userId,
        title,
        description,
        category,
        contractAddress: `0:${Date.now().toString(16)}`,
        stakeAmount,
        deadline: new Date(deadline),
        validatorMode,
        validators,
      });

      // Upload metadata
      const metadata = {
        title,
        description,
        category,
        stakeAmount,
        deadline: new Date(deadline).toISOString(),
        validatorMode,
        validators: validators || [],
        createdAt: new Date().toISOString(),
      };
      const metadataBuffer = Buffer.from(JSON.stringify(metadata));
      const metadataURI = await uploadToIPFS(
        metadataBuffer,
        `metadata-${Date.now()}.json`,
      );
      wishJar.metadataURI = metadataURI;

      await wishJar.save();
      return wishJar.populate("ownerId");
    },
    pledge: async (_: any, { wishId, amount }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");

      const pledge = new Pledge({
        wishJarId: wishId,
        supporterId: context.userId,
        amount,
        txHash: "mock_tx_hash",
      });

      await pledge.save();

      // Notify owner
      const wishJar = await WishJar.findById(wishId);
      if (wishJar) {
        await createNotification(
          wishJar.ownerId.toString(),
          "pledge",
          `Someone pledged ${amount} TON to your wish "${wishJar.title}"`,
        );
      }

      return pledge.populate("wishJar").populate("supporter");
    },
  },
  WishJar: {
    owner: (wishJar: any) => wishJar.ownerId,
  },
  Pledge: {
    wishJar: (pledge: any) => WishJar.findById(pledge.wishJarId),
    supporter: (pledge: any) => User.findById(pledge.supporterId),
  },
  Subscription: {
    wishUpdated: {
      subscribe: (_: any, { id }: any) => {
        // Implement with pubsub
        return { id };
      },
    },
    newPledge: {
      subscribe: (_: any, { wishId }: any) => {
        // Implement with pubsub
        return { wishId };
      },
    },
  },
};
