import nodemailer from "nodemailer";

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@dreamjar.com",
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// Email templates
const getPledgeNotificationTemplate = (
  pledgerName: string,
  amount: number,
  wishTitle: string,
  wishUrl: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Pledge on Your Dream</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .amount { font-size: 24px; font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Pledge!</h1>
    </div>
    <div class="content">
      <p>Great news! <strong>${pledgerName}</strong> has pledged <span class="amount">${amount} TON</span> to your dream!</p>
      <p><strong>Dream:</strong> ${wishTitle}</p>
      <p>Someone believes in your dream and wants to help you achieve it. Keep up the great work!</p>
      <a href="${wishUrl}" class="button">View Your Dream</a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        You're receiving this because you created a dream on DreamJar.
        <br>
        <a href="${process.env.FRONTEND_URL}/settings">Unsubscribe</a> from these notifications.
      </p>
    </div>
  </div>
</body>
</html>
`;

const getProofUploadedTemplate = (wishTitle: string, wishUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Proof Uploaded for Your Dream</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📸 Proof Uploaded!</h1>
    </div>
    <div class="content">
      <p>Exciting news! Proof has been uploaded for your dream: <strong>${wishTitle}</strong></p>
      <p>The community is now voting on whether your dream has been successfully achieved.</p>
      <p>Check the results and see if you've accomplished your goal!</p>
      <a href="${wishUrl}" class="button">View Results</a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        You're receiving this because you created a dream on DreamJar.
        <br>
        <a href="${process.env.FRONTEND_URL}/settings">Unsubscribe</a> from these notifications.
      </p>
    </div>
  </div>
</body>
</html>
`;

const getResolutionTemplate = (
  wishTitle: string,
  status: string,
  wishUrl: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dream Resolution: ${status}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${status === "successful" ? "#4CAF50" : "#f44336"} 0%, ${status === "successful" ? "#45a049" : "#da190b"} 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: ${status === "successful" ? "#4CAF50" : "#f44336"}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .status { font-size: 18px; font-weight: bold; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${status === "successful" ? "🎉" : "😔"} Dream ${status === "successful" ? "Achieved!" : "Not Achieved"}</h1>
    </div>
    <div class="content">
      <p>Your dream "<strong>${wishTitle}</strong>" has been resolved as <span class="status">${status}</span>.</p>
      ${
        status === "successful"
          ? "<p>Congratulations! The community has voted that you successfully achieved your dream. You can now claim your stake back plus any additional pledges!</p>"
          : "<p>The community voted that your dream was not fully achieved. Don't be discouraged - you can try again or create a new dream!</p>"
      }
      <a href="${wishUrl}" class="button">View Details</a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        You're receiving this because you created a dream on DreamJar.
        <br>
        <a href="${process.env.FRONTEND_URL}/settings">Unsubscribe</a> from these notifications.
      </p>
    </div>
  </div>
</body>
</html>
`;

const getDeadlineReminderTemplate = (
  wishTitle: string,
  daysLeft: number,
  wishUrl: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Deadline Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .urgent { color: #ff5722; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Deadline Reminder</h1>
    </div>
    <div class="content">
      <p>Just a reminder that your dream "<strong>${wishTitle}</strong>" has <span class="urgent">${daysLeft} day${daysLeft !== 1 ? "s" : ""}</span> left until the deadline.</p>
      <p>Make sure to upload proof of your progress if you're getting close to achieving your dream!</p>
      <a href="${wishUrl}" class="button">View Your Dream</a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        You're receiving this because you created a dream on DreamJar.
        <br>
        <a href="${process.env.FRONTEND_URL}/settings">Unsubscribe</a> from these notifications.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Notification functions
export const sendPledgeNotification = async (
  email: string,
  pledgerName: string,
  amount: number,
  wishTitle: string,
  wishId: string,
) => {
  const wishUrl = `${process.env.FRONTEND_URL}/wish/${wishId}`;
  const subject = `New pledge on your dream: ${wishTitle}`;
  const html = getPledgeNotificationTemplate(
    pledgerName,
    amount,
    wishTitle,
    wishUrl,
  );

  try {
    await sendEmail(email, subject, html);
  } catch (error) {
    console.error("Failed to send pledge notification:", error);
  }
};

export const sendProofUploadedNotification = async (
  email: string,
  wishTitle: string,
  wishId: string,
) => {
  const wishUrl = `${process.env.FRONTEND_URL}/wish/${wishId}`;
  const subject = `Proof uploaded for your dream: ${wishTitle}`;
  const html = getProofUploadedTemplate(wishTitle, wishUrl);

  try {
    await sendEmail(email, subject, html);
  } catch (error) {
    console.error("Failed to send proof notification:", error);
  }
};

export const sendResolutionNotification = async (
  email: string,
  wishTitle: string,
  status: "successful" | "failed",
  wishId: string,
) => {
  const wishUrl = `${process.env.FRONTEND_URL}/wish/${wishId}`;
  const subject = `Dream resolution: ${wishTitle}`;
  const html = getResolutionTemplate(wishTitle, status, wishUrl);

  try {
    await sendEmail(email, subject, html);
  } catch (error) {
    console.error("Failed to send resolution notification:", error);
  }
};

export const sendDeadlineReminder = async (
  email: string,
  wishTitle: string,
  daysLeft: number,
  wishId: string,
) => {
  const wishUrl = `${process.env.FRONTEND_URL}/wish/${wishId}`;
  const subject = `Deadline reminder: ${wishTitle}`;
  const html = getDeadlineReminderTemplate(wishTitle, daysLeft, wishUrl);

  try {
    await sendEmail(email, subject, html);
  } catch (error) {
    console.error("Failed to send deadline reminder:", error);
  }
};
