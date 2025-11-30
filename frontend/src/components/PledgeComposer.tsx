import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

interface PledgeComposerProps {
  isOpen: boolean;
  onClose: () => void;
  wishId: string;
  minPledge?: number;
  currencyLabel?: string;
  onPledge: (amount: number, note?: string) => Promise<void>;
}

export const PledgeComposer = ({
  isOpen,
  onClose,
  wishId,
  minPledge = 1000,
  currencyLabel = "TON",
  onPledge,
}: PledgeComposerProps) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (numAmount < minPledge / 1000000000) {
      alert(`Minimum pledge is ${minPledge / 1000000000} ${currencyLabel}`);
      return;
    }

    setLoading(true);
    try {
      await onPledge(numAmount * 1000000000, note);
      onClose();
      setAmount("");
      setNote("");
    } catch (error) {
      console.error("Pledge failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Make a Pledge">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount ({currencyLabel})
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min ${minPledge / 1000000000} ${currencyLabel}`}
            min={minPledge / 1000000000}
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Note (optional)
          </label>
          <textarea
            className="w-full h-20 p-3 border border-neutral-300 rounded-md resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a message..."
            maxLength={200}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Pledge
          </Button>
        </div>
      </div>
    </Modal>
  );
};
