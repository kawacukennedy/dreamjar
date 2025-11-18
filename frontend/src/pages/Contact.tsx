import React, { useState } from "react";
import { useToast } from "../contexts/ToastContext";

const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "normal",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"contact" | "faq" | "status">(
    "contact",
  );
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

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Support",
      description: "For detailed inquiries and account issues",
      contact: "support@dreamjar.app",
      responseTime: "24 hours",
      availability: "Mon-Fri, 9AM-6PM UTC",
      href: "mailto:support@dreamjar.app",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Instant help for urgent technical issues",
      contact: "@DreamJarSupport",
      responseTime: "< 5 minutes",
      availability: "24/7",
      href: "https://t.me/DreamJarSupport",
    },
    {
      icon: "🐦",
      title: "Twitter",
      description: "Follow us for updates and quick questions",
      contact: "@DreamJarApp",
      responseTime: "1-2 hours",
      availability: "Mon-Fri, 10AM-5PM UTC",
      href: "https://twitter.com/DreamJarApp",
    },
    {
      icon: "📖",
      title: "Documentation",
      description: "Self-service help and guides",
      contact: "docs.dreamjar.app",
      responseTime: "Instant",
      availability: "Always available",
      href: "https://docs.dreamjar.app",
    },
  ];

  const faqs = [
    {
      question: "How do I connect my wallet?",
      answer:
        "Click 'Connect Wallet' in the header and select your TON-compatible wallet like TonKeeper or TonHub.",
    },
    {
      question: "My transaction failed, what should I do?",
      answer:
        "Check your wallet balance, ensure sufficient TON for gas fees, and try again. Contact support if issues persist.",
    },
    {
      question: "How do I report inappropriate content?",
      answer:
        "Use the report button on any dream or comment, or contact us directly with details.",
    },
    {
      question: "Can I change my dream after creating it?",
      answer:
        "You can edit the description and upload new proofs, but stake amounts and deadlines are fixed once set.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">💬 Contact Us</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Have questions, feedback, or need help? We're here to support your
          dream journey!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { id: "contact", label: "📞 Contact Methods", icon: "📞" },
            { id: "faq", label: "❓ Quick Help", icon: "❓" },
            { id: "status", label: "📊 System Status", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Methods Tab */}
      {activeTab === "contact" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Choose Your Support Channel
            </h2>
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">{method.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {method.description}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Contact:</strong> {method.contact}
                        </p>
                        <p>
                          <strong>Response:</strong> {method.responseTime}
                        </p>
                        <p>
                          <strong>Available:</strong> {method.availability}
                        </p>
                      </div>
                      <a
                        href={method.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                      >
                        Contact Now →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              📝 Send Detailed Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">🤔 General Inquiry</option>
                    <option value="technical">🔧 Technical Support</option>
                    <option value="bug">🐛 Bug Report</option>
                    <option value="feature">💡 Feature Request</option>
                    <option value="partnership">🤝 Partnership</option>
                    <option value="billing">💰 Billing Question</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="low">🟢 Low - General question</option>
                    <option value="normal">🟡 Normal - Standard support</option>
                    <option value="high">🔴 High - Urgent issue</option>
                    <option value="critical">🚨 Critical - Service down</option>
                  </select>
                </div>
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
                  rows={6}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Please provide as much detail as possible about your question or issue..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.message.length}/2000 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !form.name ||
                  !form.email ||
                  !form.subject ||
                  !form.message
                }
                className="w-full bg-primary text-white p-3 rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
              >
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Can't find what you're looking for?
            </p>
            <button
              onClick={() => setActiveTab("contact")}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      {/* Status Tab */}
      {activeTab === "status" && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">System Status</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center border border-green-200 dark:border-green-800">
              <div className="text-4xl mb-2">🟢</div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                TON Blockchain
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Operational
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center border border-green-200 dark:border-green-800">
              <div className="text-4xl mb-2">🟢</div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                DreamJar API
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                All systems normal
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg text-center border border-yellow-200 dark:border-yellow-800">
              <div className="text-4xl mb-2">🟡</div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Maintenance
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Scheduled for tonight
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              For real-time status updates, follow us on Twitter or check our
              status page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
