import Notification from "../models/Notification";
import User from "../models/User";
import {
  sendPledgeNotification,
  sendProofUploadedNotification,
  sendResolutionNotification,
  sendDeadlineReminder,
} from "./email";

export const createNotification = async (
  userId: string,
  type: "pledge" | "vote" | "wish_update" | "deadline" | "resolution",
  message: string,
  metadata?: any,
) => {
  const notification = new Notification({
    userId,
    type,
    message,
    metadata,
  });

  await notification.save();

  // Send email notification if user has email and preferences allow
  const user = await User.findById(userId);
  if (user?.email && user.notificationPreferences.email) {
    try {
      switch (type) {
        case "pledge":
          if (user.notificationPreferences.pledges && metadata) {
            await sendPledgeNotification(
              user.email,
              metadata.pledgerName,
              metadata.amount,
              metadata.wishTitle,
              metadata.wishId,
            );
          }
          break;
        case "wish_update":
          if (user.notificationPreferences.proofs && metadata) {
            await sendProofUploadedNotification(
              user.email,
              metadata.wishTitle,
              metadata.wishId,
            );
          }
          break;
        case "resolution":
          if (user.notificationPreferences.resolutions && metadata) {
            await sendResolutionNotification(
              user.email,
              metadata.wishTitle,
              metadata.status,
              metadata.wishId,
            );
          }
          break;
        case "deadline":
          if (user.notificationPreferences.deadlines && metadata) {
            await sendDeadlineReminder(
              user.email,
              metadata.wishTitle,
              metadata.daysLeft,
              metadata.wishId,
            );
          }
          break;
      }
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  }

  return notification;
};

export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true },
  );
};
