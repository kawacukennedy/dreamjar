import crypto from "crypto";
import axios from "axios";
import Webhook from "../models/Webhook";

export const triggerWebhooks = async (event: string, data: any) => {
  const webhooks = await Webhook.find({ events: event, active: true });

  for (const webhook of webhooks) {
    const payload = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(payload)
      .digest("hex");

    try {
      await axios.post(webhook.url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
        },
        timeout: 5000,
      });
    } catch (error) {
      console.error(`Webhook failed for ${webhook.url}:`, error.message);
    }
  }
};
