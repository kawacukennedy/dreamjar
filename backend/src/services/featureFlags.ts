// Simple feature flag system
const flags = {
  notifications: process.env.FEATURE_NOTIFICATIONS === "true",
  email: process.env.FEATURE_EMAIL === "true",
  voting: process.env.FEATURE_VOTING === "true",
};

export const isFeatureEnabled = (feature: keyof typeof flags): boolean => {
  return flags[feature];
};
