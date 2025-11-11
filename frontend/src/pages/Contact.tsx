import React, { useState } from "react";
import { useToast } from "../contexts/ToastContext";

const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      addToast(
        "Message sent successfully! We'll get back to you soon.",
        "success",
      );
      setForm({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Have questions or feedback? We'd love to hear from you!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📧</span>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  support@dreamjar.app
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-3">🐦</span>
              <div>
                <h3 className="font-semibold">Twitter</h3>
                <p className="text-gray-600 dark:text-gray-400">@DreamJarApp</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-3">💬</span>
              <div>
                <h3 className="font-semibold">Telegram</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  @DreamJarSupport
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-3">📖</span>
              <div>
                <h3 className="font-semibold">Documentation</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  docs.dreamjar.app
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Response Time</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We typically respond to inquiries within 24 hours. For urgent
              technical issues, please check our status page or contact us on
              Telegram.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject *
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                placeholder="Tell us how we can help..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white p-3 rounded hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
