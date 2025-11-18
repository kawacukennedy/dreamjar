import React, { useState } from "react";

const Terms: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: "acceptance",
      title: "📝 Acceptance of Terms",
      content: (
        <div className="space-y-3">
          <p>
            By accessing and using DreamJar, you accept and agree to be bound by
            the terms and provision of this agreement. If you do not agree to
            abide by the above, please do not use this service.
          </p>
          <p className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <strong>Key Agreement:</strong> These terms create a legally binding
            contract between you and DreamJar. Please read them carefully.
          </p>
        </div>
      ),
    },
    {
      id: "eligibility",
      title: "🎯 Eligibility & Account",
      content: (
        <div className="space-y-3">
          <p>To use DreamJar, you must:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Be at least 13 years old</li>
            <li>Have a valid TON-compatible wallet</li>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
          </ul>
          <p>
            You are responsible for all activities under your wallet address.
          </p>
        </div>
      ),
    },
    {
      id: "dreams",
      title: "🎨 Creating & Managing Dreams",
      content: (
        <div className="space-y-3">
          <p>When creating dreams, you agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide honest and achievable goals</li>
            <li>Set realistic deadlines and stake amounts</li>
            <li>Upload only content you own or have permission to use</li>
            <li>Respect intellectual property rights</li>
            <li>Not create dreams for illegal activities</li>
          </ul>
          <p>DreamJar reserves the right to remove inappropriate content.</p>
        </div>
      ),
    },
    {
      id: "pledging",
      title: "💰 Pledging & Transactions",
      content: (
        <div className="space-y-3">
          <p>Pledging involves real TON cryptocurrency:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>All transactions are final and irreversible</li>
            <li>You understand cryptocurrency volatility risks</li>
            <li>Gas fees apply to all blockchain transactions</li>
            <li>DreamJar does not provide financial advice</li>
          </ul>
          <p className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
            <strong>⚠️ Risk Warning:</strong> Cryptocurrency investments carry
            high risk. Only pledge what you can afford to lose.
          </p>
        </div>
      ),
    },
    {
      id: "community",
      title: "👥 Community Guidelines",
      content: (
        <div className="space-y-3">
          <p>Maintain a positive community by:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Being respectful and supportive of other users</li>
            <li>Not posting spam, harassment, or inappropriate content</li>
            <li>Using accurate information in dream descriptions</li>
            <li>Reporting violations to our moderation team</li>
            <li>Not attempting to manipulate votes or pledges</li>
          </ul>
          <p>Violations may result in content removal or account suspension.</p>
        </div>
      ),
    },
    {
      id: "liability",
      title: "⚖️ Disclaimers & Limitations",
      content: (
        <div className="space-y-3">
          <p className="font-medium">
            DreamJar provides services "as is" without warranties.
          </p>
          <p>We are not liable for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Loss of cryptocurrency due to failed dreams</li>
            <li>Technical issues or service interruptions</li>
            <li>Third-party actions or content</li>
            <li>Indirect or consequential damages</li>
          </ul>
          <p>Our total liability is limited to the amount you have pledged.</p>
        </div>
      ),
    },
    {
      id: "termination",
      title: "🚪 Account Termination",
      content: (
        <div className="space-y-3">
          <p>Either party may terminate this agreement:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>You:</strong> By ceasing to use the service
            </li>
            <li>
              <strong>Us:</strong> For violation of these terms
            </li>
          </ul>
          <p>
            Upon termination, your right to use DreamJar immediately ceases.
          </p>
        </div>
      ),
    },
    {
      id: "modifications",
      title: "📝 Changes to Terms",
      content: (
        <div className="space-y-3">
          <p>We may modify these terms at any time. Changes will be:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Posted on this page with an updated date</li>
            <li>Notified via email or platform announcement</li>
            <li>Effective immediately unless stated otherwise</li>
          </ul>
          <p>Continued use after changes constitutes acceptance.</p>
        </div>
      ),
    },
    {
      id: "governing",
      title: "🏛️ Governing Law",
      content: (
        <div className="space-y-3">
          <p>These terms are governed by applicable international law.</p>
          <p>Any disputes will be resolved through:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Good faith negotiation first</li>
            <li>Mediation if negotiation fails</li>
            <li>Binding arbitration as final resort</li>
          </ul>
          <p>You waive any right to participate in class action lawsuits.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📋 Terms of Service</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          These terms govern your use of DreamJar. Please read them carefully
          before using our platform.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6 border-l-4 border-yellow-400">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Important Notice
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              DreamJar involves real cryptocurrency transactions. By using our
              platform, you acknowledge the risks involved with blockchain
              technology and digital assets.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
              aria-expanded={expandedSection === section.id}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <span className="text-2xl transform transition-transform duration-200">
                  {expandedSection === section.id ? "−" : "+"}
                </span>
              </div>
            </button>
            {expandedSection === section.id && (
              <div className="px-6 pb-6">
                <div className="prose dark:prose-invert max-w-none">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            Questions about these terms?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our legal team is here to help clarify any questions you may have.
          </p>
          <a
            href="mailto:legal@dreamjar.app"
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            📧 Contact Legal Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default Terms;
