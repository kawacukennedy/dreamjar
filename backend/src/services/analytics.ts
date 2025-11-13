import Analytics from "../models/Analytics";

export const trackEvent = async (
  event: string,
  userId?: string,
  data?: any,
  req?: any,
) => {
  const analytics = new Analytics({
    event,
    userId,
    data,
    ipAddress: req?.ip,
    userAgent: req?.get("User-Agent"),
  });

  await analytics.save();
};
