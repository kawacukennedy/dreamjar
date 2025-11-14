import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to DreamJar! 🌟",
      content:
        "Transform your biggest dreams into reality with blockchain-powered accountability. Stake TON, get community support, and achieve the impossible together!",
      icon: "🎯",
      action: null,
    },
    {
      title: "Create Your Dream 💭",
      content:
        "Set ambitious goals, stake TON tokens as commitment, and invite supporters to pledge. Success unlocks all funds - failure helps social causes!",
      icon: "💰",
      action: { text: "See Examples", path: "/" },
    },
    {
      title: "Build Community 🤝",
      content:
        "Share progress proofs, get community validation through voting, and support others' dreams. Together, we turn dreams into achievements!",
      icon: "🌍",
      action: { text: "View Leaderboard", path: "/leaderboard" },
    },
    {
      title: "Secure & Decentralized 🔐",
      content:
        "Connect your TON wallet securely with TonConnect. Your dreams are backed by smart contracts - transparent, trustless, and unstoppable!",
      icon: "🔗",
      action: { text: "Connect Wallet", action: "connect" },
    },
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleAction = () => {
    const currentStep = steps[step];
    if (currentStep.action?.path) {
      navigate(currentStep.action.path);
      onComplete();
    } else if (currentStep.action?.action === "connect") {
      // This would trigger wallet connection
      onComplete();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setIsAnimating(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onComplete} title="" size="lg">
      <div className="text-center max-w-md mx-auto">
        <div
          className={`text-7xl mb-6 transition-all duration-300 ${isAnimating ? "scale-110 opacity-50" : "scale-100 opacity-100"}`}
        >
          {steps[step].icon}
        </div>

        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {steps[step].title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {steps[step].content}
        </p>

        {steps[step].action && (
          <button
            onClick={handleAction}
            className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 transition-all duration-200 mb-6 transform hover:scale-105"
          >
            {steps[step].action.text}
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <div className="flex space-x-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setStep(i);
                    setIsAnimating(false);
                  }, 150);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i === step
                    ? "bg-primary scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {step === steps.length - 1 ? "Get Started!" : "Next"}
            {step !== steps.length - 1 && (
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>

        <button
          onClick={onComplete}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        >
          Skip onboarding
        </button>
      </div>
    </Modal>
  );
};

export default Onboarding;
