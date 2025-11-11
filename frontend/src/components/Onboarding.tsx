import { useState } from "react";
import Modal from "./Modal";

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to DreamJar!",
      content:
        "Turn your dreams into smart contracts on TON. Create goals, get community support, and achieve together!",
      icon: "🎯",
    },
    {
      title: "Create Your Dream",
      content:
        "Set a goal, stake TON tokens, and invite supporters to pledge. If you succeed, unlock the funds!",
      icon: "💰",
    },
    {
      title: "Share & Support",
      content:
        "Post progress proofs and let the community vote on your success. Support others' dreams too!",
      icon: "🤝",
    },
    {
      title: "Connect Your Wallet",
      content:
        "Use TonConnect to securely connect your TON wallet and start building your dream jar!",
      icon: "🔗",
    },
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onComplete} title="">
      <div className="text-center">
        <div className="text-6xl mb-4">{steps[step].icon}</div>
        <h3 className="text-xl font-bold mb-2">{steps[step].title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {steps[step].content}
        </p>
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex space-x-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === step ? "bg-primary" : "bg-gray-300"}`}
              />
            ))}
          </div>
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition"
          >
            {step === steps.length - 1 ? "Get Started!" : "Next"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Onboarding;
