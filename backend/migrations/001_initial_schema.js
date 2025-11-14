const mongoose = require("mongoose");

module.exports = {
  async up() {
    // Create indexes
    await mongoose.connection.db
      .collection("users")
      .createIndex({ walletAddress: 1 }, { unique: true });
    await mongoose.connection.db
      .collection("users")
      .createIndex({ createdAt: -1 });
    await mongoose.connection.db
      .collection("users")
      .createIndex({ lastSeen: -1 });

    await mongoose.connection.db
      .collection("wishjars")
      .createIndex({ ownerId: 1, createdAt: -1 });
    await mongoose.connection.db
      .collection("wishjars")
      .createIndex({ status: 1, deadline: 1 });
    await mongoose.connection.db
      .collection("wishjars")
      .createIndex({ pledgedAmount: -1 });
    await mongoose.connection.db
      .collection("wishjars")
      .createIndex({ title: "text", description: "text" });

    await mongoose.connection.db
      .collection("pledges")
      .createIndex({ wishJarId: 1 });
    await mongoose.connection.db
      .collection("pledges")
      .createIndex({ supporterId: 1 });

    await mongoose.connection.db
      .collection("notifications")
      .createIndex({ userId: 1, createdAt: -1 });
    await mongoose.connection.db
      .collection("notifications")
      .createIndex({ read: 1 });

    await mongoose.connection.db
      .collection("audits")
      .createIndex({ userId: 1, createdAt: -1 });
    await mongoose.connection.db
      .collection("audits")
      .createIndex({ resource: 1, resourceId: 1 });

    await mongoose.connection.db
      .collection("apikeys")
      .createIndex({ key: 1 }, { unique: true });
    await mongoose.connection.db
      .collection("apikeys")
      .createIndex({ userId: 1 });

    await mongoose.connection.db
      .collection("webhooks")
      .createIndex({ userId: 1 });

    await mongoose.connection.db
      .collection("analytics")
      .createIndex({ event: 1, createdAt: -1 });
    await mongoose.connection.db
      .collection("analytics")
      .createIndex({ userId: 1, createdAt: -1 });

    await mongoose.connection.db
      .collection("follows")
      .createIndex({ follower: 1, following: 1 }, { unique: true });
    await mongoose.connection.db
      .collection("follows")
      .createIndex({ follower: 1, createdAt: -1 });
    await mongoose.connection.db
      .collection("follows")
      .createIndex({ following: 1, createdAt: -1 });

    console.log("Migration 001 completed");
  },

  async down() {
    // Drop indexes
    await mongoose.connection.db.collection("users").dropIndexes();
    await mongoose.connection.db.collection("wishjars").dropIndexes();
    await mongoose.connection.db.collection("pledges").dropIndexes();
    await mongoose.connection.db.collection("notifications").dropIndexes();
    await mongoose.connection.db.collection("audits").dropIndexes();
    await mongoose.connection.db.collection("apikeys").dropIndexes();
    await mongoose.connection.db.collection("webhooks").dropIndexes();
    await mongoose.connection.db.collection("analytics").dropIndexes();
    await mongoose.connection.db.collection("follows").dropIndexes();

    console.log("Migration 001 rolled back");
  },
};
