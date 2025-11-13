import Queue from "bull";
import WishJar from "../models/WishJar";
import { createNotification } from "./notification";

const deadlineQueue = new Queue("deadline-notifications", {
  redis: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

deadlineQueue.process(async (job) => {
  const { wishId } = job.data;
  const wishJar = await WishJar.findById(wishId);
  if (wishJar) {
    await createNotification(
      wishJar.ownerId.toString(),
      "deadline",
      `Your wish "${wishJar.title}" deadline is approaching`,
    );
  }
});

export const addDeadlineNotification = (wishId: string, delay: number) => {
  deadlineQueue.add({ wishId }, { delay });
};

export default deadlineQueue;
