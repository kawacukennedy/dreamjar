import React, { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What is DreamJar?",
    answer:
      "DreamJar is a platform where you can turn your dreams and goals into smart contracts on the TON blockchain. Stake TON tokens, get support from the community, and achieve your goals together!",
  },
  {
    question: "How do I create a dream?",
    answer:
      "Click the '+' button or go to Create Dream. Fill in your goal details, set a stake amount in TON, and choose a deadline. Your dream becomes a smart contract on TON.",
  },
  {
    question: "How does pledging work?",
    answer:
      "Community members can pledge TON to support your dream. If you succeed, you keep the pledged amount. If you fail, the stake goes to supporters.",
  },
  {
    question: "What are categories?",
    answer:
      "Categories help organize dreams by type: Health & Fitness, Arts & Music, Education, Travel, etc. Use filters to find dreams that interest you.",
  },
  {
    question: "How do I connect my wallet?",
    answer:
      "Use the 'Connect Wallet' button in the header. We support TON-compatible wallets like TonKeeper, TonHub, and MyTonWallet.",
  },
  {
    question: "What are achievements?",
    answer:
      "Earn badges for milestones like creating your first dream, getting pledges, or completing goals. Check your Profile to see your achievements.",
  },
  {
    question: "Is DreamJar free?",
    answer:
      "Creating dreams and browsing is free. You only pay gas fees for blockchain transactions when creating dreams or pledging.",
  },
  {
    question: "How do I prove completion?",
    answer:
      "Upload photos, videos, or descriptions as proof when you complete your dream. The community can vote on validation.",
  },
];

const Help: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Find answers to common questions about DreamJar
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">For Dreamers</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>1. Connect your TON wallet</li>
              <li>2. Create your dream with details</li>
              <li>3. Set stake amount and deadline</li>
              <li>4. Share with community</li>
              <li>5. Work towards your goal</li>
              <li>6. Upload proof when complete</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">For Supporters</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>1. Browse dreams by category</li>
              <li>2. Read dream details and progress</li>
              <li>3. Pledge TON to support</li>
              <li>4. Follow dream progress</li>
              <li>5. Vote on proof validation</li>
              <li>6. Earn rewards for successful support</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                aria-expanded={openFAQ === index}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <span className="text-2xl">
                    {openFAQ === index ? "−" : "+"}
                  </span>
                </div>
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Can't find what you're looking for? Contact our support team.
        </p>
        <a
          href="/contact"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition inline-block"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default Help;
