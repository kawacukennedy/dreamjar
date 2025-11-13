import Notification from "../models/Notification";
import User from "../models/User";
import { sendEmail } from "./email";

export const createNotification = async (
  userId: string,
  type: "pledge" | "vote" | "wish_update" | "deadline",
  message: string,
) => {
  const notification = new Notification({
    userId,
    type,
    message,
  });

  await notification.save();

  // Send email if user has email (mock, since no email field)
  // In real app, add email to User model
  // const user = await User.findById(userId);
  // if (user.email) {
  //   await sendEmail(user.email, `DreamJar: ${type}`, `<p>${message}</p>`);
  // }

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
