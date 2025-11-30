import { useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface VerificationFlowProps {
  wishId: string;
  proofMethod: string;
  onVerify: (result: "success" | "failure") => Promise<void>;
}

export const VerificationFlow = ({
  wishId,
  proofMethod,
  onVerify,
}: VerificationFlowProps) => {
  const [step, setStep] = useState<"select" | "vote" | "proof" | "result">(
    "select",
  );
  const [vote, setVote] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!vote) return;
    setLoading(true);
    try {
      await onVerify(vote === "approve" ? "success" : "failure");
      setStep("result");
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "select":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Choose Verification Method
            </h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={() => setStep("vote")}
                className="w-full justify-start"
              >
                🗳️ Community Vote
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStep("proof")}
                className="w-full justify-start"
              >
                🔍 Proof Validation
              </Button>
            </div>
          </div>
        );

      case "vote":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Community Vote</h3>
            <p>Has the wish been successfully completed?</p>
            <div className="flex gap-4">
              <Button
                variant={vote === "approve" ? "primary" : "ghost"}
                onClick={() => setVote("approve")}
                className="flex-1"
              >
                ✅ Approve
              </Button>
              <Button
                variant={vote === "reject" ? "danger" : "ghost"}
                onClick={() => setVote("reject")}
                className="flex-1"
              >
                ❌ Reject
              </Button>
            </div>
            <Button onClick={handleVote} loading={loading} className="w-full">
              Submit Vote
            </Button>
          </div>
        );

      case "proof":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Proof Validation</h3>
            <p>Validate based on proof method: {proofMethod}</p>
            {/* Placeholder for proof validation */}
            <p className="text-neutral-500">Proof validation coming soon...</p>
          </div>
        );

      case "result":
        return (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Verification Complete</h3>
            <p>The wish has been verified!</p>
            <Button onClick={() => window.location.reload()}>Close</Button>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={true} onClose={() => {}} title="Verify Wish Completion">
      {renderStep()}
    </Modal>
  );
};
