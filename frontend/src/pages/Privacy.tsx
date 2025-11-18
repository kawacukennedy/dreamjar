import React, { useState } from "react";

const Privacy: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: "collection",
      title: "📊 Information We Collect",
      content: (
        <div className="space-y-3">
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Account Information:</strong> Wallet address, display
              name, and profile data
            </li>
            <li>
              <strong>Dream Data:</strong> Goals, descriptions, stake amounts,
              and progress updates
            </li>
            <li>
              <strong>Interaction Data:</strong> Pledges, votes, comments, and
              social interactions
            </li>
            <li>
              <strong>Communication:</strong> Messages sent through our contact
              forms
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, and
              usage analytics
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "usage",
      title: "🎯 How We Use Your Information",
      content: (
        <div className="space-y-3">
          <p>Your information helps us:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and maintain the DreamJar platform</li>
            <li>Process TON blockchain transactions securely</li>
            <li>Facilitate community interactions and social features</li>
            <li>Send important updates about your dreams and pledges</li>
            <li>Improve our services through analytics and feedback</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
        </div>
      ),
    },
    {
      id: "sharing",
      title: "🤝 Information Sharing",
      content: (
        <div className="space-y-3">
          <p className="font-medium text-green-600 dark:text-green-400">
            We do NOT sell your personal information.
          </p>
          <p>We may share information in these limited circumstances:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Public Dreams:</strong> Goal descriptions and progress are
              visible to the community
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to
              protect rights
            </li>
            <li>
              <strong>Service Providers:</strong> Trusted partners who help
              operate our platform
            </li>
            <li>
              <strong>Blockchain:</strong> Transaction data is publicly visible
              on the TON network
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "security",
      title: "🔒 Data Security",
      content: (
        <div className="space-y-3">
          <p>We implement comprehensive security measures:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>End-to-end encryption for sensitive communications</li>
            <li>Secure wallet connections using industry standards</li>
            <li>Regular security audits and vulnerability testing</li>
            <li>Access controls and employee training</li>
            <li>Secure data storage with encryption at rest</li>
          </ul>
          <p className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
            <strong>Important:</strong> While we secure your data, blockchain
            transactions are public. Never share your private keys or seed
            phrases.
          </p>
        </div>
      ),
    },
    {
      id: "cookies",
      title: "🍪 Cookies & Tracking",
      content: (
        <div className="space-y-3">
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Remember your preferences and settings</li>
            <li>Analyze platform usage and performance</li>
            <li>Provide personalized recommendations</li>
            <li>Maintain your login session securely</li>
          </ul>
          <p>
            You can control cookie settings in your browser, though some
            features may not work properly without them.
          </p>
        </div>
      ),
    },
    {
      id: "blockchain",
      title: "⛓️ Blockchain Transparency",
      content: (
        <div className="space-y-3">
          <p>DreamJar operates on the TON blockchain, which provides:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Public Ledger:</strong> All transactions are visible
              on-chain
            </li>
            <li>
              <strong>Decentralized:</strong> No single entity controls the
              network
            </li>
            <li>
              <strong>Immutable:</strong> Transaction history cannot be altered
            </li>
            <li>
              <strong>Pseudonymous:</strong> Wallet addresses don't reveal
              personal identity
            </li>
          </ul>
          <p className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            Your wallet address and transaction amounts are publicly visible on
            the TON blockchain, but we don't link this data to your personal
            information without your consent.
          </p>
        </div>
      ),
    },
    {
      id: "rights",
      title: "⚖️ Your Rights & Choices",
      content: (
        <div className="space-y-3">
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Correction:</strong> Update inaccurate information
            </li>
            <li>
              <strong>Deletion:</strong> Request removal of your data
            </li>
            <li>
              <strong>Portability:</strong> Export your data in a usable format
            </li>
            <li>
              <strong>Opt-out:</strong> Unsubscribe from marketing
              communications
            </li>
          </ul>
          <p>Contact us at privacy@dreamjar.app to exercise these rights.</p>
        </div>
      ),
    },
    {
      id: "children",
      title: "👶 Children's Privacy",
      content: (
        <div className="space-y-3">
          <p className="font-medium">
            DreamJar is not intended for children under 13.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              We do not knowingly collect personal information from children
              under 13
            </li>
            <li>
              If we discover such collection, we will delete the information
              immediately
            </li>
            <li>
              Parents can contact us to review or delete their child's data
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "changes",
      title: "📝 Changes to This Policy",
      content: (
        <div className="space-y-3">
          <p>We may update this privacy policy to reflect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>New features or services</li>
            <li>Changes in data practices</li>
            <li>Legal or regulatory requirements</li>
          </ul>
          <p>
            We'll notify you of significant changes via email or platform
            announcement.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🔒 Privacy Policy</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your privacy matters to us. This policy explains how we collect, use,
          and protect your information.
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
            Questions about your privacy?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We're here to help. Contact our privacy team for any concerns or
            questions.
          </p>
          <a
            href="mailto:privacy@dreamjar.app"
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            📧 Contact Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
