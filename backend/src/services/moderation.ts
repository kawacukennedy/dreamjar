// Simple content moderation service
const bannedWords = ["spam", "scam", "offensive"]; // Add more

export const moderateContent = (
  text: string,
): { approved: boolean; reason?: string } => {
  const lowerText = text.toLowerCase();

  for (const word of bannedWords) {
    if (lowerText.includes(word)) {
      return { approved: false, reason: `Contains banned word: ${word}` };
    }
  }

  return { approved: true };
};

export const moderateImage = async (
  buffer: Buffer,
): Promise<{ approved: boolean; reason?: string }> => {
  // Mock image moderation - in real app, use AI service
  // For now, assume all images are approved
  return { approved: true };
};
